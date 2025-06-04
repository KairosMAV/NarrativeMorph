import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAnalyses,
  fetchAnalysisById,
  submitAnalysis,
  fetchAnalysisHistory,
  fetchDetailedAnalysis,
  fetchBenchmarkData,
  fetchTrendData
} from '../thunks/analysisThunks';

const initialState = {
  analyses: [],
  currentAnalysis: null,
  detailedAnalysis: null,
  history: [],
  benchmarkData: null,
  trendData: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    status: 'all',
    sort: 'date_desc'
  },
  pagination: {
    page: 1,
    totalPages: 1,
    itemsPerPage: 10
  }
};

const analysisSlice = createSlice({
  name: 'analyses',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Resetta la paginazione quando i filtri cambiano
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
      state.detailedAnalysis = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch analyses
      .addCase(fetchAnalyses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.analyses = action.payload;
        // Calcola il numero totale di pagine
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analyses';
      })
      
      // Fetch analysis by ID
      .addCase(fetchAnalysisById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(fetchAnalysisById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analysis';
      })
      
      // Fetch detailed analysis
      .addCase(fetchDetailedAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetailedAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.detailedAnalysis = action.payload;
      })
      .addCase(fetchDetailedAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch detailed analysis';
      })
      
      // Submit analysis
      .addCase(submitAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        // Aggiungi la nuova analisi all'inizio della lista
        state.analyses.unshift(action.payload);
        state.currentAnalysis = action.payload;
      })
      .addCase(submitAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit analysis';
      })
      
      // Fetch analysis history
      .addCase(fetchAnalysisHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchAnalysisHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch analysis history';
      })
      
      // Fetch benchmark data
      .addCase(fetchBenchmarkData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBenchmarkData.fulfilled, (state, action) => {
        state.loading = false;
        state.benchmarkData = action.payload;
      })
      .addCase(fetchBenchmarkData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch benchmark data';
      })
      
      // Fetch trend data
      .addCase(fetchTrendData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendData.fulfilled, (state, action) => {
        state.loading = false;
        state.trendData = action.payload;
      })
      .addCase(fetchTrendData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch trend data';
      });
  }
});

export const { setFilter, setPage, clearError, clearCurrentAnalysis } = analysisSlice.actions;

// Selectors
export const selectAllAnalyses = (state) => state.analyses.analyses;
export const selectCurrentAnalysis = (state) => state.analyses.currentAnalysis;
export const selectDetailedAnalysis = (state) => state.analyses.detailedAnalysis;
export const selectAnalysisHistory = (state) => state.analyses.history;
export const selectBenchmarkData = (state) => state.analyses.benchmarkData;
export const selectTrendData = (state) => state.analyses.trendData;
export const selectAnalysisLoading = (state) => state.analyses.loading;
export const selectAnalysisError = (state) => state.analyses.error;
export const selectAnalysisFilters = (state) => state.analyses.filters;
export const selectAnalysisPagination = (state) => state.analyses.pagination;

// Selector per le analisi filtrate
export const selectFilteredAnalyses = (state) => {
  const { analyses, filters } = state.analyses;
  const { search, type, status } = filters;
  
  return analyses.filter(analysis => {
    // Filtro di ricerca
    const matchesSearch = !search || 
      analysis.repo_url?.toLowerCase().includes(search.toLowerCase()) ||
      analysis.branch?.toLowerCase().includes(search.toLowerCase());
    
    // Filtro per tipo
    const matchesType = type === 'all' ||
      (analysis.analysis_type === type);
    
    // Filtro per stato
    const matchesStatus = status === 'all' ||
      (analysis.status === status);
    
    return matchesSearch && matchesType && matchesStatus;
  });
};

// Selector per le analisi paginate
export const selectPaginatedAnalyses = (state) => {
  const filteredAnalyses = selectFilteredAnalyses(state);
  const { page, itemsPerPage } = state.analyses.pagination;
  
  return filteredAnalyses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
};

export default analysisSlice.reducer;