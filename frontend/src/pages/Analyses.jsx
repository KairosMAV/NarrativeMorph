import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Pagination,
  Breadcrumbs,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Timer as PendingIcon,
  PlayArrow as RunIcon
} from '@mui/icons-material';

import { 
  fetchAnalyses, 
  submitAnalysis 
} from '../redux/thunks/analysisThunks';
import { 
  selectAllAnalyses, 
  selectAnalysisLoading, 
  selectAnalysisError,
  selectAnalysisFilters,
  selectAnalysisPagination,
  setFilter,
  setPage
} from '../redux/slices/analysisSlice';
import { fetchRepositories } from '../redux/thunks/repositoryThunks';
import { selectAllRepositories } from '../redux/slices/repositorySlice';
import AnalysisTable from '../components/AnalysisTable';
import { formatTimeAgo } from '../utils/formatters';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'failed', label: 'Failed' },
  { value: 'queued', label: 'Queued' }
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'full', label: 'Full Analysis' },
  { value: 'security', label: 'Security' },
  { value: 'quality', label: 'Code Quality' },
  { value: 'docs', label: 'Documentation' },
  { value: 'tests', label: 'Test Coverage' }
];

const sortOptions = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'quality_desc', label: 'Highest Quality' },
  { value: 'quality_asc', label: 'Lowest Quality' },
  { value: 'issues_desc', label: 'Most Issues' },
  { value: 'issues_asc', label: 'Least Issues' }
];

const Analyses = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const analyses = useSelector(selectAllAnalyses);
  const loading = useSelector(selectAnalysisLoading);
  const error = useSelector(selectAnalysisError);
  const filters = useSelector(selectAnalysisFilters);
  const pagination = useSelector(selectAnalysisPagination);
  const repositories = useSelector(selectAllRepositories);
  
  // State for new analysis dialog
  const [newAnalysisDialogOpen, setNewAnalysisDialogOpen] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    dispatch(fetchAnalyses());
    dispatch(fetchRepositories());
  }, [dispatch]);
  
  // Filter change handlers
  const handleSearchChange = (e) => {
    dispatch(setFilter({ search: e.target.value }));
  };
  
  const handleTypeFilterChange = (e) => {
    dispatch(setFilter({ type: e.target.value }));
  };
  
  const handleStatusFilterChange = (e) => {
    dispatch(setFilter({ status: e.target.value }));
  };
  
  const handleSortChange = (e) => {
    dispatch(setFilter({ sort: e.target.value }));
  };
  
  // Pagination handler
  const handlePageChange = (event, value) => {
    dispatch(setPage(value));
    window.scrollTo(0, 0);
  };
  
  // Refresh handler
  const handleRefresh = () => {
    dispatch(fetchAnalyses());
  };
  
  // Filter and sort analyses
  const filteredAnalyses = analyses.filter(analysis => {
    // Search filter
    const matchesSearch = !filters.search || 
      analysis.repo_url?.toLowerCase().includes(filters.search.toLowerCase()) ||
      analysis.branch?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Type filter
    const matchesType = filters.type === 'all' ||
      (analysis.analysis_type === filters.type);
    
    // Status filter
    const matchesStatus = filters.status === 'all' ||
      (analysis.status === filters.status);
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    // Sort analyses
    switch (filters.sort) {
      case 'date_desc':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'date_asc':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      case 'quality_desc':
        return (b.result?.quality_score || 0) - (a.result?.quality_score || 0);
      case 'quality_asc':
        return (a.result?.quality_score || 0) - (b.result?.quality_score || 0);
      case 'issues_desc':
        return (b.result?.issues?.length || 0) - (a.result?.issues?.length || 0);
      case 'issues_asc':
        return (a.result?.issues?.length || 0) - (b.result?.issues?.length || 0);
      default:
        return 0;
    }
  });
  
  // Paginate analyses
  const paginatedAnalyses = filteredAnalyses.slice(
    (pagination.page - 1) * pagination.itemsPerPage,
    pagination.page * pagination.itemsPerPage
  );
  
  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Analyses</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analyses
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RunIcon />}
            component={Link}
            to="/analysis/new"
            sx={{ mr: 2 }}
          >
            New Analysis
          </Button>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by repository or branch..."
              value={filters.search}
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
          
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={handleTypeFilterChange}
              >
                {typeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sort}
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
      
      {/* Analysis Table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        {loading && analyses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Error loading analyses
            </Typography>
            <Typography variant="body2" paragraph>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </Box>
        ) : filteredAnalyses.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
              No analyses found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {filters.search 
                ? `No results found for "${filters.search}". Try a different search term.`
                : 'No analyses available. Run a new analysis to get started.'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<RunIcon />}
              component={Link}
              to="/analysis/new"
              sx={{ mt: 2 }}
            >
              Run Analysis
            </Button>
          </Box>
        ) : (
          <React.Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Showing {paginatedAnalyses.length} of {filteredAnalyses.length} analyses
              </Typography>
              
              {filteredAnalyses.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<SuccessIcon fontSize="small" color="success" />}
                    label={`${filteredAnalyses.filter(a => a.status === 'completed').length} Completed`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    icon={<PendingIcon fontSize="small" color="primary" />}
                    label={`${filteredAnalyses.filter(a => a.status === 'in_progress' || a.status === 'queued').length} In Progress`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    icon={<ErrorIcon fontSize="small" color="error" />}
                    label={`${filteredAnalyses.filter(a => a.status === 'failed').length} Failed`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
            
            <AnalysisTable analyses={paginatedAnalyses} />
            
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={pagination.totalPages} 
                  page={pagination.page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </React.Fragment>
        )}
      </Paper>
      
      {/* Analysis Statistics */}
      {analyses.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {analyses.slice(0, 5).map((analysis) => (
                  <ListItem key={analysis.id || analysis._id} disablePadding>
                    <ListItemButton component={Link} to={`/analysis/${analysis.id || analysis._id}`}>
                      <ListItemIcon>
                        {analysis.status === 'completed' && <SuccessIcon color="success" />}
                        {analysis.status === 'in_progress' && <PendingIcon color="primary" />}
                        {analysis.status === 'failed' && <ErrorIcon color="error" />}
                        {analysis.status === 'queued' && <PendingIcon color="info" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={getRepositoryName(analysis.repo_url, repositories)}
                        secondary={`${analysis.analysis_type} analysis ${formatTimeAgo(analysis.created_at)}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary" paragraph>
                Statistics will be shown here in a future update.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

// Helper function to get repository name from URL
const getRepositoryName = (url, repositories) => {
  if (!url) return 'Unknown Repository';
  
  // Try to find matching repository
  const repo = repositories.find(r => r.url === url);
  if (repo) return repo.name;
  
  // Extract name from URL if no match found
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1].replace('.git', '');
};

export default Analyses;