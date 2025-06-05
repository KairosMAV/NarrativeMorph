import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Recupera tutti i repository
export const fetchRepositories = createAsyncThunk(
  'repositories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/repositories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch repositories');
    }
  }
);

// Recupera un repository specifico per ID
export const fetchRepositoryById = createAsyncThunk(
  'repositories/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/repositories/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch repository');
    }
  }
);

// Crea un nuovo repository
export const createRepository = createAsyncThunk(
  'repositories/create',
  async (repositoryData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/repositories', repositoryData);
      
      // Mostra messaggio di successo
      dispatch(showToast({
        message: 'Repository created successfully!',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      // Mostra messaggio di errore
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to create repository',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to create repository');
    }
  }
);

// Aggiorna un repository esistente
export const updateRepository = createAsyncThunk(
  'repositories/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`/repositories/${id}`, data);
      
      // Mostra messaggio di successo
      dispatch(showToast({
        message: 'Repository updated successfully!',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      // Mostra messaggio di errore
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to update repository',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to update repository');
    }
  }
);

// Elimina un repository
export const deleteRepository = createAsyncThunk(
  'repositories/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/repositories/${id}`);
      
      // Mostra messaggio di successo
      dispatch(showToast({
        message: 'Repository deleted successfully!',
        severity: 'success'
      }));
      
      return id; // Ritorna l'id per rimuoverlo dallo stato
    } catch (error) {
      // Mostra messaggio di errore
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to delete repository',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to delete repository');
    }
  }
);

// Verifica disponibilità repository
export const checkRepositoryAccess = createAsyncThunk(
  'repositories/checkAccess',
  async (url, { rejectWithValue }) => {
    try {
      const response = await axios.post('/repositories/check-access', { url });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check repository access');
    }
  }
);