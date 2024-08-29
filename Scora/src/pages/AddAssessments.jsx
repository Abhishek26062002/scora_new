import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import './Add.css';
import axios from 'axios';

const Popup = ({ message, onClose, onViewQuestions }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <div className="popup-buttons">
          <button onClick={onClose} className="popup-close-button">Close</button>
          <button onClick={onViewQuestions} className="popup-view-button">View Questions</button>
        </div>
      </div>
    </div>
  );
};

const QuestionsPopup = ({ questions, onDone }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Questions</h3>
        <ul>
          {questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
        <button onClick={onDone} className="popup-done-button">Done</button>
      </div>
    </div>
  );
};

const AddAssessments = () => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showQuestionsPopup, setShowQuestionsPopup] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    number_of_questions: '10',
    category: 'theory',
    type: 'MCQ',
    file: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const dropZoneInputs = document.querySelectorAll('.drop-zone__input');

    dropZoneInputs.forEach((inputElement) => {
      const dropZoneElement = inputElement.closest('.drop-zone');

      dropZoneElement.addEventListener('click', () => {
        inputElement.click();
      });

      inputElement.addEventListener('change', () => {
        if (inputElement.files.length) {
          updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
      });

      dropZoneElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneElement.classList.add('drop-zone--over');
      });

      ['dragleave', 'dragend'].forEach((type) => {
        dropZoneElement.addEventListener(type, () => {
          dropZoneElement.classList.remove('drop-zone--over');
        });
      });

      dropZoneElement.addEventListener('drop', (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
          inputElement.files = e.dataTransfer.files;
          updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove('drop-zone--over');
      });
    });

    function updateThumbnail(dropZoneElement, file) {
      let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

      if (dropZoneElement.querySelector('.drop-zone__prompt')) {
        dropZoneElement.querySelector('.drop-zone__prompt').remove();
      }

      if (!thumbnailElement) {
        thumbnailElement = document.createElement('div');
        thumbnailElement.classList.add('drop-zone__thumb');
        dropZoneElement.appendChild(thumbnailElement);
      }

      thumbnailElement.dataset.label = file.name;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
          thumbnailElement.style.backgroundImage = `url(${reader.result})`;
        };
      } else {
        thumbnailElement.style.backgroundImage = null;
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    console.log(`Updated formData: ${name} =`, files ? files[0] : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('file', formData.file);
    data.append('test_name', formData.name);
    data.append('number_of_questions', formData.number_of_questions);
    data.append('category', formData.category);
    data.append('type', formData.type);

    // Log form data for debugging
    for (let pair of data.entries()) {
      console.log(`${pair[0]}: `, pair[1]);
    }

    try {
        console.log(data);
      const response = await axios.post('http://localhost:8000/generate-questions/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setQuestions(response.data.questions || []);
        setShowPopup(true);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      console.error('Server Response:', error.response?.data);
      alert('Error generating questions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestions = () => {
    setShowPopup(false);
    setShowQuestionsPopup(true);
  };

  return (
    <div className="add-container">
      <AdminSidebar />
      <div className="add">
        <br />
        <p className="add-paragraph">
          Generate and add tests in just two clicks, using AI for easy and quick automation.
        </p>
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="number_of_questions">Number of questions</label>
              <select
                id="number_of_questions"
                name="number_of_questions"
                value={formData.number_of_questions}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="theory">Theory</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="MCQ">MCQ</option>
                <option value="descriptive">Descriptive</option>
              </select>
            </div>

            <div className="drop-zone">
              <span className="drop-zone__prompt">Drop file here or click to upload</span>
              <input
                type="file"
                name="file"
                className="drop-zone__input"
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-button">
              <button type="submit" className="generate-button" disabled={loading}>
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showPopup && (
        <Popup
          message="Assessment generated successfully!"
          onClose={() => setShowPopup(false)}
          onViewQuestions={handleViewQuestions}
        />
      )}
      {showQuestionsPopup && (
        <QuestionsPopup
          questions={questions}
          onDone={() => setShowQuestionsPopup(false)}
        />
      )}
    </div>
  );
};

export default AddAssessments;
