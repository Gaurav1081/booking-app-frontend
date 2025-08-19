// services/passportService.js
// Using environment variable for API base URL
import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const passportAPI = axios.create({
  baseURL: `${API_BASE_URL}/passport`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
passportAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
passportAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const passportService = {
  // Create new passport details
  createPassport: async (passportData) => {
    try {
      const response = await passportAPI.post('/', passportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Search passport details
  searchPassports: async (query, page = 1, limit = 10) => {
    try {
      const response = await passportAPI.get('/search', {
        params: { query, page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Get passport by ID
  getPassportById: async (id) => {
    try {
      const response = await passportAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Get all passports with pagination
  getAllPassports: async (page = 1, limit = 10) => {
    try {
      const response = await passportAPI.get('/all', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Update passport details
  updatePassport: async (id, passportData) => {
    try {
      const response = await passportAPI.put(`/${id}`, passportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },

  // Delete passport details
  deletePassport: async (id) => {
    try {
      const response = await passportAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' };
    }
  }
};

export default passportService;