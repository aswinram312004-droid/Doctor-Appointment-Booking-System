# setup.py - Run this once to set up your database
import psycopg2
from psycopg2.extras import RealDictCursor
import os

# Database connection parameters (without database name)
BASE_PARAMS = {
    'host': 'localhost',
    'user': 'postgres',
    'password': '1234',  
    'port': '5432'
}

DB_NAME = 'appointment_db'

def create_database():
    """Create database if it doesn't exist"""
    try:
        # Connect to default postgres database
        # Fix: Create a copy of BASE_PARAMS and add database
        params = BASE_PARAMS.copy()
        params['database'] = 'postgres'
        conn = psycopg2.connect(**params)
        conn.autocommit = True
        
        with conn.cursor() as cur:
            # Check if database exists
            cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
            exists = cur.fetchone()
            
            if not exists:
                print(f"📦 Creating database '{DB_NAME}'...")
                cur.execute(f"CREATE DATABASE {DB_NAME}")
                print(f"✅ Database '{DB_NAME}' created successfully!")
            else:
                print(f"✓ Database '{DB_NAME}' already exists")
                
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def test_connection():
    """Test connection to the database"""
    try:
        # Fix: Create a copy of BASE_PARAMS and add database
        params = BASE_PARAMS.copy()
        params['database'] = DB_NAME
         
        conn = psycopg2.connect(**params)
        
        with conn.cursor() as cur:
            cur.execute("SELECT version()")
            version = cur.fetchone()
            print(f"✅ Connected to PostgreSQL: {version['version'][:50]}...")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Appointment System Database")
    print("=" * 50)
    
    # Step 1: Create database
    if create_database():
        # Step 2: Test connection
        test_connection()
        
        print("\n📝 Next steps:")
        print("1. Create a .env file with:")
        print(f"   DB_NAME={DB_NAME}")
        print("   DB_USER=postgres")
        print("   DB_PASSWORD=1234")
        print("2. Run: python app.py")