from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_bcrypt import Bcrypt
import psycopg2
from db import get_db

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
bcrypt  = Bcrypt()

def _error(msg, code=400):
    return jsonify({"error": msg}), code

def _ok(data, code=200):
    return jsonify(data), code


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data     = request.get_json(silent=True) or {}
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "patient")

    if not name or not email or not password:
        return _error("name, email and password are required")
    if role not in ("admin", "patient"):
        return _error("role must be 'admin' or 'patient'")
    if len(password) < 6:
        return _error("password must be at least 6 characters")

    hashed = bcrypt.generate_password_hash(password).decode()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO users (name, email, password, role)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, email, role
            """, (name, email, hashed, role))
            user = dict(cur.fetchone())
        conn.commit()
        token = create_access_token(
            identity=str(user["id"]),
            additional_claims={"role": user["role"]}
        )
        return _ok({"message": "Signup successful", "token": token, "user": user}, 201)
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return _error("Email already registered", 409)
    finally:
        conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return _error("email and password are required")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
    finally:
        conn.close()

    if not user or not bcrypt.check_password_hash(user["password"], password):
        return _error("Invalid credentials", 401)

    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"role": user["role"]}
    )
    return _ok({
        "token": token,
        "user": {
            "id":    user["id"],
            "name":  user["name"],
            "email": user["email"],
            "role":  user["role"],
        }
    })