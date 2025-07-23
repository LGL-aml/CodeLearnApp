import axios from 'axios';
import { API_URL } from './config';
import { getAccessToken, logout } from '../utils/auth';

// Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor for adding auth token to requests
apiClient.interceptors.request.use(
  async config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for multipart/form-data requests
    // as axios will automatically set the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor for handling responses
apiClient.interceptors.response.use(
  response => {
    // For the new API structure with statusCode, error, message, and data fields
    if (response.data) {
      // For /auth/me endpoint, return the user data directly
      if (response.config.url.includes('/auth/me')) {
        return response;
      }
      
      // For successful responses with statusCode 200
      if (response.data.statusCode === 200) {
        // If the response has data field, return it in response.data for consistency
        if (response.data.data !== undefined) {
          const originalResponse = { ...response };
          return {
            ...originalResponse,
            originalData: originalResponse.data,
            data: response.data.data
          };
        }
      }
      
      // For error responses with statusCode other than 200
      if (response.data.statusCode !== 200 && response.data.error) {
        // Create an error object with the response data
        const error = new Error(response.data.message || 'API Error');
        error.response = {
          status: response.data.statusCode,
          data: response.data
        };
        return Promise.reject(error);
      }
    }
    return response;
  },
  async error => {
    // If the error response contains our API format, extract the message
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      
      // If the error has our API format with statusCode, error, message
      if (errorData.statusCode !== undefined && errorData.message) {
        // Enhance the error object with more readable properties
        error.apiErrorMessage = errorData.message;
        error.apiErrorCode = errorData.statusCode;
        error.apiError = errorData.error;
      }
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If not on login page and token is invalid, redirect to login
      if (!window.location.pathname.includes('/login')) {
        console.error('Authentication error:', error.apiErrorMessage || error.response.data?.message || 'Session expired');
        
        // Log out the user and redirect to login
        logout(() => {
          window.location.href = '/login';
        });
      }
    }
    
    // Return the error for further handling
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
const apiService = {
  // Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: (accessToken) => apiClient.post('/auth/logout', { accessToken }),
  getUserInfo: (accessToken) => apiClient.post('/auth/me', { accessToken }),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken }),
  
  // Users
  getUsers: () => apiClient.get('/admin/users'),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (userData) => apiClient.post('/admin/users', userData),
  updateUser: (id, userData) => apiClient.patch(`/admin/users/${id}`, userData),
  deleteUser: (id) => apiClient.patch(`/admin/users/delete/${id}`),
  
  // Topics
  getTopics: () => apiClient.get('/admin/topics'),
  getTopicById: (id) => apiClient.get(`/admin/topics/${id}`),
  createTopic: (topicData) => apiClient.post('/admin/topic', topicData),
  updateTopic: (id, topicData) => apiClient.patch(`/admin/topic/${id}`, topicData),
  deleteTopic: (id) => apiClient.patch(`/admin/topic/delete/${id}`),
  
  // Courses
  getCourses: () => apiClient.get('/staff/courses'),
  getCourseById: (id) => apiClient.get(`/staff/courses/${id}`),
  createCourse: (courseData) => apiClient.post('/staff/courses', courseData),
  updateCourse: (id, courseData) => apiClient.patch(`/staff/courses/${id}`, courseData),
  deleteCourse: (id) => apiClient.patch(`/staff/courses/delete/${id}`),
};

export default apiClient;
export { apiService }; 