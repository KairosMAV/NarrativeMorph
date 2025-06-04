import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Fetch all security scans
export const fetchSecurityScans = createAsyncThunk(
  'security/fetchScans',
  async (_, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock security scans data');
        return [
          {
            id: 'scan_1',
            repository: 'example-repo',
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            security_score: 78,
            total_vulnerabilities: 12,
            critical: 2,
            high: 3,
            medium: 5,
            low: 2
          },
          {
            id: 'scan_2',
            repository: 'another-repo',
            status: 'in_progress',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'scan_3',
            repository: 'test-repo',
            status: 'completed',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            security_score: 92,
            total_vulnerabilities: 5,
            critical: 0,
            high: 1,
            medium: 2,
            low: 2
          }
        ];
      }
      
      const response = await axios.get('/security/scans');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security scans');
    }
  }
);

// Fetch security scan by ID
export const fetchSecurityScanById = createAsyncThunk(
  'security/fetchScanById',
  async (id, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock security scan detail data');
        return {
          id: id,
          repository: 'example-repo',
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1200000).toISOString(),
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
        };
      }
      
      const response = await axios.get(`/security/scans/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security scan');
    }
  }
);

// Submit a new security scan
export const submitSecurityScan = createAsyncThunk(
  'security/submitScan',
  async (scanData, { rejectWithValue, dispatch }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: simulating security scan submission');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          id: 'scan_' + Date.now(),
          repository: scanData.repository_id,
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
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
        };
      }
      
      const response = await axios.post('/security/scan', scanData);
      
      dispatch(showToast({
        message: 'Security scan submitted successfully',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to submit security scan',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to submit security scan');
    }
  }
);

// Fetch all vulnerabilities
export const fetchVulnerabilities = createAsyncThunk(
  'security/fetchVulnerabilities',
  async (_, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock vulnerabilities data');
        return [
          {
            id: 'VUL-001',
            title: 'Outdated dependency with known vulnerabilities',
            severity: 'critical',
            type: 'dependency',
            repository: 'example-repo',
            detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
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
            repository: 'example-repo',
            detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
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
            repository: 'example-repo',
            detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            description: 'API key is hardcoded in the source code',
            file: 'src/services/apiService.js',
            line: 12,
            recommendation: 'Move sensitive information to environment variables or secret management'
          }
        ];
      }
      
      const response = await axios.get('/security/vulnerabilities');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vulnerabilities');
    }
  }
);