from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2


DATABASE_URL = "postgresql+psycopg2://avnadmin:AVNS_lzJsq0hZSifN3XBhCQj@scora-scora.h.aivencloud.com:12159/defaultdb?sslmode=require"


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_connection():
    conn = psycopg2.connect(
        "postgres://avnadmin:AVNS_lzJsq0hZSifN3XBhCQj@scora-scora.h.aivencloud.com:12159/defaultdb?sslmode=require"
    )
    return conn