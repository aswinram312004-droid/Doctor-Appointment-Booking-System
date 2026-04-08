import os
from datetime import timedelta
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from schema import init_db
from auth import auth_bp, bcrypt as auth_bcrypt
from doctor import doctors_bp
from appointments import appointments_bp
from flask_cors import CORS

app = Flask(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-change-in-prod")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# ── Extensions ────────────────────────────────────────────────────────────────
jwt = JWTManager(app)
auth_bcrypt.init_app(app)  # share one Bcrypt instance

# ── Blueprints ────────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(doctors_bp)
app.register_blueprint(appointments_bp)

# ── Startup ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
    
    app.run(debug=True, port=5000)