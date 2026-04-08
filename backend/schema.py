# schema.py
from db import get_db

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    email       TEXT        NOT NULL UNIQUE,
    password    TEXT        NOT NULL,
    role        TEXT        NOT NULL DEFAULT 'patient'
                CHECK (role IN ('admin', 'patient')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    specialization  TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    phone           TEXT,
    available_from  TIME NOT NULL DEFAULT '09:00',
    available_to    TIME NOT NULL DEFAULT '17:00',
    slot_minutes    INT  NOT NULL DEFAULT 30,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_slots (
    id          SERIAL PRIMARY KEY,
    doctor_id   INT     NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date   DATE    NOT NULL,
    slot_time   TIME    NOT NULL,
    is_booked   BOOLEAN NOT NULL DEFAULT FALSE,
 );

CREATE TABLE IF NOT EXISTS appointments (
    id          SERIAL PRIMARY KEY,
    doctor_id   INT  NOT NULL REFERENCES doctors(id)     ON DELETE RESTRICT,
    patient_id  INT  NOT NULL REFERENCES users(id)       ON DELETE RESTRICT,
    slot_id     INT  NOT NULL REFERENCES time_slots(id)  ON DELETE RESTRICT,
    slot_date   DATE NOT NULL,
    slot_time   TIME NOT NULL,
    doctor_name TEXT,
    patient_name TEXT,
    notes       TEXT,
    status      TEXT NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'cancelled', 'completed', 'expired')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ,
    expiry_notified BOOLEAN DEFAULT FALSE,
 );

-- Create index for faster expiry checks
CREATE INDEX IF NOT EXISTS idx_appointments_expires_at ON appointments(expires_at) 
WHERE status = 'confirmed';
"""

def init_db():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(SCHEMA)
        conn.commit()
        print("   ✅ Database tables created successfully!")
    except Exception as e:
        print(f"   ❌ Error creating tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()