from fastapi import FastAPI, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import logging
import tempfile
from pdfminer.high_level import extract_text
import schemas, crud, database
from typing import List
from generative_ai import evaluate_answer_with_ai, get_recommendations, generate_questions

DATABASE_URL = "postgresql+psycopg2://avnadmin:AVNS_lzJsq0hZSifN3XBhCQj@scora-scora.h.aivencloud.com:12159/defaultdb?sslmode=require"


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    response = await call_next(request)
    print("Response headers:", response.headers)
    return response

@app.post("/signup/", response_model=schemas.Student)
def signup(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = crud.get_student_by_Email(db, email=student.email)
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_student(db=db, student=student)

@app.post("/login/")
def login(student: schemas.StudentLogin, db: Session = Depends(get_db)):
    db_student = crud.authenticate_student(db, email=student.email, password=student.password)
    print(db_student)
    if not db_student:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {
        "message": "Login successful",
        "student": {
            "student_id": db_student.student_id,
            "email": db_student.email
        }
    }

@app.post("/mcq/")
async def submit_mcq(submission: schemas.MCQSubmission, db: Session = Depends(get_db)):
    try:
        logging.debug(f"Received submission: {submission}")
        correct_count = sum([1 for i, answer in enumerate(submission.Student_answer) if answer == submission.correct_answer[i]])
        incorrect_count = len(submission.Student_answer) - correct_count
        score = correct_count

        db.execute(text("""
            INSERT INTO mcq_results (student_id, Q_id, Student_answer, correct_answer, score, correct_count, incorrect_count) 
            VALUES (:student_id, :Q_id, :Student_answer, :correct_answer, :score, :correct_count, :incorrect_count)
        """), {
            "student_id": submission.student_id,
            "Q_id": submission.Q_id,
            "Student_answer": submission.Student_answer,
            "correct_answer": submission.correct_answer,
            "score": score,
            "correct_count": correct_count,
            "incorrect_count": incorrect_count
        })
        db.commit()
        result = db.execute(text("SELECT id FROM mcq_results ORDER BY id DESC LIMIT 1")).fetchone()
        return {"result_id": result.id, "score": score, "correct_count": correct_count, "incorrect_count": incorrect_count}
    except Exception as e:
        logging.error(f"Error processing MCQ submission: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")
    
def row_to_dict(row):
    if row is None:
        return None
    return {column: getattr(row, column) for column in row.keys()}


@app.get("/mcq/results/{student_id}")
async def get_mcq_results_by_student(student_id: int, db: Session = Depends(get_db)):
    try:
        results = list(db.execute(text("SELECT * FROM mcq_results WHERE student_id = :student_id ORDER BY id"), {"student_id": student_id}).fetchone())
        if not results:
            raise HTTPException(status_code=404, detail="No results found for the given student_id")
        print(results)
        result = results
        print(result)
        return {
            "id": result[0],
            "student_id": result[1],
            "Q_id": result[2],
            "Student_answer": result[3],
            "correct_answer": result[4],
            "score": result[5],
            "correct_count": result[6],
            "incorrect_count": result[7]
        }
    except Exception as e:
        logging.error(f"Error fetching MCQ results for student_id {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching the data.")

@app.post("/descriptive/")
async def submit_descriptive_answers(data: List[dict]):
    conn = database.get_db_connection()
    cursor = conn.cursor()

    try:
        marks = 0
        responses = {"question_id": [], "score": []}

        for item in data:
            question_id = item['question_id']
            question = item['question']
            student_answer = item['Student_answer']
            marks_possible = item['marks']
            student_id = item['student_id']

            # Use the function from generative_ai.py
            score = evaluate_answer_with_ai(question, student_answer, marks_possible)

            responses["question_id"].append(question_id)
            responses["score"].append(score)
            marks += score

            cursor.execute("""
                INSERT INTO descriptive_results (student_id, question_id, student_answer, marks)
                VALUES (%s, %s, %s, %s)
            """, (student_id, question_id, student_answer, score))

        conn.commit()
        return {"results": responses}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Error in evaluation")

    finally:
        cursor.close()
        conn.close()
    

@app.get("/descriptive_results", response_model=List[schemas.DescriptiveResult])
def get_last_results():
    with SessionLocal() as session:
        results = session.execute(
            text("SELECT question_id, student_answer, marks, student_id FROM descriptive_results ORDER BY id DESC LIMIT 1")
        ).fetchall()
        return [{"question_id": row.question_id, "student_answer": row.student_answer, "marks": row.marks, "student_id": row.student_id} for row in results]
    


@app.get("/mcq/last_result/")
async def get_last_result(db: Session = Depends(get_db)):
    try:
        result = list(db.execute(text("SELECT * FROM mcq_results ORDER BY id DESC LIMIT 1;")).fetchone())
        print(result)
        if result is None:
            raise HTTPException(status_code=404, detail="No results found")
        
        return {
            "id": result[0],
            "student_id": result[1],
            "Q_id": result[2],
            "Student_answer": result[3],
            "correct_answer": result[4],
            "score": result[5],
            "correct_count": result[6],
            "incorrect_count": result[7]
        }
    except Exception as e:
        logging.error(f"Internal Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    
    
@app.post("/recommendations")
def recommendations(request: schemas.CoursesRequest):
    try:
        recommendations = get_recommendations(request.courses)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
    
    
@app.post("/generate-questions/")
async def generate_questions_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db), test_name: str = "", type: str = "", category: str = "", number_of_questions: int = 30):
         with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(file.file.read())
            tmp_file.flush()
            Text = extract_text(tmp_file.name)
         questions = generate_questions(Text, type, number_of_questions)
         db.execute(text("""
            INSERT INTO tests (test_name, content, type, category)
            VALUES (:test_name, :content, :type, :category)"""),
            {"test_name": test_name, "content": questions[9:len(questions)-5], "type": type, "category": category})
         db.commit()
         return "test generated successfully"
     
     
    
@app.get("/student/")
def get_student_by_email(email: str, db: Session = Depends(get_db)):
    student = crud.get_student_by_email(db, email)
    print(student)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.get('/test/')
def get_tests(db: Session = Depends(get_db)):
    tests = db.execute(text("SELECT * FROM tests")).fetchall()
    return [{"test_name": test.test_name, "content": test.content, "type" : test.type, "category" : test.category, "test_id" : test.test_id} for test in tests]



@app.get('/test/{test_id}')
def get_test_by_id(test_id: str, db: Session = Depends(get_db)):
    test = db.execute(text("SELECT * FROM tests WHERE test_id = :test_id"), {'test_id': test_id}).fetchone()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test.content  # Adjust based on your data structure
