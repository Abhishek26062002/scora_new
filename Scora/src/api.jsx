// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust this to match your FastAPI base URL

export const createMCQResult = async (mcqResult) => {
    const response = await axios.post(`${API_BASE_URL}/mcq/`, mcqResult);
    return response.data;
};

export const createuser = async (user) => {
    const response = await axios.post(`${API_BASE_URL}/student/`, user);
    return response.data;
}

export const createDescriptiveResult = async (descriptiveResult) => {
    const response = await axios.post(`${API_BASE_URL}/descriptive/`, descriptiveResult);
    return response.data;
};

export const getJobRecommendations = async (courses) => {
    const response = await axios.post(`${API_BASE_URL}/recommendations/jobs/`, { courses });
    return response.data;
};

export const getCourseRecommendations = async (courses) => {
    const response = await axios.post(`${API_BASE_URL}/recommendations/courses/`, { courses });
    return response.data;
};

export const getTestPerformanceGraphs = async (studentId, outputFolder) => {
    const response = await axios.get(`${API_BASE_URL}/students/${studentId}/test_performance_graphs/`, {
        params: { output_folder: outputFolder },
    });
    return response.data;
};
