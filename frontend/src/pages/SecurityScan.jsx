// src/pages/SecurityScan.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Button, 
  Stepper, Step, StepLabel, TextField, MenuItem, 
  CircularProgress, Alert, Divider, Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugIcon,
  ViewList as ScanListIcon,
  PlayArrow as StartScanIcon,
  ArrowForward as NextIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Componenti
import VulnerabilityTable from '../components/security/VulnerabilityTable';
import SecurityScoreGauge from '../components/security/SecurityScoreGauge';
import VulnerabilityTrend from '../components/security/VulnerabilityTrend';

// Redux
import { selectAllRepositories } from '../redux/slices/repositorySlice';
import { submitSecurityScan } from '../redux/thunks/securityThunks';

const SecurityScan = () => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectAllRepositories);
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    repositoryId: '',
    branch: 'main',
    scanType: 'full',
    includeDeprecatedLibs: true,
    includeSecretsScanning: true,
    includeSASTAnalysis: true
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
      // Componi i dati per la scansione
      const scanData = {
        repository_id: formData.repositoryId,
        branch: formData.branch,
        scan_type: formData.scanType,
        options: {
          include_dependencies: formData.includeDeprecatedLibs,
          include_secrets: formData.includeSecretsScanning,
          include_sast: formData.includeSASTAnalysis
        }
      };
      
      // Chiamata all'API di scansione
      const result = await dispatch(submitSecurityScan(scanData)).unwrap();
      
      setScanResults(result);
      setScanCompleted(true);
      handleNext();
    } catch (err) {
      setError(err.message || 'Error submitting security scan');
    } finally {
      setLoading(false);
    }
  };
  
  // Steps per lo stepper
  const steps = [
    'Select Repository',
    'Configure Scan',
    'Results'
  ];
  
  // Per simulare i risultati nella demo standalone
  useEffect(() => {
    if (activeStep === 2 && !scanResults && process.env.NODE_ENV === 'development') {
      // Mock data per sviluppo frontend
      setTimeout(() => {
        setScanResults({
          scan_id: 'scan_' + Date.now(),
          repository: repositories.find(r => r.id === formData.repositoryId)?.name || 'Unknown Repo',
          status: 'completed',
          security_score: 78,
          total_vulnerabilities: 12,
          critical: 2,
          high: 3,
          medium: 5,
          low: 2,
          by_type: {
            dependency: 5,
            code_pattern: 4,
            secret: 2,
            configuration: 1
          },
          vulnerabilities: [
            {
              id: 'VUL-001',
              title: 'Outdated dependency with known vulnerabilities',
              severity: 'critical',
              type: 'dependency',
              description: 'The application uses an outdated version of log4j (2.14.0) which is vulnerable to CVE-2021-44228',
              file: 'pom.xml',
              line: 45,
              recommendation: 'Update to log4j 2.15.0 or later'
            },
            {
              id: 'VUL-002',
              title: 'SQL Injection vulnerability',
              severity: 'high',
              type: 'code_pattern',
              description: 'The application constructs SQL queries using string concatenation with user input',
              file: 'src/controllers/userController.js',
              line: 78,
              recommendation: 'Use parameterized queries instead of string concatenation'
            },
            {
              id: 'VUL-003',
              title: 'Hardcoded API key',
              severity: 'high',
              type: 'secret',
              description: 'API key is hardcoded in the source code',
              file: 'src/services/apiService.js',
              line: 12,
              recommendation: 'Move sensitive information to environment variables or secret management'
            }
          ]
        });
      }, 2000);
    }
  }, [activeStep, formData.repositoryId, repositories, scanResults]);
  
  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Security Scanning
        </Typography>
        
        <Button 
          component={Link} 
          to="/security/scans"
          variant="outlined"
          startIcon={<ScanListIcon />}
        >
          View All Scans
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
                Scan Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Scan Type"
                fullWidth
                value={formData.scanType}
                onChange={handleChange}
                name="scanType"
              >
                <MenuItem value="full">Full Scan (All Checks)</MenuItem>
                <MenuItem value="quick">Quick Scan (Critical & High only)</MenuItem>
                <MenuItem value="dependencies">Dependencies Only</MenuItem>
                <MenuItem value="code_only">Code Analysis Only</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Include in Scan:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip 
                  label="Deprecated Dependencies" 
                  color={formData.includeDeprecatedLibs ? "primary" : "default"}
                  onClick={() => setFormData({...formData, includeDeprecatedLibs: !formData.includeDeprecatedLibs})}
                />
                <Chip 
                  label="Secrets Scanning" 
                  color={formData.includeSecretsScanning ? "primary" : "default"}
                  onClick={() => setFormData({...formData, includeSecretsScanning: !formData.includeSecretsScanning})}
                />
                <Chip 
                  label="SAST Analysis" 
                  color={formData.includeSASTAnalysis ? "primary" : "default"}
                  onClick={() => setFormData({...formData, includeSASTAnalysis: !formData.includeSASTAnalysis})}
                />
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
                  startIcon={loading ? <CircularProgress size={20} /> : <StartScanIcon />}
                >
                  Start Security Scan
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 2 && (
          <Grid container spacing={3}>
            {!scanResults ? (
              <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Performing security scan...
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
                      Scan Results: {scanResults.repository}
                    </Typography>
                    <Chip 
                      label={scanResults.status} 
                      color={scanResults.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom align="center">
                      Security Score
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <SecurityScoreGauge score={scanResults.security_score} />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Vulnerabilities Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="error.main">
                            {scanResults.critical}
                          </Typography>
                          <Typography variant="body2">Critical</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="warning.main">
                            {scanResults.high}
                          </Typography>
                          <Typography variant="body2">High</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="info.main">
                            {scanResults.medium}
                          </Typography>
                          <Typography variant="body2">Medium</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="success.main">
                            {scanResults.low}
                          </Typography>
                          <Typography variant="body2">Low</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      By Vulnerability Type
                    </Typography>
                    <Grid container spacing={1}>
                      {Object.entries(scanResults.by_type).map(([type, count]) => (
                        <Grid item key={type}>
                          <Chip 
                            label={`${type}: ${count}`} 
                            color="primary" 
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Detected Vulnerabilities
                  </Typography>
                  <VulnerabilityTable vulnerabilities={scanResults.vulnerabilities} />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to={`/security/scans/${scanResults.scan_id}`}
                    >
                      View Detailed Report
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

export default SecurityScan;