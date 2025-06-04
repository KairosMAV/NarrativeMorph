import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Crea un'istanza axios con la base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Aggiungi interceptor per gestire token di autenticazione
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// API per i repository
export const fetchRepositories = async () => {
  const response = await apiClient.get('/repositories');
  return response.data;
};

export const fetchRepositoryById = async (id) => {
  const response = await apiClient.get(`/repositories/${id}`);
  return response.data;
};

export const createRepository = async (repositoryData) => {
    const response = await apiClient.post('/repositories', repositoryData);
    return response.data;
  };
  
  export const updateRepository = async (id, repositoryData) => {
    const response = await apiClient.put(`/repositories/${id}`, repositoryData);
    return response.data;
  };
  
  export const deleteRepository = async (id) => {
    const response = await apiClient.delete(`/repositories/${id}`);
    return response.data;
  };
  
  // API per le analisi
  export const fetchRecentAnalyses = async () => {
    const response = await apiClient.get('/analysis/recent');
    return response.data;
  };
  
  export const fetchAnalysisById = async (id) => {
    const response = await apiClient.get(`/analysis/${id}`);
    return response.data;
  };
  
  export const submitAnalysis = async (analysisData) => {
    const response = await apiClient.post('/analysis', analysisData);
    return response.data;
  };
  
  export const fetchAnalysisHistory = async (repositoryId) => {
    const response = await apiClient.get(`/analysis/history/${repositoryId}`);
    return response.data;
  };
  
  // API per l'autenticazione
  export const login = async (credentials) => {
    const response = await apiClient.post('/auth/token', credentials, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  };
  
  export const getUserProfile = async () => {
    const response = await apiClient.get('/auth/users/me');
    return response.data;
  };
  
  // API per GitHub/GitLab OAuth
  export const authorizeGitHub = async (code, redirectUri) => {
    const response = await apiClient.post('/auth/github/callback', {
      code,
      redirect_uri: redirectUri
    });
    return response.data;
  };
  
  export const authorizeGitLab = async (code, redirectUri) => {
    const response = await apiClient.post('/auth/gitlab/callback', {
      code,
      redirect_uri: redirectUri
    });
    return response.data;
  };
  
  export default {
    fetchRepositories,
    fetchRepositoryById,
    createRepository,
    updateRepository,
    deleteRepository,
    fetchRecentAnalyses,
    fetchAnalysisById,
    submitAnalysis,
    fetchAnalysisHistory,
    login,
    getUserProfile,
    authorizeGitHub,
    authorizeGitLab
  };