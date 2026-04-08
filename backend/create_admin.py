import bcrypt
from db import get_db

def create_admin():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Check if admin exists
            cur.execute("SELECT id FROM users WHERE email = %s", ('admin@medicare.com',))
            if not cur.fetchone():
                # Hash the password
                password = 'admin123'
                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                
                # Create admin user
                cur.execute("""
                    INSERT INTO users (name, email, password, role)
                    VALUES (%s, %s, %s, %s)
                """, ('Admin', 'admin@medicare.com', hashed.decode('utf-8'), 'admin')
                )
                conn.commit()
                print("✅ Admin user created successfully!")
                print("📧 Email: admin@medicare.com")
                print("🔑 Password: admin123")
            else:
                print("ℹ️ Admin user already exists")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin()