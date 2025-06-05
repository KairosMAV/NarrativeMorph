// src/components/test/TestResultSummary.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Paper,
  LinearProgress,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import {
  CheckCircleOutline as PassedIcon,
  CancelOutlined as FailedIcon,
  TrendingUp as ImprovedIcon,
  Speed as PerformanceIcon,
  Code as UnitIcon,
  Integration as IntegrationIcon,
  ScreenshotMonitor as E2EIcon
} from '@mui/icons-material';

/**
 * Component for displaying test generation and execution results
 * 
 * @param {Object} props - Component props
 * @param {Object} props.results - Test generation results
 * @returns {JSX.Element} - TestResultSummary component
 */
const TestResultSummary = ({ results }) => {
  if (!results) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="textSecondary">
          No test results available
        </Typography>
      </Box>
    );
  }
  
  const totalTests = results.tests_generated || 0;
  const passedTests = results.tests_passed || 0;
  const failedTests = results.tests_failed || 0;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  const coverage = results.coverage || {
    before: 0,
    after: 0,
    delta: 0
  };
  
  const testTypes = results.test_types || {
    unit: 0,
    integration: 0,
    e2e: 0
  };
  
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Test Results Summary
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" color="textSecondary">
                Pass Rate
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {passRate.toFixed(2)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={passRate}
              sx={{ 
                height: 10, 
                borderRadius: 1,
                bgcolor: '#f5f5f5',
                '& .MuiLinearProgress-bar': {
                  bgcolor: passRate > 90 ? 'success.main' : 
                          passRate > 70 ? 'success.light' : 
                          passRate > 50 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'success.light',
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    opacity: 0.9
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <PassedIcon sx={{ mr: 1 }} />
                    <Typography variant="h5">
                      {passedTests}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Tests Passed
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    opacity: 0.9
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <FailedIcon sx={{ mr: 1 }} />
                    <Typography variant="h5">
                      {failedTests}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Tests Failed
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Tests by Type
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Tooltip title="Unit Tests">
              <Chip 
                icon={<UnitIcon />} 
                label={`Unit: ${testTypes.unit}`} 
                color="primary" 
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="Integration Tests">
              <Chip 
                icon={<IntegrationIcon />} 
                label={`Integration: ${testTypes.integration}`} 
                color="secondary" 
                variant="outlined"
              />
            </Tooltip>
            <Tooltip title="End-to-End Tests">
              <Chip 
                icon={<E2EIcon />} 
                label={`E2E: ${testTypes.e2e}`} 
                color="info" 
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Code Coverage Analysis
          </Typography>
          
          <Box sx={{ position: 'relative', pt: 4, pb: 2 }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 20, 
                left: 0, 
                right: 0, 
                textAlign: 'center',
                zIndex: 1
              }}
            >
              <Typography 
                variant="h3" 
                color="primary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <ImprovedIcon sx={{ mr: 1 }} />
                +{coverage.delta}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Coverage Increase
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', mt: 5, mb: 3 }}>
              <Box sx={{ flex: 1, mx: 1 }}>
                <Typography align="center" variant="h5" gutterBottom>
                  {coverage.before}%
                </Typography>
                <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'warning.main',
                      height: `${coverage.before}%`,
                      borderRadius: 1
                    }}
                  />
                </Box>
                <Typography align="center" variant="body1" sx={{ mt: 1 }}>
                  Before
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, mx: 1 }}>
                <Typography align="center" variant="h5" gutterBottom>
                  {coverage.after}%
                </Typography>
                <Box sx={{ height: 200, bgcolor: 'grey.200', borderRadius: 1, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'success.main',
                      height: `${coverage.after}%`,
                      borderRadius: 1
                    }}
                  />
                </Box>
                <Typography align="center" variant="body1" sx={{ mt: 1 }}>
                  After
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TestResultSummary;