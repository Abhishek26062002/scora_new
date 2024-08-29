import google.generativeai as genai
from typing import List, Dict
import json

GOOGLE_API_KEY = "AIzaSyDjApCt7r09A0jH82clzVcyuGkEkuF-kno"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def evaluate_answer_with_ai(question: str, answer: str, marks_possible: int) -> int:
    try:
        prompt = (
            f"Question: {question}\n"
            f"Student Answer: {answer}\n"
            f"Evaluate the answer and give marks out of {marks_possible} in numerical format. "
            f"Provide only the marks."
        )
        
        response = model.generate_content(prompt)
        print("API Response:", response.text)  # Debugging line
        score = int(response.text.strip())
        return score

    except Exception as e:
        print(f"Error evaluating answer with AI: {e}")
        return 0

def get_recommendations(course: List[str]) -> Dict[str, List[str]]:
    combined_prompt = f"Provide 5 job recommendations with links and 5 relevant course recommendations with links for the following courses: {', '.join(course)}. Return output in the format of '{{\"jobs\" : [{{\"name\": \"job1\", \"link\": \"url1\"}}, {{\"name\": \"job2\", \"link\": \"url2\"}}, ...], \"courses\" : [{{\"name\": \"course1\", \"link\": \"url1\"}}, {{\"name\": \"course2\", \"link\": \"url2\"}}, ...]}}' without using bold font."
    response = model.generate_content(combined_prompt)
    response = response.text
    print(response)
    response = response[7:len(response)-3]
    print(response)
    response = json.loads(response)
    jobs = response["jobs"]
    courses = response['courses']
    return jobs, courses


def generate_questions(data, type, number_of_questions):
    prompt = data + "From the above data, give me "+ str(number_of_questions) + " questions for a" + type + """test. output should be in format : [
  {
    "question{n}_id": "{id}",
    "question{n}": "{question}",
    "options{n}": [
      "{option1}",
      "{option2}",
      "{option3}",
      "{option4}",
      "{option5}"
    ],
    "correct_answer{n}": "{correct_answer}",
    "difficulty{n}": "{difficulty}"
  },
  ...
]
."""
    questions = model.generate_content(prompt)
    return questions.text