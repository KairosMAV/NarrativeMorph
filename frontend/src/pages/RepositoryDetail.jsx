import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Breadcrumbs,
  Menu,
  MenuItem,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Description as DocIcon,
  BugReport as BugIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as CopyIcon,
  GitHub as GitHubIcon,
  Storage as GitLabIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { fetchRepositoryById, deleteRepository } from '../redux/thunks/repositoryThunks';
import { fetchAnalysisHistory, submitAnalysis } from '../redux/thunks/analysisThunks';
import { selectCurrentRepository, selectRepositoryLoading, selectRepositoryError } from '../redux/slices/repositorySlice';
import { selectAnalysisHistory, selectAnalysisLoading } from '../redux/slices/analysisSlice';
import AnalysisTable from '../components/AnalysisTable';
import QualityScoreGauge from '../components/QualityScoreGauge';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const repository = useSelector(selectCurrentRepository);
  const repositoryLoading = useSelector(selectRepositoryLoading);
  const repositoryError = useSelector(selectRepositoryError);
  const analysisHistory = useSelector(selectAnalysisHistory);
  const analysisLoading = useSelector(selectAnalysisLoading);
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [newAnalysisDialogOpen, setNewAnalysisDialogOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState('full');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Get repository data
  useEffect(() => {
    dispatch(fetchRepositoryById(id));
    dispatch(fetchAnalysisHistory(id));
  }, [dispatch, id]);
  
  useEffect(() => {
    // Aggiorna il branch selezionato quando il repository è caricato
    if (repository && repository.default_branch) {
      setSelectedBranch(repository.default_branch);
    }
  }, [repository]);
  
  // Tab handling
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Menu handling
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Delete handling
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (confirmText === repository.name) {
      dispatch(deleteRepository(id)).then((resultAction) => {
        if (deleteRepository.fulfilled.match(resultAction)) {
          // Naviga alla lista dei repository dopo eliminazione
          navigate('/repositories');
        }
      });
    }
  };
  
  // New analysis handling
  const handleNewAnalysisClick = () => {
    setNewAnalysisDialogOpen(true);
  };
  
  const handleAnalysisSubmit = () => {
    const analysisData = {
      repository_id: id,
      branch: selectedBranch,
      analysis_type: analysisType
    };
    
    dispatch(submitAnalysis(analysisData)).then((resultAction) => {
      if (submitAnalysis.fulfilled.match(resultAction)) {
        setNewAnalysisDialogOpen(false);
        // Aggiorna la storia delle analisi
        dispatch(fetchAnalysisHistory(id));
      }
    });
  };
  
  // Refresh handling
  const handleRefresh = () => {
    dispatch(fetchRepositoryById(id));
    dispatch(fetchAnalysisHistory(id));
  };
  
  // Get repository icon
  const getRepositoryIcon = () => {
    if (repository) {
      if (repository.url?.includes('github.com')) {
        return <GitHubIcon />;
      } else if (repository.url?.includes('gitlab.com')) {
        return <GitLabIcon />;
      }
    }
    return <CodeIcon />;
  };
  
  // Loading state
  if (repositoryLoading && !repository) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (repositoryError && !repository) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error loading repository
          </Typography>
          <Typography variant="body1" paragraph>
            {repositoryError}
          </Typography>
          <Button 
            component={Link} 
            to="/repositories" 
            variant="outlined"
          >
            Back to Repositories
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Repository not found
  if (!repository && !repositoryLoading) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Repository not found
          </Typography>
          <Typography variant="body1" paragraph>
            The repository you're looking for doesn't exist or you don't have access to it.
          </Typography>
          <Button 
            component={Link} 
            to="/repositories" 
            variant="outlined"
          >
            Back to Repositories
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Link to="/repositories" style={{ textDecoration: 'none', color: 'inherit' }}>
          Repositories
        </Link>
        <Typography color="text.primary">{repository?.name}</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, color: 'primary.main' }}>
              {getRepositoryIcon()}
            </Box>
            <Typography variant="h4" component="h1">
              {repository?.name}
            </Typography>
          </Box>
          
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            {repository?.description || 'No description provided'}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RunIcon />}
            onClick={handleNewAnalysisClick}
            sx={{ mr: 1 }}
          >
            Run Analysis
          </Button>
          
          <IconButton onClick={handleRefresh} disabled={repositoryLoading}>
            <RefreshIcon />
          </IconButton>
          
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate(`/repositories/edit/${id}`); }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Edit Repository
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Delete Repository</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Repository details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Repository Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  URL:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {repository?.url}
                  </Typography>
                  <IconButton 
                    size="small" 
                    component="a" 
                    href={repository?.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ ml: 1 }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Default Branch:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip 
                  label={repository?.default_branch || 'main'} 
                  size="small" 
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Added:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {repository?.created_at ? formatDate(repository.created_at) : '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Last Analysis:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {repository?.last_analysis ? formatTimeAgo(repository.last_analysis) : 'Never'}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Analysis Schedule:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {repository?.scan_frequency || 'Manual'} 
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Authentication:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {repository?.auth_type || 'None'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Latest Analysis Summary */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Latest Analysis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {analysisHistory?.length > 0 ? (
              <React.Fragment>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QualityScoreGauge score={analysisHistory[0].result?.quality_score || 0} size={150} />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main">
                        {analysisHistory[0].result?.issues?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Issues Found
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {analysisHistory[0].result?.fixed_issues || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Issues Fixed
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      component={Link}
                      to={`/analysis/${analysisHistory[0].id}`}
                      fullWidth
                      variant="outlined"
                    >
                      View Full Analysis
                    </Button>
                  </Grid>
                </Grid>
              </React.Fragment>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  No analysis data available
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<RunIcon />}
                  onClick={handleNewAnalysisClick}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Run First Analysis
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Analysis History" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Code Quality" icon={<CodeIcon />} iconPosition="start" />
              <Tab label="Documentation" icon={<DocIcon />} iconPosition="start" />
              <Tab label="Tests" icon={<BugIcon />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ p: 2 }}>
              {activeTab === 0 && (
                <React.Fragment>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Analysis History
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RunIcon />}
                      onClick={handleNewAnalysisClick}
                    >
                      New Analysis
                    </Button>
                  </Box>
                  
                  {analysisLoading && analysisHistory.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : analysisHistory.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        No analysis has been run for this repository yet.
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Run your first analysis to discover potential issues and improvements.
                      </Typography>
                    </Box>
                  ) : (
                    <AnalysisTable analyses={analysisHistory} />
                  )}
                </React.Fragment>
              )}
              
              {activeTab === 1 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Security Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Security analysis shows potential vulnerabilities and security issues in your code.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setAnalysisType('security');
                      setNewAnalysisDialogOpen(true);
                    }}
                  >
                    Run Security Analysis
                  </Button>
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Code Quality Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Code quality analysis helps identify maintainability, performance, and code smell issues.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setAnalysisType('quality');
                      setNewAnalysisDialogOpen(true);
                    }}
                  >
                    Run Code Quality Analysis
                  </Button>
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Documentation Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Documentation analysis checks the quality and coverage of your code documentation.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setAnalysisType('docs');
                      setNewAnalysisDialogOpen(true);
                    }}
                  >
                    Generate Documentation
                  </Button>
                </Box>
              )}
              
              {activeTab === 4 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Test Coverage Analysis
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Test analysis checks your code coverage and suggests new tests.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setAnalysisType('tests');
                      setNewAnalysisDialogOpen(true);
                    }}
                  >
                    Run Test Analysis
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Repository</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete the repository
            <strong> {repository?.name}</strong> and all its analysis history.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            To confirm, please type the repository name:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={confirmText !== '' && confirmText !== repository?.name}
            helperText={confirmText !== '' && confirmText !== repository?.name ? "Repository name doesn't match" : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={confirmText !== repository?.name}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Analysis Dialog */}
      <Dialog
        open={newAnalysisDialogOpen}
        onClose={() => setNewAnalysisDialogOpen(false)}
      >
        <DialogTitle>New Analysis</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Run a new analysis on the repository. Select options below:
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Branch
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            helperText="Select which branch to analyze"
            size="small"
          >
            <MenuItem value={repository?.default_branch || 'main'}>
              {repository?.default_branch || 'main'} (default)
            </MenuItem>
            {/* In a real app, fetch available branches */}
            <MenuItem value="develop">develop</MenuItem>
            <MenuItem value="feature/new-api">feature/new-api</MenuItem>
          </TextField>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Analysis Type
          </Typography>
          <TextField
            select
            fullWidth
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            helperText="Select the type of analysis to run"
            size="small"
          >
            <MenuItem value="full">Full Analysis (All Types)</MenuItem>
            <MenuItem value="security">Security Analysis</MenuItem>
            <MenuItem value="quality">Code Quality Analysis</MenuItem>
            <MenuItem value="docs">Documentation Analysis</MenuItem>
            <MenuItem value="tests">Test Coverage Analysis</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewAnalysisDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAnalysisSubmit} 
            variant="contained" 
            color="primary"
            disabled={analysisLoading}
          >
            {analysisLoading ? <CircularProgress size={24} /> : 'Run Analysis'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RepositoryDetail;