# check_db.py
import psycopg2

def check_postgres():
    print("🔍 Checking PostgreSQL connection...")
    
    # Try connecting without database
    try:
        conn = psycopg2.connect(
            host="localhost",
            user="postgres",
            password="1234",  # Add your password here if needed
            port="5432",
            database="postgres"
        )
        print("✅ PostgreSQL is running")
        
        with conn.cursor() as cur:
            # List all databases
            cur.execute("SELECT datname FROM pg_database")
            databases = [row[0] for row in cur.fetchall()]
            print(f"📊 Available databases: {', '.join(databases)}")
            
            # Check if appointment_db exists
            if 'appointment_db' in databases:
                print("✅ appointment_db exists")
                
                # Connect to appointment_db
                conn.close()
                conn = psycopg2.connect(
                    host="localhost",
                    user="postgres",
                    password="1234",
                    port="5432",
                    database="appointment_db"
                )
                
                with conn.cursor() as cur2:
                    # List tables
                    cur2.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                    """)
                    tables = [row[0] for row in cur2.fetchall()]
                    
                    if tables:
                        print(f"📋 Tables in appointment_db: {', '.join(tables)}")
                    else:
                        print("📋 No tables found in appointment_db")
            else:
                print("❌ appointment_db does not exist")
                print("   Run: CREATE DATABASE appointment_db;")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your username and password")
        print("3. Default port is 5432")
        print("4. If using a password, add it to the connection string")

if __name__ == "__main__":
    check_postgres()