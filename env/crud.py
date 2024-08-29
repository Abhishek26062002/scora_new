from sqlalchemy.orm import Session
from sqlalchemy import text
import schemas
import logging


def get_student_by_email(db: Session, email: str):
    result =  db.execute(text("SELECT name, email, Type, student_id FROM student WHERE email = :email"), {"email": email}).fetchone()
    print(type(result))
    result = {"name": result[0], "email": result[1], "Type": result[2], "student_id": result[3]}
    return result

def create_student(db: Session, student: schemas.StudentCreate):
    
    try:
        db.execute(text("""
            INSERT INTO student (name, email, password, Type) 
            VALUES (:name, :email, :password, :Type)
        """), {
            "name" : student.name,
            "email": student.email,
            "password": student.password,
            "Type" : student.Type
        })
        db.commit()
        return get_student_by_email(db, student.email)
    except Exception as e:
        db.rollback()
        logging.error(f"Failed to create student: {e}")
        raise

def authenticate_student(db: Session, email: str, password: str):
    student = get_student_by_Email(db, email)
    if not student:
        return False
    return student


def athunicate_admin(db: Session, email: str, password: str):
    return db.execute(text("SELECT name, email, Type, student_id FROM student WHERE email = :email"), {"email": email}).fetchone()



def get_student_by_Email(db: Session, email: str):
    result =  db.execute(text("SELECT name, email, Type, student_id FROM student WHERE email = :email"), {"email": email}).fetchone()
    return result