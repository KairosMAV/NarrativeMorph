import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Recupera tutte le analisi
export const fetchAnalyses = createAsyncThunk(
  'analyses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/analysis');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analyses');
    }
  }
);

// Recupera le analisi recenti
export const fetchRecentAnalyses = createAsyncThunk(
  'analyses/fetchRecent',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent analyses');
    }
  }
);

// Recupera un'analisi specifica per ID
export const fetchAnalysisById = createAsyncThunk(
  'analyses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis');
    }
  }
);

// Recupera un'analisi dettagliata
export const fetchDetailedAnalysis = createAsyncThunk(
  'analyses/fetchDetailed',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/detailed/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch detailed analysis');
    }
  }
);

// Invia una nuova richiesta di analisi
export const submitAnalysis = createAsyncThunk(
  'analyses/submit',
  async (analysisData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/analysis', analysisData);
      
      // Mostra messaggio di successo
      dispatch(showToast({
        message: 'Analysis request submitted successfully!',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      // Mostra messaggio di errore
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to submit analysis request',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to submit analysis request');
    }
  }
);

// Recupera lo storico delle analisi per un repository
export const fetchAnalysisHistory = createAsyncThunk(
  'analyses/fetchHistory',
  async (repositoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/history/${repositoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis history');
    }
  }
);

// Recupera dati di benchmark per confronto
export const fetchBenchmarkData = createAsyncThunk(
  'analyses/fetchBenchmark',
  async (analysisId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/benchmark/${analysisId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch benchmark data');
    }
  }
);

// Recupera dati di trend
export const fetchTrendData = createAsyncThunk(
  'analyses/fetchTrend',
  async ({ analysisId, timeframe = '1M' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/analysis/trends/${analysisId}?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trend data');
    }
  }
);

// Cancella un'analisi
export const deleteAnalysis = createAsyncThunk(
  'analyses/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/analysis/${id}`);
      
      // Mostra messaggio di successo
      dispatch(showToast({
        message: 'Analysis deleted successfully!',
        severity: 'success'
      }));
      
      return id; // Ritorna l'id per rimuoverlo dallo stato
    } catch (error) {
      // Mostra messaggio di errore
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to delete analysis',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to delete analysis');
    }
  }
);