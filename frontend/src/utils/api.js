import axios from 'axios';
import config from '../config';
import mockData from './mockData';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const IS_DEV = process.env.NODE_ENV === 'development';

// Mock data per rispondere alle richieste in modalità sviluppo
const MOCK_DATA = {
  '/auth/profile': () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) throw new Error('User not authenticated');
    return { ...user };
  },
  '/repositories': () => ({
    data: [
      { id: 1, name: 'Example Repo 1', url: 'https://github.com/example/repo1', description: 'Sample repository for testing', auth_type: 'token', default_branch: 'main', created_at: new Date().toISOString() },
      { id: 2, name: 'Example Repo 2', url: 'https://github.com/example/repo2', description: 'Another sample repository', auth_type: 'none', default_branch: 'master', created_at: new Date().toISOString() }
    ]
  }),
  '/analyses': () => ({
    data: [
      { id: 1, repo_url: 'https://github.com/example/repo1', branch: 'main', status: 'completed', created_at: new Date().toISOString(), completed_at: new Date().toISOString(), 
        result: { quality_score: 85, issues: [{id: 1, message: 'Sample issue', file: 'src/App.js', line: 42}], files_analyzed: 25, vulnerabilities: 2, dimension_scores: {reliability: 80, security: 85, maintainability: 90, performance: 75} } },
      { id: 2, repo_url: 'https://github.com/example/repo2', branch: 'master', status: 'in_progress', created_at: new Date().toISOString() }
    ]
  })
};

// Crea un'istanza di axios con configurazione comune
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Aggiungi un interceptor per gestire le mock responses in dev mode
api.interceptors.request.use(
  async (config) => {
    // Add auth token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Mock response in development mode
    if (IS_DEV) {
      const urlPath = config.url.replace(/^\/+/, '');
      
      // Check if we have mock data for this endpoint
      for (const mockPath in MOCK_DATA) {
        if (urlPath === mockPath || urlPath.startsWith(mockPath)) {
          try {
            // Create a promise that resolves with mock data
            const mockResponse = MOCK_DATA[mockPath]();
            
            // Cancel the actual request and return mock data
            config.adapter = function(config) {
              return new Promise((resolve) => {
                resolve({
                  data: mockResponse,
                  status: 200,
                  statusText: 'OK',
                  headers: {},
                  config: config,
                  request: {}
                });
              });
            };
            break;
          } catch (error) {
            console.error('Error with mock data:', error);
          }
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Aggiungi un interceptor per gestire gli errori di risposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // In development mode, don't redirect to login
    if (IS_DEV) {
      console.warn('API Error (ignored in dev mode):', error);
      return Promise.reject(error);
    }
    
    // Gestisci errori 401 (non autorizzato)
    if (error.response && error.response.status === 401) {
      // Rimuovi il token e reindirizza al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Funzioni helper per le chiamate API
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);