// src/pages/Refactoring.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Button, 
  Stepper, Step, StepLabel, TextField, MenuItem,
  CircularProgress, Alert, Divider, Chip, Tabs, Tab
} from '@mui/material';
import {
  Code as CodeIcon,
  SettingsEthernet as RefactorIcon,
  ArrowForward as NextIcon,
  ViewList as RefactoringListIcon,
  AutoFixHigh as AutoFixIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Componenti
import CodeDiffViewer from '../components/refactoring/CodeDiffViewer';
import RefactoringList from '../components/refactoring/RefactoringList';
import CodeQualityMetrics from '../components/refactoring/CodeQualityMetrics';

// Redux
import { selectAllRepositories } from '../redux/slices/repositorySlice';
import { submitRefactoringJob } from '../redux/thunks/refactoringThunks';

const Refactoring = () => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectAllRepositories);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobCompleted, setJobCompleted] = useState(false);
  const [jobResults, setJobResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedRefactoring, setSelectedRefactoring] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    repositoryId: '',
    branch: 'main',
    refactoringType: 'auto_detect',
    createPullRequest: true,
    branchName: 'refactoring/auto',
    specificFiles: '',
    refactorConfig: {
      codeSmells: true,
      duplications: true,
      complexMethods: true,
      applyDesignPatterns: true
    }
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.startsWith('refactorConfig.')) {
      const configKey = name.split('.')[1];
      setFormData({
        ...formData,
        refactorConfig: {
          ...formData.refactorConfig,
          [configKey]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleRepositoryChange = (e) => {
    const repoId = e.target.value;
    const selectedRepo = repositories.find(repo => repo.id === repoId);
    
    setFormData({
      ...formData,
      repositoryId: repoId,
      branch: selectedRepo?.default_branch || 'main',
      branchName: `refactoring/${selectedRepo?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'auto'}`
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Componi i dati per il refactoring
      const refactoringData = {
        repository_id: formData.repositoryId,
        branch: formData.branch,
        refactoring_type: formData.refactoringType,
        create_pull_request: formData.createPullRequest,
        branch_name: formData.branchName,
        specific_files: formData.specificFiles ? formData.specificFiles.split(',').map(f => f.trim()) : [],
        config: formData.refactorConfig
      };
      
      // Chiamata all'API di refactoring
      const result = await dispatch(submitRefactoringJob(refactoringData)).unwrap();
      
      setJobResults(result);
      setJobCompleted(true);
      handleNext();
    } catch (err) {
      setError(err.message || 'Error submitting refactoring job');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps per lo stepper
  const steps = [
    'Select Repository',
    'Configure Refactoring',
    'Results'
  ];
  
  // Per simulare i risultati nella demo standalone
  useEffect(() => {
    if (activeStep === 2 && !jobResults && process.env.NODE_ENV === 'development') {
      // Mock data per sviluppo frontend
      setTimeout(() => {
        setJobResults({
          job_id: 'refactor_job_' + Date.now(),
          repository: repositories.find(r => r.id === formData.repositoryId)?.name || 'Unknown Repo',
          status: 'completed',
          pr_created: formData.createPullRequest,
          pr_url: formData.createPullRequest ? 'https://github.com/example/repo/pull/123' : null,
          metrics: {
            before: {
              code_smells: 42,
              duplications: 18,
              complex_methods: 15,
              maintainability_index: 65
            },
            after: {
              code_smells: 12,
              duplications: 5,
              complex_methods: 8,
              maintainability_index: 82
            }
          },
          refactorings: [
            {
              id: 'ref1',
              type: 'extract_method',
              file: 'src/components/ComplexComponent.jsx',
              location: { start_line: 45, end_line: 78 },
              description: 'Extracted complex rendering logic into separate methods',
              quality_improvement: 'high',
              diff_id: 'diff1'
            },
            {
              id: 'ref2',
              type: 'rename_variable',
              file: 'src/utils/helpers.js',
              location: { start_line: 23, end_line: 23 },
              description: 'Renamed ambiguous variable "data" to "userProfileData"',
              quality_improvement: 'medium',
              diff_id: 'diff2'
            },
            {
              id: 'ref3',
              type: 'remove_duplication',
              file: 'src/services/api.js',
              location: { start_line: 87, end_line: 112 },
              description: 'Removed duplicated API call logic by creating a reusable function',
              quality_improvement: 'high',
              diff_id: 'diff3'
            },
            {
              id: 'ref4',
              type: 'apply_design_pattern',
              file: 'src/stores/userStore.js',
              location: { start_line: 1, end_line: 120 },
              description: 'Applied Observer pattern to user store for better state management',
              quality_improvement: 'high',
              diff_id: 'diff4'
            }
          ],
          diffs: {
            diff1: {
              old_code: `render() {
  let userDisplay;
  
  if (this.state.loading) {
    userDisplay = <div className="loading-spinner" />;
  } else if (this.state.error) {
    userDisplay = <div className="error-message">{this.state.error}</div>;
  } else if (this.state.user) {
    // Complex user display logic with many conditions
    if (this.state.user.isAdmin) {
      userDisplay = (
        <div className="admin-panel">
          {/* Many lines of admin UI code */}
          <h2>Admin Panel for {this.state.user.name}</h2>
          <div className="admin-controls">
            {this.state.features.map(feature => (
              <div key={feature.id} className="feature-toggle">
                <span>{feature.name}</span>
                <input 
                  type="checkbox" 
                  checked={feature.enabled} 
                  onChange={() => this.toggleFeature(feature.id)} 
                />
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      userDisplay = (
        <div className="user-panel">
          {/* Many lines of regular user UI code */}
          <h2>Welcome, {this.state.user.name}</h2>
          <div className="user-stats">
            <div>Last Login: {this.formatDate(this.state.user.lastLogin)}</div>
            <div>Posts: {this.state.user.posts.length}</div>
            <div>Comments: {this.state.user.comments.length}</div>
          </div>
        </div>
      );
    }
  } else {
    userDisplay = <div>Please log in to continue</div>;
  }
  
  return (
    <div className="user-component">
      {userDisplay}
      <div className="actions">
        {this.state.user && (
          <button onClick={this.handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
}`,
              new_code: `// Extracted methods for different rendering states
renderLoadingState() {
  return <div className="loading-spinner" />;
}

renderErrorState() {
  return <div className="error-message">{this.state.error}</div>;
}

renderAdminPanel() {
  return (
    <div className="admin-panel">
      <h2>Admin Panel for {this.state.user.name}</h2>
      <div className="admin-controls">
        {this.state.features.map(feature => (
          <div key={feature.id} className="feature-toggle">
            <span>{feature.name}</span>
            <input 
              type="checkbox" 
              checked={feature.enabled} 
              onChange={() => this.toggleFeature(feature.id)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

renderUserPanel() {
  return (
    <div className="user-panel">
      <h2>Welcome, {this.state.user.name}</h2>
      <div className="user-stats">
        <div>Last Login: {this.formatDate(this.state.user.lastLogin)}</div>
        <div>Posts: {this.state.user.posts.length}</div>
        <div>Comments: {this.state.user.comments.length}</div>
      </div>
    </div>
  );
}

renderLoggedOutState() {
  return <div>Please log in to continue</div>;
}

render() {
  let userDisplay;
  
  if (this.state.loading) {
    userDisplay = this.renderLoadingState();
  } else if (this.state.error) {
    userDisplay = this.renderErrorState();
  } else if (this.state.user) {
    userDisplay = this.state.user.isAdmin 
      ? this.renderAdminPanel() 
      : this.renderUserPanel();
  } else {
    userDisplay = this.renderLoggedOutState();
  }
  
  return (
    <div className="user-component">
      {userDisplay}
      <div className="actions">
        {this.state.user && (
          <button onClick={this.handleLogout}>Logout</button>
        )}
      </div>
    </div>
  );
}`
            },
            diff2: {
              old_code: `function processUserData(data) {
  if (!data) {
    return null;
  }
  
  const result = {
    name: data.name,
    email: data.email,
    permissions: data.roles.map(role => role.permissions).flat()
  };
  
  return result;
}`,
              new_code: `function processUserData(userProfileData) {
  if (!userProfileData) {
    return null;
  }
  
  const result = {
    name: userProfileData.name,
    email: userProfileData.email,
    permissions: userProfileData.roles.map(role => role.permissions).flat()
  };
  
  return result;
}`
            }
          }
        });
      }, 2000);
    }
  }, [activeStep, formData.createPullRequest, formData.repositoryId, jobResults, repositories]);
  
  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <RefactorIcon sx={{ mr: 1 }} />
          Code Refactoring
        </Typography>
        
        <Button 
          component={Link} 
          to="/refactoring/history"
          variant="outlined"
          startIcon={<RefactoringListIcon />}
        >
          Refactoring History
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Select Repository"
                fullWidth
                value={formData.repositoryId}
                onChange={handleRepositoryChange}
                required
              >
                {repositories.map((repo) => (
                  <MenuItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch"
                fullWidth
                value={formData.branch}
                onChange={handleChange}
                name="branch"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.repositoryId}
                  endIcon={<NextIcon />}
                >
                  Next
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Refactoring Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Refactoring Type"
                fullWidth
                value={formData.refactoringType}
                onChange={handleChange}
                name="refactoringType"
              >
                <MenuItem value="auto_detect">Auto-detect Refactoring Opportunities</MenuItem>
                <MenuItem value="code_smells">Focus on Code Smells</MenuItem>
                <MenuItem value="duplications">Focus on Code Duplications</MenuItem>
                <MenuItem value="complex_methods">Focus on Complex Methods</MenuItem>
                <MenuItem value="design_patterns">Apply Design Patterns</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch Name for Changes"
                fullWidth
                value={formData.branchName}
                onChange={handleChange}
                name="branchName"
                disabled={!formData.createPullRequest}
                helperText={formData.createPullRequest ? "Branch that will be created with refactored code" : "Enable PR creation to specify branch name"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Specific Files (optional, comma separated)"
                fullWidth
                value={formData.specificFiles}
                onChange={handleChange}
                name="specificFiles"
                placeholder="e.g., src/components/ComplexComponent.jsx, src/utils/helpers.js"
                helperText="Leave empty to analyze the entire repository"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Refactoring Options:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip 
                  label="Fix Code Smells" 
                  color={formData.refactorConfig.codeSmells ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    refactorConfig: {
                      ...formData.refactorConfig,
                      codeSmells: !formData.refactorConfig.codeSmells
                    }
                  })}
                />
                <Chip 
                  label="Remove Duplications" 
                  color={formData.refactorConfig.duplications ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    refactorConfig: {
                      ...formData.refactorConfig,
                      duplications: !formData.refactorConfig.duplications
                    }
                  })}
                />
                <Chip 
                  label="Fix Complex Methods" 
                  color={formData.refactorConfig.complexMethods ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    refactorConfig: {
                      ...formData.refactorConfig,
                      complexMethods: !formData.refactorConfig.complexMethods
                    }
                  })}
                />
                <Chip 
                  label="Apply Design Patterns" 
                  color={formData.refactorConfig.applyDesignPatterns ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    refactorConfig: {
                      ...formData.refactorConfig,
                      applyDesignPatterns: !formData.refactorConfig.applyDesignPatterns
                    }
                  })}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Chip 
                  label="Create Pull Request" 
                  color={formData.createPullRequest ? "primary" : "default"}
                  onClick={() => setFormData({
                    ...formData,
                    createPullRequest: !formData.createPullRequest
                  })}
                  icon={<GitHubIcon />}
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                  Create a pull request with the refactored code
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AutoFixIcon />}
                >
                  Start Refactoring
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 2 && (
          <Grid container spacing={3}>
            {!jobResults ? (
              <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Analyzing code and applying refactorings...
                </Typography>
              </Grid>
            ) : (
              <>
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      bgcolor: 'background.paper', 
                      p: 2, 
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h5">
                      Refactoring Results: {jobResults.repository}
                    </Typography>
                    <Chip 
                      label={jobResults.status} 
                      color={jobResults.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Code Quality Metrics
                    </Typography>
                    <CodeQualityMetrics metrics={jobResults.metrics} />
                    
                    {jobResults.pr_created && (
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Pull Request Created
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<GitHubIcon />} 
                          component="a" 
                          href={jobResults.pr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Pull Request
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={7}>
                  <Paper sx={{ height: '100%' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                      <Tab label="Applied Refactorings" />
                      <Tab label="Code Changes" disabled={!selectedRefactoring} />
                    </Tabs>
                    
                    <Box p={2}>
                      {activeTab === 0 && (
                        <RefactoringList 
                          refactorings={jobResults.refactorings} 
                          onSelectRefactoring={setSelectedRefactoring}
                          selectedRefactoringId={selectedRefactoring?.id}
                        />
                      )}
                      
                      {activeTab === 1 && selectedRefactoring && (
                        <CodeDiffViewer 
                          diffData={jobResults.diffs[selectedRefactoring.diff_id]} 
                          refactoring={selectedRefactoring}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to={`/refactoring/jobs/${jobResults.job_id}`}
                    >
                      View Complete Refactoring Report
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Refactoring;