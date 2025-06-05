import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchRepositories, 
  fetchRepositoryById, 
  createRepository, 
  updateRepository,
  deleteRepository 
} from '../thunks/repositoryThunks';

const initialState = {
  repositories: [],
  currentRepository: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    sort: 'name_asc'
  },
  pagination: {
    page: 1,
    totalPages: 1,
    itemsPerPage: 10
  }
};

const repositorySlice = createSlice({
  name: 'repositories',
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
    clearCurrentRepository: (state) => {
      state.currentRepository = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch repositories
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
        // Calcola il numero totale di pagine
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repositories';
      })
      
      // Fetch repository by ID
      .addCase(fetchRepositoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRepository = action.payload;
      })
      .addCase(fetchRepositoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch repository';
      })
      
      // Create repository
      .addCase(createRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories.push(action.payload);
        state.currentRepository = action.payload;
      })
      .addCase(createRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create repository';
      })
      
      // Update repository
      .addCase(updateRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRepository.fulfilled, (state, action) => {
        state.loading = false;
        
        // Aggiorna il repository nella lista
        const index = state.repositories.findIndex(repo => repo.id === action.payload.id);
        if (index !== -1) {
          state.repositories[index] = action.payload;
        }
        
        // Se è il repository corrente, aggiorna anche quello
        if (state.currentRepository && state.currentRepository.id === action.payload.id) {
          state.currentRepository = action.payload;
        }
      })
      .addCase(updateRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update repository';
      })
      
      // Delete repository
      .addCase(deleteRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRepository.fulfilled, (state, action) => {
        state.loading = false;
        
        // Rimuovi il repository dalla lista
        state.repositories = state.repositories.filter(repo => repo.id !== action.payload);
        
        // Se è il repository corrente, svuota il campo
        if (state.currentRepository && state.currentRepository.id === action.payload) {
          state.currentRepository = null;
        }
      })
      .addCase(deleteRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete repository';
      });
  }
});

export const { setFilter, setPage, clearError, clearCurrentRepository } = repositorySlice.actions;

// Selectors
export const selectAllRepositories = (state) => state.repositories.repositories;
export const selectCurrentRepository = (state) => state.repositories.currentRepository;
export const selectRepositoryLoading = (state) => state.repositories.loading;
export const selectRepositoryError = (state) => state.repositories.error;
export const selectRepositoryFilters = (state) => state.repositories.filters;
export const selectRepositoryPagination = (state) => state.repositories.pagination;

// Selector per i repository filtrati (da utilizzare nei componenti)
export const selectFilteredRepositories = (state) => {
  const { repositories, filters } = state.repositories;
  const { search, type } = filters;
  
  return repositories.filter(repo => {
    // Filtro di ricerca
    const matchesSearch = !search || 
      repo.name?.toLowerCase().includes(search.toLowerCase()) ||
      repo.url?.toLowerCase().includes(search.toLowerCase());
    
    // Filtro per tipo
    const matchesType = type === 'all' ||
      (type === 'github' && repo.url?.includes('github.com')) ||
      (type === 'gitlab' && repo.url?.includes('gitlab.com')) ||
      (type === 'analyzed' && repo.last_analysis) ||
      (type === 'not_analyzed' && !repo.last_analysis);
    
    return matchesSearch && matchesType;
  });
};

// Selector per i repository paginati
export const selectPaginatedRepositories = (state) => {
  const filteredRepos = selectFilteredRepositories(state);
  const { page, itemsPerPage } = state.repositories.pagination;
  
  return filteredRepos.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
};

export default repositorySlice.reducer;