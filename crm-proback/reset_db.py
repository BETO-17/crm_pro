from app.core.database import engine
from sqlalchemy import text

def reset_database():
    with engine.connect() as con:
        print("Dropping public schema...")
        con.execute(text("DROP SCHEMA public CASCADE;"))
        print("Recreating public schema...")
        con.execute(text("CREATE SCHEMA public;"))
        con.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        con.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        con.commit()
        print("Database reset complete.")

if __name__ == "__main__":
    reset_database()
