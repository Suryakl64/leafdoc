/**
 * API Service for Plant Disease Detection
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Predict disease from image file
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise} Prediction result
 */
export const predictDisease = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post('/api/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to analyze image. Please try again.'
    );
  }
};

/**
 * Get list of all detectable diseases
 * @returns {Promise} List of diseases with information
 */
export const getDiseases = async () => {
  try {
    const response = await apiClient.get('/api/diseases');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch disease information');
  }
};

/**
 * Get model and dataset statistics
 * @returns {Promise} Model statistics
 */
export const getModelStats = async () => {
  try {
    const response = await apiClient.get('/api/stats');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch model statistics');
  }
};

/**
 * Upload training data
 * @param {File} imageFile - Training image
 * @param {string} diseaseType - Disease label
 * @returns {Promise} Upload result
 */
export const uploadTrainingData = async (imageFile, diseaseType) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('disease_type', diseaseType);

    const response = await apiClient.post('/api/training/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to upload training data'
    );
  }
};

/**
 * Trigger model retraining
 * @returns {Promise} Retraining status
 */
export const retrainModel = async () => {
  try {
    const response = await apiClient.post('/api/training/retrain');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      'Failed to initiate model retraining'
    );
  }
};

/**
 * Get prediction history
 * @param {number} limit - Number of records to fetch
 * @returns {Promise} Prediction history
 */
export const getPredictionHistory = async (limit = 50) => {
  try {
    const response = await apiClient.get('/api/predictions/history', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch prediction history');
  }
};

/**
 * Health check
 * @returns {Promise} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend service unavailable');
  }
};

export default {
  predictDisease,
  getDiseases,
  getModelStats,
  uploadTrainingData,
  retrainModel,
  getPredictionHistory,
  healthCheck,
};
