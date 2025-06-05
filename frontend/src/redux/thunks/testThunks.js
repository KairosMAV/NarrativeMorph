import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Fetch all test jobs
export const fetchTestJobs = createAsyncThunk(
  'test/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock test jobs data');
        return [
          {
            id: 'test_1',
            repository: 'example-repo',
            branch: 'main',
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
            test_type: 'unit',
            tests_generated: 42,
            coverage: 76.5
          },
          {
            id: 'test_2',
            repository: 'another-repo',
            branch: 'feature/new-api',
            status: 'in_progress',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            test_type: 'integration'
          },
          {
            id: 'test_3',
            repository: 'test-repo',
            branch: 'develop',
            status: 'completed',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
            test_type: 'e2e',
            tests_generated: 15,
            coverage: 65.2
          }
        ];
      }
      
      const response = await axios.get('/test/jobs');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test jobs');
    }
  }
);

// Fetch test job by ID
export const fetchTestJobById = createAsyncThunk(
  'test/fetchJobById',
  async (id, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock test job detail data');
        return {
          id: id,
          repository: 'example-repo',
          branch: 'main',
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
          test_type: 'unit',
          tests_generated: 42,
          coverage: 76.5,
          test_files: [
            {
              name: 'UserService.test.js',
              path: 'src/services/__tests__/UserService.test.js',
              content: `
import { UserService } from '../UserService';
import { db } from '../../db';

jest.mock('../../db');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'testuser' };
      db.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await UserService.findUserById(1);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(db.findById).toHaveBeenCalledWith('users', 1);
    });
    
    it('should return null when user not found', async () => {
      // Arrange
      db.findById.mockResolvedValue(null);
      
      // Act
      const result = await UserService.findUserById(999);
      
      // Assert
      expect(result).toBeNull();
      expect(db.findById).toHaveBeenCalledWith('users', 999);
    });
  });
});
              `
            },
            {
              name: 'AuthController.test.js',
              path: 'src/controllers/__tests__/AuthController.test.js',
              content: `
import { AuthController } from '../AuthController';
import { UserService } from '../../services/UserService';
import { TokenService } from '../../services/TokenService';

jest.mock('../../services/UserService');
jest.mock('../../services/TokenService');

describe('AuthController', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 when username is missing', async () => {
      // Arrange
      req.body = { password: 'password123' };
      
      // Act
      await AuthController.login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('username')
      }));
    });
  });
});
              `
            }
          ]
        };
      }
      
      const response = await axios.get(`/test/jobs/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test job');
    }
  }
);

// Submit a new test generation
export const submitTestGeneration = createAsyncThunk(
  'test/submitTestGeneration',
  async (testData, { rejectWithValue, dispatch }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: simulating test generation submission');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          id: 'test_' + Date.now(),
          repository: testData.repository_id,
          branch: testData.branch || 'main',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          test_type: testData.test_type || 'unit'
        };
      }
      
      const response = await axios.post('/test/generate', testData);
      
      dispatch(showToast({
        message: 'Test generation submitted successfully',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to submit test generation',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to submit test generation');
    }
  }
);