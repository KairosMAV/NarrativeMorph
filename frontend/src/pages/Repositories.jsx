import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import RepositoryCard from '../components/RepositoryCard';
import { fetchRepositories } from '../services/apiService';

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'last_analysis_desc', label: 'Recently Analyzed' },
  { value: 'last_analysis_asc', label: 'Oldest Analyzed' },
  { value: 'quality_desc', label: 'Highest Quality' },
  { value: 'quality_asc', label: 'Lowest Quality' }
];

const filterOptions = [
  { value: 'all', label: 'All Repositories' },
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'not_analyzed', label: 'Not Analyzed' }
];

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    loadRepositories();
  }, [sortBy, filterBy, page]);
  
  const loadRepositories = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would pass these parameters to the API
      const response = await fetchRepositories();
      
      // Process response data
      setRepositories(response);
      
      // For demo purposes, we'll set a static number of pages
      setTotalPages(Math.ceil(response.length / 10));
    } catch (error) {
      console.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadRepositories();
  };
  
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page on search
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page on sort change
  };
  
  const handleFilterChange = (event) => {
    setFilterBy(event.target.value);
    setPage(1); // Reset to first page on filter change
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  // Filter and sort repositories
  const filteredRepositories = repositories.filter(repo => {
    // Search filter
    const matchesSearch = !search || 
      repo.name?.toLowerCase().includes(search.toLowerCase()) ||
      repo.url?.toLowerCase().includes(search.toLowerCase());
    
    // Type filter
    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'github' && repo.url?.includes('github.com')) ||
      (filterBy === 'gitlab' && repo.url?.includes('gitlab.com')) ||
      (filterBy === 'analyzed' && repo.last_analysis) ||
      (filterBy === 'not_analyzed' && !repo.last_analysis);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort repositories
    switch (sortBy) {
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'last_analysis_desc':
        return new Date(b.last_analysis || 0) - new Date(a.last_analysis || 0);
      case 'last_analysis_asc':
        return new Date(a.last_analysis || 0) - new Date(b.last_analysis || 0);
      case 'quality_desc':
        return (b.quality_score || 0) - (a.quality_score || 0);
      case 'quality_asc':
        return (a.quality_score || 0) - (b.quality_score || 0);
      default:
        return 0;
    }
  });
  
  // Paginate repositories
  const itemsPerPage = 10;
  const paginatedRepositories = filteredRepositories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Repositories
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            to="/repositories/new"
            sx={{ mr: 2 }}
          >
            Add Repository
          </Button>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search repositories..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterBy}
                label="Filter By"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                {filterOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredRepositories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No repositories found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {search 
              ? `No results found for "${search}". Try a different search term.` 
              : 'No repositories available. Add a new repository to get started.'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            to="/repositories/new"
            sx={{ mt: 2 }}
          >
            Add Repository
          </Button>
        </Paper>
      ) : (
        <React.Fragment>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              Showing {paginatedRepositories.length} of {filteredRepositories.length} repositories
            </Typography>
          </Box>
          
          {paginatedRepositories.map(repository => (
            <RepositoryCard key={repository.id || repository._id} repository={repository} />
          ))}
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4} mb={2}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </React.Fragment>
      )}
    </Container>
  );
};

export default Repositories;