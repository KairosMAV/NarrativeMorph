import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL per le richieste API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Login utente
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      // Salva il token nel localStorage
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante il login'
      );
    }
  }
);

// Fetch del profilo utente
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token non trovato');
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante il recupero del profilo'
      );
    }
  }
);

// Aggiornamento profilo utente
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token non trovato');
      }

      const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante l\'aggiornamento del profilo'
      );
    }
  }
);

// Cambio password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token non trovato');
      }

      const response = await axios.post(`${API_URL}/auth/change-password`, {
        current_password: passwordData.current,
        new_password: passwordData.new
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante il cambio password'
      );
    }
  }
);

// Logout utente
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Opzionale: notifica il server del logout
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Rimuovi il token dal localStorage indipendentemente dalla risposta
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      // Rimuovi comunque il token se il logout fallisce
      localStorage.removeItem('token');
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante il logout'
      );
    }
  }
);

// Autorizzazione con GitHub
export const authorizeGithub = createAsyncThunk(
  'auth/github',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/github/callback`, { code });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante l\'autenticazione con GitHub'
      );
    }
  }
);

// Autorizzazione con GitLab
export const authorizeGitlab = createAsyncThunk(
  'auth/gitlab',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/gitlab/callback`, { code });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Errore durante l\'autenticazione con GitLab'
      );
    }
  }
);