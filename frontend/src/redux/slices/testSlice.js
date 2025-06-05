import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTestJobs,
  fetchTestJobById,
  submitTestGeneration
} from '../thunks/testThunks';

const initialState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    type: 'all',
    sort: 'date_desc'
  },
  pagination: {
    page: 1,
    totalPages: 1,
    itemsPerPage: 10
  }
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
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
      // fetchTestJobs
      .addCase(fetchTestJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchTestJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch test jobs';
      })
      
      // fetchTestJobById
      .addCase(fetchTestJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchTestJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch test job';
      })
      
      // submitTestGeneration
      .addCase(submitTestGeneration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTestGeneration.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.currentJob = action.payload;
      })
      .addCase(submitTestGeneration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit test generation';
      });
  }
});

export const { setFilter, setPage, clearError } = testSlice.actions;

// Selectors
export const selectTestJobs = (state) => state.test.jobs;
export const selectCurrentTestJob = (state) => state.test.currentJob;
export const selectTestLoading = (state) => state.test.loading;
export const selectTestError = (state) => state.test.error;
export const selectTestFilters = (state) => state.test.filters;
export const selectTestPagination = (state) => state.test.pagination;

export default testSlice.reducer;