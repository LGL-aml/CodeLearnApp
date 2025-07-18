import axios from 'axios';
import { API_URL } from './config';
import { getAccessToken } from '../utils/auth';

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
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor for handling responses - simplified for direct access mode
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Simply return the error without authentication handling
    return Promise.reject(error);
  }
);

export default apiClient; 