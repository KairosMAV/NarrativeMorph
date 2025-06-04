import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRefactoringJobs,
  fetchRefactoringJobById,
  submitRefactoringJob
} from '../thunks/refactoringThunks';

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

const refactoringSlice = createSlice({
  name: 'refactoring',
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
      // fetchRefactoringJobs
      .addCase(fetchRefactoringJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRefactoringJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchRefactoringJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch refactoring jobs';
      })
      
      // fetchRefactoringJobById
      .addCase(fetchRefactoringJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRefactoringJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchRefactoringJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch refactoring job';
      })
      
      // submitRefactoringJob
      .addCase(submitRefactoringJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRefactoringJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.currentJob = action.payload;
      })
      .addCase(submitRefactoringJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit refactoring job';
      });
  }
});

export const { setFilter, setPage, clearError } = refactoringSlice.actions;

// Selectors
export const selectRefactoringJobs = (state) => state.refactoring.jobs;
export const selectCurrentRefactoringJob = (state) => state.refactoring.currentJob;
export const selectRefactoringLoading = (state) => state.refactoring.loading;
export const selectRefactoringError = (state) => state.refactoring.error;
export const selectRefactoringFilters = (state) => state.refactoring.filters;
export const selectRefactoringPagination = (state) => state.refactoring.pagination;

export default refactoringSlice.reducer;