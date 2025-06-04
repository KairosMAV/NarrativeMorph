// src/pages/TestAutomation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Button, 
  Stepper, Step, StepLabel, TextField, MenuItem, 
  CircularProgress, Alert, Divider, Chip, FormControlLabel, 
  Checkbox, Tabs, Tab
} from '@mui/material';
import {
  BugReport as TestIcon,
  PlayArrow as StartIcon,
  ArrowForward as NextIcon,
  ViewList as HistoryIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Componenti
import TestResultSummary from '../components/test/TestResultSummary';
import TestsList from '../components/test/TestsList';
import CodePreview from '../components/test/CodePreview';

// Redux
import { selectAllRepositories } from '../redux/slices/repositorySlice';
import { submitTestGeneration } from '../redux/thunks/testThunks';

const TestAutomation = () => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectAllRepositories);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generationCompleted, setGenerationCompleted] = useState(false);
  const [generationResults, setGenerationResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    repositoryId: '',
    branch: 'main',
    generationType: 'all',
    includeUnitTests: true,
    includeIntegrationTests: true,
    includeE2ETests: false,
    runGeneratedTests: true,
    targetCoverage: 80,
    specificFiles: ''
  });
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleRepositoryChange = (e) => {
    const repoId = e.target.value;
    const selectedRepo = repositories.find(repo => repo.id === repoId);
    
    setFormData({
      ...formData,
      repositoryId: repoId,
      branch: selectedRepo?.default_branch || 'main'
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
      // Componi i dati per la generazione
      const testData = {
        repository_id: formData.repositoryId,
        branch: formData.branch,
        test_type: formData.generationType,
        options: {
          unit_tests: formData.includeUnitTests,
          integration_tests: formData.includeIntegrationTests,
          e2e_tests: formData.includeE2ETests,
          run_tests: formData.runGeneratedTests,
          target_coverage: parseInt(formData.targetCoverage),
          specific_files: formData.specificFiles ? formData.specificFiles.split(',').map(f => f.trim()) : []
        }
      };
      
      // Chiamata all'API di generazione test
      const result = await dispatch(submitTestGeneration(testData)).unwrap();
      
      setGenerationResults(result);
      setGenerationCompleted(true);
      handleNext();
    } catch (err) {
      setError(err.message || 'Error submitting test generation');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps per lo stepper
  const steps = [
    'Select Repository',
    'Configure Test Generation',
    'Results'
  ];
  
  // Per simulare i risultati nella demo standalone
  useEffect(() => {
    if (activeStep === 2 && !generationResults && process.env.NODE_ENV === 'development') {
      // Mock data per sviluppo frontend
      setTimeout(() => {
        setGenerationResults({
          job_id: 'test_job_' + Date.now(),
          repository: repositories.find(r => r.id === formData.repositoryId)?.name || 'Unknown Repo',
          status: 'completed',
          tests_generated: 47,
          tests_passed: 45,
          tests_failed: 2,
          coverage: {
            before: 35,
            after: 82,
            delta: 47
          },
          test_types: {
            unit: 38,
            integration: 7,
            e2e: 2
          },
          generated_tests: [
            {
              id: 'test1',
              name: 'test_user_authentication_success',
              type: 'unit',
              file: 'test/services/authService.test.js',
              status: 'passed',
              coverage_contribution: 5.2,
              code: `describe('User Authentication', () => {
  it('should authenticate with valid credentials', async () => {
    // Arrange
    const mockCredentials = { username: 'testuser', password: 'password123' };
    const mockResponse = { token: 'mock-jwt-token', user: { id: 1, username: 'testuser' } };
    authApiClient.post.mockResolvedValueOnce({ data: mockResponse });
    
    // Act
    const result = await authService.login(mockCredentials.username, mockCredentials.password);
    
    // Assert
    expect(authApiClient.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
    expect(result).toEqual(mockResponse);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockResponse.token);
  });
});`
            },
            {
              id: 'test2',
              name: 'test_user_authentication_invalid_credentials',
              type: 'unit',
              file: 'test/services/authService.test.js',
              status: 'passed',
              coverage_contribution: 4.8,
              code: `describe('User Authentication', () => {
  it('should reject invalid credentials', async () => {
    // Arrange
    const mockCredentials = { username: 'testuser', password: 'wrongpassword' };
    const mockError = { response: { status: 401, data: { message: 'Invalid credentials' } } };
    authApiClient.post.mockRejectedValueOnce(mockError);
    
    // Act & Assert
    await expect(
      authService.login(mockCredentials.username, mockCredentials.password)
    ).rejects.toThrow('Invalid credentials');
    expect(authApiClient.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
  });
});`
            },
            {
              id: 'test3',
              name: 'test_repository_list_integration',
              type: 'integration',
              file: 'test/integration/repositories.test.js',
              status: 'failed',
              coverage_contribution: 3.7,
              code: `describe('Repository List API', () => {
  it('should return repositories for authenticated user', async () => {
    // Arrange
    const mockUser = await createTestUser();
    const token = generateTokenForUser(mockUser);
    
    await createTestRepository(mockUser.id, 'Test Repo 1');
    await createTestRepository(mockUser.id, 'Test Repo 2');
    
    // Act
    const response = await request(app)
      .get('/api/repositories')
      .set('Authorization', \`Bearer \${token}\`);
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('name', 'Test Repo 1');
    expect(response.body[1]).toHaveProperty('name', 'Test Repo 2');
  });
});`
            }
          ]
        });
      }, 2000);
    }
  }, [activeStep, formData.repositoryId, generationResults, repositories]);
  
  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <TestIcon sx={{ mr: 1 }} />
          Test Automation
        </Typography>
        
        <Button 
          component={Link} 
          to="/test/history"
          variant="outlined"
          startIcon={<HistoryIcon />}
        >
          Test Generation History
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
                Test Generation Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Generation Type"
                fullWidth
                value={formData.generationType}
                onChange={handleChange}
                name="generationType"
              >
                <MenuItem value="all">All Tests (Complete Coverage)</MenuItem>
                <MenuItem value="missing">Missing Tests Only</MenuItem>
                <MenuItem value="unit">Unit Tests Only</MenuItem>
                <MenuItem value="integration">Integration Tests Only</MenuItem>
                <MenuItem value="e2e">End-to-End Tests Only</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Target Coverage (%)"
                type="number"
                fullWidth
                value={formData.targetCoverage}
                onChange={handleChange}
                name="targetCoverage"
                InputProps={{
                  inputProps: { min: 0, max: 100 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Specific Files (optional, comma separated)"
                fullWidth
                value={formData.specificFiles}
                onChange={handleChange}
                name="specificFiles"
                placeholder="e.g., src/services/auth.js, src/components/Login.jsx"
                helperText="Leave empty to generate tests for the entire repository"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Test Types:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeUnitTests}
                    onChange={handleChange}
                    name="includeUnitTests"
                  />
                }
                label="Unit Tests"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeIntegrationTests}
                    onChange={handleChange}
                    name="includeIntegrationTests"
                  />
                }
                label="Integration Tests"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeE2ETests}
                    onChange={handleChange}
                    name="includeE2ETests"
                  />
                }
                label="End-to-End Tests"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.runGeneratedTests}
                    onChange={handleChange}
                    name="runGeneratedTests"
                  />
                }
                label="Run Generated Tests"
              />
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
                  startIcon={loading ? <CircularProgress size={20} /> : <StartIcon />}
                >
                  Generate Tests
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 2 && (
          <Grid container spacing={3}>
            {!generationResults ? (
              <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Generating tests...
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
                      Test Generation Results: {generationResults.repository}
                    </Typography>
                    <Chip 
                      label={generationResults.status} 
                      color={generationResults.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <TestResultSummary results={generationResults} />
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ mt: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                      <Tab label="Generated Tests" />
                      <Tab label="Code Preview" disabled={!selectedTest} />
                    </Tabs>
                    
                    <Box p={2}>
                      {activeTab === 0 && (
                        <TestsList 
                          tests={generationResults.generated_tests} 
                          onSelectTest={setSelectedTest}
                          selectedTestId={selectedTest?.id}
                        />
                      )}
                      
                      {activeTab === 1 && selectedTest && (
                        <CodePreview test={selectedTest} />
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to={`/test/jobs/${generationResults.job_id}`}
                    >
                      View Complete Test Report
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

export default TestAutomation;