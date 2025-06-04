import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDocumentations,
  fetchDocumentationById,
  submitDocGeneration
} from '../thunks/documentationThunks';

const initialState = {
  documentations: [],
  currentDocumentation: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    sort: 'date_desc'
  },
  pagination: {
    page: 1,
    totalPages: 1,
    itemsPerPage: 10
  }
};

const documentationSlice = createSlice({
  name: 'documentation',
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
      // fetchDocumentations
      .addCase(fetchDocumentations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentations.fulfilled, (state, action) => {
        state.loading = false;
        state.documentations = action.payload;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchDocumentations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch documentations';
      })
      
      // fetchDocumentationById
      .addCase(fetchDocumentationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocumentation = action.payload;
      })
      .addCase(fetchDocumentationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch documentation';
      })
      
      // submitDocGeneration
      .addCase(submitDocGeneration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDocGeneration.fulfilled, (state, action) => {
        state.loading = false;
        state.documentations.unshift(action.payload);
        state.currentDocumentation = action.payload;
      })
      .addCase(submitDocGeneration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit documentation generation';
      });
  }
});

export const { setFilter, setPage, clearError } = documentationSlice.actions;

// Selectors
export const selectDocumentations = (state) => state.documentation.documentations;
export const selectCurrentDocumentation = (state) => state.documentation.currentDocumentation;
export const selectDocumentationLoading = (state) => state.documentation.loading;
export const selectDocumentationError = (state) => state.documentation.error;
export const selectDocumentationFilters = (state) => state.documentation.filters;
export const selectDocumentationPagination = (state) => state.documentation.pagination;

export default documentationSlice.reducer;