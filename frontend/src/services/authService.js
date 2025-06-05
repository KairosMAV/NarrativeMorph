// src/services/authService.js
import axios from '../utils/api';
import jwtDecode from 'jwt-decode';

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'user';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Servizio di autenticazione che gestisce login, logout e stato della sessione
 */
class AuthService {
  /**
   * Login con username e password
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>} User data
   */
  async login(username, password) {
    try {
      // In development mode, use mock authentication
      if (IS_DEV) {
        console.log('Dev mode: mocking authentication');
        const token = 'fake-dev-token-' + Date.now();
        const user = {
          id: 1,
          username: username,
          name: username === 'admin' ? 'Admin User' : 'Regular User',
          role: username === 'admin' ? 'admin' : 'user',
          email: `${username}@example.com`
        };
        
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return { user, token };
      }
      
      // Real auth in production
      const response = await axios.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Logout - rimuove il token e i dati utente
   */
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    // Redirect to login
    window.location.href = '/login';
  }
  
  /**
   * Controlla se l'utente è autenticato
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    
    // In dev mode, always consider fake tokens valid
    if (IS_DEV && token.startsWith('fake-dev-token')) {
      return true;
    }
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
  
  /**
   * Get current user from localStorage
   * @returns {Object|null}
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
  /**
   * Get the auth token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  
  /**
   * Get user profile from API
   * @returns {Promise<Object>}
   */
  async getUserProfile() {
    try {
      // In dev mode, return the stored user
      if (IS_DEV) {
        const user = this.getUser();
        if (user) return user;
        throw new Error('User not authenticated');
      }
      
      const response = await axios.get('/auth/profile');
      const user = response.data;
      
      // Update stored user
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Authorize with GitHub OAuth
   * @param {string} code - OAuth code
   * @param {string} redirectUri - Redirect URI
   * @returns {Promise<Object>}
   */
  async authorizeWithGitHub(code, redirectUri) {
    try {
      const response = await axios.post('/auth/github/callback', { 
        code,
        redirect_uri: redirectUri
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('GitHub auth error:', error);
      throw error;
    }
  }
  
  /**
   * Authorize with GitLab OAuth
   * @param {string} code - OAuth code
   * @param {string} redirectUri - Redirect URI
   * @returns {Promise<Object>}
   */
  async authorizeWithGitLab(code, redirectUri) {
    try {
      const response = await axios.post('/auth/gitlab/callback', { 
        code,
        redirect_uri: redirectUri
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('GitLab auth error:', error);
      throw error;
    }
  }
  
  /**
   * Set auth state manually (useful for development)
   * @param {boolean} isAuth - Is authenticated
   * @param {Object} user - User data
   * @param {string} token - Auth token
   */
  setAuthState(isAuth, user, token) {
    if (isAuth) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }
}

// Esporta un'istanza singola del servizio
export default new AuthService();