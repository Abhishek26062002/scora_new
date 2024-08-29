import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Tests.css';

const Question = ({ question, selectedOption, onOptionChange }) => (
  <div className="test-question">
    <h3>{question.question}</h3>
    <ul className="test-options">
      {question.options.map((option, index) => (
        <li key={index}>
          <label>
            <input
              type="radio"
              name="option"
              value={option}
              checked={selectedOption === option}
              onChange={onOptionChange}
            />
            {option}
          </label>
        </li>
      ))}
    </ul>
  </div>
);

const NavigationButtons = ({ onPrevious, onNext, onSubmit, disableNext, disableSubmit }) => (
  <div className="test-navigation">
    <button onClick={onPrevious} disabled={disableNext}>
      Previous
    </button>
    <button onClick={onNext} disabled={disableSubmit}>
      Next
    </button>
    <button onClick={onSubmit} disabled={disableSubmit}>
      Submit
    </button>
  </div>
);

const parseJSONSafely = (jsonString) => {
  try {
    if (typeof jsonString !== 'string') {
      throw new Error('Input is not a string');
    }

    // Log the raw JSON string for debugging
    console.log('Raw JSON string:', jsonString);

    // Attempt to parse the JSON string
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parsing error:', error.message);
    console.error('Raw JSON string at error:', jsonString);
    return null;
  }
};

const Tests = () => {
  const { test_id: routeTestId } = useParams();
  const test_id = routeTestId || sessionStorage.getItem('selectedTestId');

  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTestData = async () => {
      setLoading(true);
      setError('');

      try {
        if (!test_id) {
          throw new Error('Test ID is not provided.');
        }

        const storedMcqTests = sessionStorage.getItem('mcqTests');
        const storedDescriptiveTests = sessionStorage.getItem('descriptiveTests');

        const parsedMcqTests = parseJSONSafely(storedMcqTests || '[]');
        const parsedDescriptiveTests = parseJSONSafely(storedDescriptiveTests || '[]');

        if (!Array.isArray(parsedMcqTests) || !Array.isArray(parsedDescriptiveTests)) {
          throw new Error('Invalid JSON data');
        }

        const allTests = [...parsedMcqTests, ...parsedDescriptiveTests];

        const id = Number(test_id);
        if (isNaN(id)) {
          throw new Error('Invalid test_id');
        }

        const selectedTest = allTests.find(test => test.test_id === id);
        if (!selectedTest) {
          throw new Error('Test not found');
        }

        const parsedTestContent = parseJSONSafely(selectedTest.content);
        if (!Array.isArray(parsedTestContent)) {
          throw new Error('Test content is not an array or is invalid');
        }

        const formattedQuestions = parsedTestContent.map((item, index) => {
          const questionIndex = index + 1;
          return {
            question: item[`question${questionIndex}`],
            options: item[`options${questionIndex}`],
            correctAnswer: item[`correct_answer${questionIndex}`],
            difficulty: item[`difficulty${questionIndex}`],
          };
        });

        setTestData({
          ...selectedTest,
          questions: formattedQuestions
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [test_id]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleNextQuestion = () => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentQuestionIndex]: selectedOption,
    }));
    setSelectedOption('');
    if (currentQuestionIndex < (testData.questions.length - 1)) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      navigate(`/tests/${test_id}/summary`, { state: { answers, testData } });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1] || '');
    }
  };

  const handleSubmit = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestionIndex]: selectedOption,
    };
    navigate(`/tests/${test_id}/summary`, { state: { answers: finalAnswers, testData } });
  };

  if (loading) return <div>Loading test...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!testData) return <div>No test data found</div>;

  const currentQuestion = testData.questions[currentQuestionIndex];

  return (
    <div className="test-container">
      <div className="test-header">
        <h2>{testData.test_name}</h2>
        <p>Question {currentQuestionIndex + 1} of {testData.questions.length}</p>
      </div>
      <Question 
        question={currentQuestion} 
        selectedOption={selectedOption} 
        onOptionChange={handleOptionChange} 
      />
      <NavigationButtons
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onSubmit={handleSubmit}
        disableNext={!selectedOption}
        disableSubmit={!selectedOption && currentQuestionIndex === testData.questions.length - 1}
      />
    </div>
  );
};

export default Tests;
