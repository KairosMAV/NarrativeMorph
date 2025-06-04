import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSecurityScans,
  fetchSecurityScanById,
  submitSecurityScan,
  fetchVulnerabilities
} from '../thunks/securityThunks';

const initialState = {
  scans: [],
  currentScan: null,
  vulnerabilities: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    severity: 'all',
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

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchSecurityScans
      .addCase(fetchSecurityScans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityScans.fulfilled, (state, action) => {
        state.loading = false;
        state.scans = action.payload;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchSecurityScans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch security scans';
      })
      
      // fetchSecurityScanById
      .addCase(fetchSecurityScanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityScanById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScan = action.payload;
      })
      .addCase(fetchSecurityScanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch security scan';
      })
      
      // submitSecurityScan
      .addCase(submitSecurityScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSecurityScan.fulfilled, (state, action) => {
        state.loading = false;
        state.scans.unshift(action.payload);
        state.currentScan = action.payload;
      })
      .addCase(submitSecurityScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit security scan';
      })
      
      // fetchVulnerabilities
      .addCase(fetchVulnerabilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVulnerabilities.fulfilled, (state, action) => {
        state.loading = false;
        state.vulnerabilities = action.payload;
      })
      .addCase(fetchVulnerabilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch vulnerabilities';
      });
  }
});

export const { setFilter, setPage, clearError } = securitySlice.actions;

// Selectors
export const selectSecurityScans = (state) => state.security.scans;
export const selectCurrentScan = (state) => state.security.currentScan;
export const selectVulnerabilities = (state) => state.security.vulnerabilities;
export const selectSecurityLoading = (state) => state.security.loading;
export const selectSecurityError = (state) => state.security.error;
export const selectSecurityFilters = (state) => state.security.filters;
export const selectSecurityPagination = (state) => state.security.pagination;

export default securitySlice.reducer;