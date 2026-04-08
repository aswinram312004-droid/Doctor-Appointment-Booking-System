# appointments.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
import psycopg2
from db import get_db
from datetime import datetime, timedelta
import logging

appointments_bp = Blueprint("appointments", __name__, url_prefix="/appointments")

# Configure logging
logger = logging.getLogger(__name__)

def _error(msg, code=400):
    return jsonify({"error": msg}), code

def _ok(data, code=200):
    return jsonify(data), code

def calculate_expiry_time(slot_date, slot_time, slot_minutes=30):
    """Calculate when an appointment expires (end of the appointment time)"""
    try:
        if isinstance(slot_time, str):
            time_obj = datetime.strptime(slot_time, "%H:%M:%S").time()
        else:
            time_obj = slot_time
            
        expiry = datetime.combine(slot_date, time_obj) + timedelta(minutes=slot_minutes)
        return expiry
    except Exception as e:
        logger.error(f"Error calculating expiry time: {e}")
        # Fallback: expire at end of the day
        return datetime.combine(slot_date, datetime.max.time())

def validate_slot_time(slot_time_str):
    """Validate and parse slot time from various formats"""
    formats = ["%I:%M %p", "%H:%M:%S", "%H:%M"]
    for fmt in formats:
        try:
            return datetime.strptime(slot_time_str, fmt).time()
        except ValueError:
            continue
    raise ValueError(f"Invalid time format: {slot_time_str}")

def validate_slot_date(slot_date_str):
    """Validate and parse slot date from various formats"""
    # Try different date formats
    formats = [
        "%Y-%m-%d",           # 2024-04-09
        "%a %b %d",          # Wed Apr 09
        "%A %B %d",          # Wednesday April 09
        "%d/%m/%Y",          # 09/04/2024
        "%m/%d/%Y",          # 04/09/2024
        "%d-%m-%Y",          # 09-04-2024
        "%b %d %Y",          # Apr 09 2024
        "%B %d %Y",          # April 09 2024
    ]
    
    for fmt in formats:
        try:
            # Try to parse with current year if not provided
            parsed = datetime.strptime(slot_date_str, fmt)
            
            # If year is 1900 (when not specified), add current year
            if parsed.year == 1900:
                current_year = datetime.now().year
                parsed = parsed.replace(year=current_year)
            
            return parsed.date()
        except ValueError:
            continue
    
    # Special handling for formats like "Wed Apr 09" (missing year)
    try:
        # Try to parse with current year
        current_year = datetime.now().year
        with_year = f"{slot_date_str} {current_year}"
        parsed = datetime.strptime(with_year, "%a %b %d %Y")
        return parsed.date()
    except ValueError:
        pass
    
    raise ValueError(f"Invalid date format: {slot_date_str}")

# ── POST /appointments ─────────────────────────────────────────────────────────
@appointments_bp.route("", methods=["POST"])
@jwt_required()
def book_appointment():
    patient_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    doctor_id = data.get("doctor_id")
    slot_date = data.get("slot_date")
    slot_time = data.get("slot_time")
    notes = data.get("notes", "")

    if not all([doctor_id, slot_date, slot_time]):
        return _error("doctor_id, slot_date, and slot_time are required")

    conn = get_db()
    try:
        # 1. Patient check
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email FROM users WHERE id = %s",
                (patient_id,)
            )
            patient = cur.fetchone()

        if not patient:
            return _error("Patient not found", 404)

        # 2. Doctor check with active status
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, specialization, slot_minutes, is_active 
                FROM doctors WHERE id = %s
            """, (doctor_id,))
            doctor = cur.fetchone()

        if not doctor:
            return _error("Doctor not found", 404)
        
        if not doctor.get("is_active", True):
            return _error("Doctor is not available for appointments", 400)

        # 3. Parse date & time with flexible formats
        try:
            # Use flexible date parser
            parsed_date = validate_slot_date(slot_date)
            
            # Validate date is not in the past
            if parsed_date < datetime.now().date():
                return _error("Cannot book appointments for past dates", 400)
            
            parsed_time = validate_slot_time(slot_time)
            
        except ValueError as e:
            return _error(f"Invalid date/time format: {str(e)}", 400)

        # 4. Find OR CREATE slot with proper locking
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, slot_date, slot_time, is_booked
                FROM time_slots
                WHERE doctor_id = %s
                  AND slot_date = %s
                  AND slot_time = %s
                FOR UPDATE
            """, (doctor_id, parsed_date, parsed_time))

            slot = cur.fetchone()

            # Auto create slot if doesn't exist
            if not slot:
                cur.execute("""
                    INSERT INTO time_slots (doctor_id, slot_date, slot_time, is_booked)
                    VALUES (%s, %s, %s, FALSE)
                    RETURNING id, slot_date, slot_time, is_booked
                """, (doctor_id, parsed_date, parsed_time))

                slot = cur.fetchone()

            # Check if already booked
            if slot["is_booked"]:
                return _error("Slot already booked", 409)

            # Check for existing appointment for same patient at same time
            cur.execute("""
                SELECT a.id FROM appointments a
                JOIN time_slots ts ON a.slot_id = ts.id
                WHERE a.patient_id = %s 
                  AND ts.slot_date = %s 
                  AND ts.slot_time = %s
                  AND a.status NOT IN ('cancelled', 'expired')
            """, (patient_id, parsed_date, parsed_time))
            
            if cur.fetchone():
                return _error("You already have an appointment at this time", 409)

        # 5. Calculate expiry time
        slot_duration = doctor.get("slot_minutes", 30)
        expiry_time = calculate_expiry_time(parsed_date, parsed_time, slot_duration)

        # 6. Insert appointment
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO appointments
                    (doctor_id, doctor_name, patient_id, patient_name,
                     slot_id, slot_date, slot_time, notes, expires_at, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'confirmed')
                RETURNING id, doctor_id, doctor_name, patient_id, patient_name,
                          slot_date, slot_time, notes, status, created_at, expires_at
            """, (
                doctor_id,
                doctor["name"],
                patient_id,
                patient["name"],
                slot["id"],
                parsed_date,
                parsed_time,
                notes,
                expiry_time
            ))

            appt = dict(cur.fetchone())

            # Mark slot as booked
            cur.execute(
                "UPDATE time_slots SET is_booked = TRUE, booked_by = %s WHERE id = %s",
                (patient_id, slot["id"])
            )

        conn.commit()
        
        # Format response
        appt["slot_date"] = appt["slot_date"].isoformat()
        appt["slot_time"] = appt["slot_time"].strftime("%H:%M:%S")
        appt["created_at"] = appt["created_at"].isoformat()
        appt["expires_at"] = appt["expires_at"].isoformat() if appt["expires_at"] else None

        logger.info(f"Appointment booked successfully: ID {appt['id']} for patient {patient_id}")
        return _ok({"message": "Appointment booked", "appointment": appt}, 201)

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return _error("Slot already taken", 409)
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Database error booking appointment: {e}")
        return _error("Database error occurred", 500)
    except Exception as e:
        conn.rollback()
        logger.error(f"Error booking appointment: {e}")
        return _error(f"Internal server error: {str(e)}", 500)
    finally:
        conn.close()
        
# ── GET /appointments/doctors/<id>/slots ──────────────────────────────────────
@appointments_bp.route("/doctors/<int:doctor_id>/slots", methods=["GET"])
@jwt_required()
def get_doctor_slots(doctor_id):
    """Get available slots for a doctor"""
    date_filter = request.args.get("date")  # Optional date filter
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            if date_filter:
                try:
                    # Try to parse date in multiple formats
                    try:
                        filter_date = validate_slot_date(date_filter)
                    except ValueError:
                        filter_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
                    
                    cur.execute("""
                        SELECT id, slot_date, slot_time, is_booked, booked_by
                        FROM time_slots
                        WHERE doctor_id = %s 
                          AND slot_date = %s
                          AND slot_date >= CURRENT_DATE
                        ORDER BY slot_time
                    """, (doctor_id, filter_date))
                except ValueError:
                    return _error("Invalid date format. Please use YYYY-MM-DD or Mon DD format", 400)
            else:
                cur.execute("""
                    SELECT id, slot_date, slot_time, is_booked, booked_by
                    FROM time_slots
                    WHERE doctor_id = %s AND slot_date >= CURRENT_DATE
                    ORDER BY slot_date, slot_time
                """, (doctor_id,))
            
            slots = [dict(r) for r in cur.fetchall()]

        for slot in slots:
            slot["slot_date"] = slot["slot_date"].isoformat()
            slot["slot_time"] = str(slot["slot_time"])

        return _ok(slots)
    finally:
        conn.close()

# ── GET /appointments/expired-notifications ────────────────────────────────────
@appointments_bp.route("/expired-notifications", methods=["GET"])
@jwt_required()
def get_expired_notifications():
    """Get list of appointments that have expired for the current user"""
    user_id = int(get_jwt_identity())
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Get expired appointments that haven't been notified yet
            cur.execute("""
                SELECT a.id, a.slot_date, a.slot_time, a.doctor_name, 
                       a.status, a.expires_at, a.expiry_notified,
                       d.specialization
                FROM appointments a
                JOIN doctors d ON d.id = a.doctor_id
                WHERE a.patient_id = %s 
                  AND a.expires_at <= NOW()
                  AND a.status = 'confirmed'
                  AND a.expiry_notified = FALSE
                ORDER BY a.expires_at DESC
            """, (user_id,))
            
            expired = [dict(r) for r in cur.fetchall()]
            
        for appt in expired:
            appt["slot_date"] = appt["slot_date"].isoformat()
            appt["slot_time"] = str(appt["slot_time"])
            appt["expires_at"] = appt["expires_at"].isoformat() if appt["expires_at"] else None
            
        return _ok(expired)
    finally:
        conn.close()

# ── POST /appointments/<id>/mark-expiry-notified ───────────────────────────────
@appointments_bp.route("/<int:appointment_id>/mark-expiry-notified", methods=["POST"])
@jwt_required()
def mark_expiry_notified(appointment_id):
    """Mark that the user has been notified about an expired appointment"""
    user_id = int(get_jwt_identity())
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Verify ownership and get slot_id to free up the slot
            cur.execute("""
                SELECT a.id, a.slot_id, a.status
                FROM appointments a
                WHERE a.id = %s AND a.patient_id = %s
            """, (appointment_id, user_id))
            
            appointment = cur.fetchone()
            
            if not appointment:
                return _error("Appointment not found", 404)
            
            # Free up the time slot
            cur.execute("""
                UPDATE time_slots 
                SET is_booked = FALSE, booked_by = NULL
                WHERE id = %s
            """, (appointment["slot_id"],))
            
            # Mark as expired and notified
            cur.execute("""
                UPDATE appointments 
                SET expiry_notified = TRUE,
                    status = 'expired'
                WHERE id = %s AND patient_id = %s
                RETURNING id
            """, (appointment_id, user_id))
            
        conn.commit()
        return _ok({"message": "Expiry notification acknowledged"})
    except Exception as e:
        conn.rollback()
        logger.error(f"Error marking expiry notified: {e}")
        return _error("Internal server error", 500)
    finally:
        conn.close()

# ── GET /appointments ──────────────────────────────────────────────────────────
@appointments_bp.route("", methods=["GET"])
@jwt_required()
def list_appointments():
    user_id = int(get_jwt_identity())
    is_admin = get_jwt().get("role") == "admin"

    status_filter = request.args.get("status")
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            query = """
                SELECT 
                    a.id, a.notes, a.status, a.created_at, a.expires_at, a.expiry_notified,

                    d.id AS doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    d.email AS doctor_email,
                    d.phone AS doctor_phone,

                    u.id AS patient_id,
                    u.name AS patient_name,
                    u.email AS patient_email,

                    ts.id AS slot_id,
                    ts.slot_date,
                    ts.slot_time,
                    ts.is_booked

                FROM appointments a
                JOIN doctors d ON d.id = a.doctor_id
                JOIN users u ON u.id = a.patient_id
                JOIN time_slots ts ON ts.id = a.slot_id
                WHERE 1=1
            """

            params = []

            # 👇 restrict only if NOT admin
            if not is_admin:
                query += " AND a.patient_id = %s"
                params.append(user_id)

            # Filters
            if status_filter:
                query += " AND a.status = %s"
                params.append(status_filter)

            if from_date:
                query += " AND a.slot_date >= %s"
                params.append(from_date)

            if to_date:
                query += " AND a.slot_date <= %s"
                params.append(to_date)

            query += " ORDER BY a.slot_date DESC, a.slot_time"

            cur.execute(query, params)
            rows = [dict(r) for r in cur.fetchall()]

        # Format response
        formatted = []
        for r in rows:
            formatted.append({
                "id": r["id"],
                "status": r["status"],
                "notes": r["notes"],
                "created_at": r["created_at"].isoformat(),
                "expires_at": r["expires_at"].isoformat() if r.get("expires_at") else None,

                "doctor": {
                    "id": r["doctor_id"],
                    "name": r["doctor_name"],
                    "specialization": r["specialization"],
                    "email": r["doctor_email"],
                    "phone": r["doctor_phone"]
                },

                "patient": {
                    "id": r["patient_id"],
                    "name": r["patient_name"],
                    "email": r["patient_email"]
                },

                "slot": {
                    "id": r["slot_id"],
                    "date": r["slot_date"].isoformat(),
                    "time": str(r["slot_time"]),
                    "is_booked": r["is_booked"]
                }
            })

        return _ok(formatted)

    finally:
        conn.close()


# ── GET /appointments/<id> ─────────────────────────────────────────────────────
@appointments_bp.route("/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment(appointment_id):
    """Get a specific appointment by ID"""
    user_id = int(get_jwt_identity())
    is_admin = get_jwt().get("role") == "admin"
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            if is_admin:
                cur.execute("""
                    SELECT a.*, d.specialization, u.email AS patient_email,
                           u.phone AS patient_phone
                    FROM appointments a
                    JOIN doctors d ON d.id = a.doctor_id
                    JOIN users u ON u.id = a.patient_id
                    WHERE a.id = %s
                """, (appointment_id,))
            else:
                cur.execute("""
                    SELECT a.*, d.specialization
                    FROM appointments a
                    JOIN doctors d ON d.id = a.doctor_id
                    WHERE a.id = %s AND a.patient_id = %s
                """, (appointment_id, user_id))
            
            appointment = cur.fetchone()
            
            if not appointment:
                return _error("Appointment not found", 404)
            
            appt_dict = dict(appointment)
            appt_dict["slot_date"] = appt_dict["slot_date"].isoformat()
            appt_dict["slot_time"] = str(appt_dict["slot_time"])
            appt_dict["created_at"] = appt_dict["created_at"].isoformat()
            if appt_dict.get("expires_at"):
                appt_dict["expires_at"] = appt_dict["expires_at"].isoformat()
            
            return _ok(appt_dict)
    finally:
        conn.close()

# ── DELETE /appointments/<id> ──────────────────────────────────────────────────
@appointments_bp.route("/<int:appointment_id>", methods=["DELETE"])
@jwt_required()
def cancel_appointment(appointment_id):
    """Cancel an appointment and free up the time slot"""
    user_id = int(get_jwt_identity())
    is_admin = get_jwt().get("role") == "admin"
    
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Get appointment details
            if is_admin:
                cur.execute("""
                    SELECT id, slot_id, patient_id, status
                    FROM appointments 
                    WHERE id = %s
                """, (appointment_id,))
            else:
                cur.execute("""
                    SELECT id, slot_id, patient_id, status
                    FROM appointments 
                    WHERE id = %s AND patient_id = %s
                """, (appointment_id, user_id))
            
            appointment = cur.fetchone()
            
            if not appointment:
                return _error("Appointment not found or access denied", 404)
            
            # Don't allow cancelling already cancelled/expired appointments
            if appointment["status"] in ["cancelled", "expired"]:
                return _error(f"Appointment already {appointment['status']}", 400)
            
            # Free up the time slot
            cur.execute("""
                UPDATE time_slots 
                SET is_booked = FALSE, booked_by = NULL
                WHERE id = %s
            """, (appointment["slot_id"],))
            
            # Update appointment status
            cur.execute("""
                UPDATE appointments 
                SET status = 'cancelled'
                WHERE id = %s
                RETURNING id
            """, (appointment_id,))
            
            conn.commit()
            
            logger.info(f"Appointment {appointment_id} cancelled by user {user_id}")
            return _ok({"message": "Appointment cancelled successfully"})
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Error cancelling appointment: {e}")
        return _error("Internal server error", 500)
    finally:
        conn.close()

# ── POST /appointments/<id>/reschedule ─────────────────────────────────────────
@appointments_bp.route("/<int:appointment_id>/reschedule", methods=["POST"])
@jwt_required()
def reschedule_appointment(appointment_id):
    """Reschedule an existing appointment"""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    
    new_slot_date = data.get("slot_date")
    new_slot_time = data.get("slot_time")
    
    if not all([new_slot_date, new_slot_time]):
        return _error("slot_date and slot_time are required", 400)
    
    conn = get_db()
    try:
        # First, get the existing appointment
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.id, a.slot_id, a.doctor_id, a.status, ts.slot_date, ts.slot_time
                FROM appointments a
                JOIN time_slots ts ON a.slot_id = ts.id
                WHERE a.id = %s AND a.patient_id = %s
                FOR UPDATE
            """, (appointment_id, user_id))
            
            appointment = cur.fetchone()
            
            if not appointment:
                return _error("Appointment not found", 404)
            
            if appointment["status"] in ["cancelled", "expired"]:
                return _error(f"Cannot reschedule a {appointment['status']} appointment", 400)
        
        # Parse new date and time with flexible formats
        try:
            parsed_date = validate_slot_date(new_slot_date)
            if parsed_date < datetime.now().date():
                return _error("Cannot reschedule to past dates", 400)
            parsed_time = validate_slot_time(new_slot_time)
        except ValueError as e:
            return _error(f"Invalid date/time format: {str(e)}", 400)
        
        # Find or create new slot
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, slot_date, slot_time, is_booked
                FROM time_slots
                WHERE doctor_id = %s
                  AND slot_date = %s
                  AND slot_time = %s
                FOR UPDATE
            """, (appointment["doctor_id"], parsed_date, parsed_time))
            
            new_slot = cur.fetchone()
            
            if not new_slot:
                cur.execute("""
                    INSERT INTO time_slots (doctor_id, slot_date, slot_time, is_booked)
                    VALUES (%s, %s, %s, FALSE)
                    RETURNING id, slot_date, slot_time, is_booked
                """, (appointment["doctor_id"], parsed_date, parsed_time))
                new_slot = cur.fetchone()
            
            if new_slot["is_booked"]:
                return _error("New slot is already booked", 409)
            
            # Free up old slot
            cur.execute("""
                UPDATE time_slots 
                SET is_booked = FALSE, booked_by = NULL
                WHERE id = %s
            """, (appointment["slot_id"],))
            
            # Calculate new expiry time
            doctor = None
            with conn.cursor() as cur2:
                cur2.execute("SELECT slot_minutes FROM doctors WHERE id = %s", (appointment["doctor_id"],))
                doctor = cur2.fetchone()
            
            slot_duration = doctor["slot_minutes"] if doctor else 30
            new_expiry = calculate_expiry_time(parsed_date, parsed_time, slot_duration)
            
            # Update appointment with new slot
            cur.execute("""
                UPDATE appointments
                SET slot_id = %s, slot_date = %s, slot_time = %s,
                    expires_at = %s, status = 'confirmed'
                WHERE id = %s
                RETURNING id, slot_date, slot_time
            """, (
                new_slot["id"],
                parsed_date,
                parsed_time,
                new_expiry,
                appointment_id
            ))
            
            # Book new slot
            cur.execute("""
                UPDATE time_slots 
                SET is_booked = TRUE, booked_by = %s
                WHERE id = %s
            """, (user_id, new_slot["id"]))
            
            conn.commit()
            
            return _ok({"message": "Appointment rescheduled successfully"})
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Error rescheduling appointment: {e}")
        return _error("Internal server error", 500)
    finally:
        conn.close()