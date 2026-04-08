from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from functools import wraps
from datetime import datetime, timedelta
import psycopg2
from db import get_db

doctors_bp = Blueprint("doctors", __name__, url_prefix="/doctors")

def _error(msg, code=400):
    return jsonify({"error": msg}), code

def _ok(data, code=200):
    return jsonify(data), code

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if get_jwt().get("role") != "admin":
            return _error("Admin access required", 403)
        return fn(*args, **kwargs)
    return wrapper

def _fmt_doctor(d):
    d = dict(d)
    if d.get("available_from"):
        d["available_from"] = str(d["available_from"])
    if d.get("available_to"):
        d["available_to"] = str(d["available_to"])
    return d

def generate_slots(doctor_id, slot_date, avail_from, avail_to, slot_minutes, conn):
    current = datetime.combine(slot_date, avail_from)
    end     = datetime.combine(slot_date, avail_to)
    with conn.cursor() as cur:
        while current < end:
            cur.execute("""
                INSERT INTO time_slots (doctor_id, slot_date, slot_time)
                VALUES (%s, %s, %s) ON CONFLICT DO NOTHING
            """, (doctor_id, slot_date, current.time()))
            current += timedelta(minutes=slot_minutes)

# ── GET /doctors ──────────────────────────────────────────────────────────────
@doctors_bp.route("", methods=["GET"])
@jwt_required()
def list_doctors():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, specialization, email, phone,
                       available_from, available_to, slot_minutes, is_active
                FROM doctors ORDER BY name
            """)
            return _ok([_fmt_doctor(r) for r in cur.fetchall()])
    finally:
        conn.close()

# ── POST /doctors (admin only) ────────────────────────────────────────────────
@doctors_bp.route("", methods=["POST"])
@admin_required
def add_doctor():
    data           = request.get_json(silent=True) or {}
    name           = (data.get("name") or "").strip()
    specialization = (data.get("specialization") or "").strip()
    email          = (data.get("email") or "").strip().lower()
    phone          = data.get("phone", "")
    avail_from     = data.get("available_from", "09:00")
    avail_to       = data.get("available_to",   "17:00")
    slot_minutes   = int(data.get("slot_minutes", 30))
    is_active      = data.get("is_active", True)

    if not name or not specialization or not email:
        return _error("name, specialization and email are required")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO doctors
                    (name, specialization, email, phone,
                     available_from, available_to, slot_minutes, is_active)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id, name, specialization, email, phone,
                          available_from, available_to, slot_minutes, is_active
            """, (name, specialization, email, phone,
                  avail_from, avail_to, slot_minutes, is_active))
            doc = cur.fetchone()
        conn.commit()
        return _ok(_fmt_doctor(doc), 201)
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return _error("Doctor email already exists", 409)
    finally:
        conn.close()

# ── PUT /doctors/<id> (admin only) ────────────────────────────────────────────
# ── PUT /doctors/<id> (admin only) ────────────────────────────────────────────
@doctors_bp.route("/<int:doc_id>", methods=["PUT"])
@admin_required
def update_doctor(doc_id):
    data = request.get_json(silent=True) or {}
    
    conn = get_db()
    try:
        # Check if doctor exists
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM doctors WHERE id = %s", (doc_id,))
            if not cur.fetchone():
                return _error("Doctor not found", 404)
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        updatable_fields = ["name", "specialization", "email", "phone", 
                           "available_from", "available_to", "slot_minutes", "is_active"]
        
        for field in updatable_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                params.append(data[field])
        
        if not update_fields:
            return _error("No fields to update", 400)
        
        params.append(doc_id)
        query = f"UPDATE doctors SET {', '.join(update_fields)} WHERE id = %s RETURNING *"
        
        with conn.cursor() as cur:
            cur.execute(query, params)
            doc = cur.fetchone()
        
        conn.commit()
        return _ok(_fmt_doctor(doc))
        
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return _error("Email already exists", 409)
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error updating doctor: {e}")
        return _error(f"Database error: {str(e)}", 500)
    except Exception as e:
        conn.rollback()
        print(f"Error updating doctor: {e}")
        return _error(f"Error updating doctor: {str(e)}", 500)
    finally:
        conn.close() 
        
        
        
        
        
        
        
        

 # ── DELETE /doctors/<id> (admin only) ─────────────────────────────────────────
@doctors_bp.route("/<int:doc_id>", methods=["DELETE"])
@admin_required
def delete_doctor(doc_id):
    conn = get_db()
    try:
        # First, check if doctor exists
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM doctors WHERE id = %s", (doc_id,))
            doctor = cur.fetchone()
            
            if not doctor:
                return _error("Doctor not found", 404)
        
        # Check if doctor has any active appointments (not cancelled or expired)
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COUNT(*) as count FROM appointments 
                WHERE doctor_id = %s AND status NOT IN ('cancelled', 'expired')
            """, (doc_id,))
            result = cur.fetchone()
            active_appointments = result['count'] if result else 0
            
            if active_appointments > 0:
                return _error(
                    f"Cannot delete doctor with {active_appointments} active appointment(s). Please deactivate the doctor instead.", 
                    400
                )
        
        # Delete doctor's time slots first (due to foreign key constraint)
        with conn.cursor() as cur:
            cur.execute("DELETE FROM time_slots WHERE doctor_id = %s", (doc_id,))
        
        # Delete doctor's appointments
        with conn.cursor() as cur:
            cur.execute("DELETE FROM appointments WHERE doctor_id = %s", (doc_id,))
        
        # Finally delete the doctor
        with conn.cursor() as cur:
            cur.execute("DELETE FROM doctors WHERE id = %s RETURNING id", (doc_id,))
            deleted = cur.fetchone()
        
        conn.commit()
        
        if deleted:
            return _ok({"message": f"Doctor '{doctor['name']}' deleted successfully"})
        return _error("Doctor not found", 404)
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error deleting doctor: {e}")
        return _error(f"Database error: {str(e)}", 500)
    except Exception as e:
        conn.rollback()
        print(f"Error deleting doctor: {e}")
        return _error(f"Error deleting doctor: {str(e)}", 500)
    finally:
        conn.close()



# ── GET /doctors/<id> ─────────────────────────────────────────────────────────
@doctors_bp.route("/<int:doc_id>", methods=["GET"])
@jwt_required()
def get_doctor(doc_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, specialization, email, phone,
                       available_from, available_to, slot_minutes, is_active
                FROM doctors WHERE id = %s
            """, (doc_id,))
            doc = cur.fetchone()
        if not doc:
            return _error("Doctor not found", 404)
        return _ok(_fmt_doctor(doc))
    finally:
        conn.close()

# ── GET /doctors/<id>/slots?date=YYYY-MM-DD ───────────────────────────────────
@doctors_bp.route("/<int:doc_id>/slots", methods=["GET"])
@jwt_required()
def get_slots(doc_id):
    date_str = request.args.get("date", "")
    try:
        slot_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return _error("date query param required in format YYYY-MM-DD")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM doctors WHERE id = %s", (doc_id,))
            doc = cur.fetchone()
        if not doc:
            return _error("Doctor not found", 404)

        generate_slots(
            doc_id, slot_date,
            doc["available_from"], doc["available_to"],
            doc["slot_minutes"], conn
        )
        conn.commit()

        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, slot_time, is_booked
                FROM time_slots
                WHERE doctor_id = %s AND slot_date = %s
                ORDER BY slot_time
            """, (doc_id, slot_date))
            slots = [{"id": r["id"], "slot_time": str(r["slot_time"]), "is_booked": r["is_booked"]}
                     for r in cur.fetchall()]

        return _ok({"doctor_id": doc_id, "date": date_str, "slots": slots})
    finally:
        conn.close()