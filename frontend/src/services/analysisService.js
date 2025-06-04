import axios from '../utils/api';

// Ottiene un'analisi dettagliata
export const getDetailedAnalysis = async (analysisId) => {
  const response = await axios.get(`/analysis/detailed/${analysisId}`);
  return response.data;
};

// Ottiene dati storici delle metriche
export const getHistoricalTrends = async (analysisId, timeframe = '1M') => {
  const response = await axios.get(`/analysis/trends/${analysisId}?timeframe=${timeframe}`);
  return response.data;
};

// Ottiene dati di benchmark per confronto
export const getBenchmarkData = async (analysisId) => {
  const response = await axios.get(`/analysis/benchmark/${analysisId}`);
  return response.data;
};

// Ottiene un'analisi per ID
export const getAnalysisById = async (id) => {
  try {
    const response = await axios.get(`/analysis/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis ${id}:`, error);
    throw error;
  }
};

// Ottiene lo storico analisi per repository
export const getAnalysisHistory = async (repositoryId) => {
  try {
    const response = await axios.get(`/analysis/history/${repositoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis history for repository ${repositoryId}:`, error);
    throw error;
  }
};

// Ottiene le analisi recenti
export const getRecentAnalyses = async (limit = 5) => {
  try {
    const response = await axios.get(`/analysis/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    throw error;
  }
};

// Esegue una nuova analisi
export const submitAnalysis = async (analysisData) => {
  try {
    const response = await axios.post('/analysis', analysisData);
    return response.data;
  } catch (error) {
    console.error('Error submitting analysis:', error);
    throw error;
  }
};

export default {
  getDetailedAnalysis,
  getHistoricalTrends,
  getBenchmarkData,
  getAnalysisById,
  getAnalysisHistory,
  getRecentAnalyses,
  submitAnalysis
};