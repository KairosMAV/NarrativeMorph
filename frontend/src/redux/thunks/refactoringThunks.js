import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Fetch all refactoring jobs
export const fetchRefactoringJobs = createAsyncThunk(
  'refactoring/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock refactoring jobs data');
        return [
          {
            id: 'ref_1',
            repository: 'example-repo',
            branch: 'main',
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
            refactoring_type: 'code_quality',
            files_changed: 12,
            description: 'Refactored legacy code in UserService to use modern ES6 features'
          },
          {
            id: 'ref_2',
            repository: 'another-repo',
            branch: 'refactor/authentication',
            status: 'in_progress',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            refactoring_type: 'performance'
          },
          {
            id: 'ref_3',
            repository: 'test-repo',
            branch: 'develop',
            status: 'completed',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
            refactoring_type: 'architecture',
            files_changed: 27,
            description: 'Converted monolithic application to microservices architecture'
          }
        ];
      }
      
      const response = await axios.get('/refactoring/jobs');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch refactoring jobs');
    }
  }
);

// Fetch refactoring job by ID
export const fetchRefactoringJobById = createAsyncThunk(
  'refactoring/fetchJobById',
  async (id, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock refactoring job detail data');
        return {
          id: id,
          repository: 'example-repo',
          branch: 'main',
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
          refactoring_type: 'code_quality',
          files_changed: 12,
          description: 'Refactored legacy code in UserService to use modern ES6 features',
          changes: [
            {
              file: 'src/services/UserService.js',
              type: 'modified',
              before: `
function UserService() {
  var self = this;
  
  self.findUserById = function(userId, callback) {
    db.query('SELECT * FROM users WHERE id = ' + userId, function(err, result) {
      if (err) return callback(err);
      if (result.length === 0) return callback(null, null);
      callback(null, result[0]);
    });
  };
  
  self.createUser = function(userData, callback) {
    var username = userData.username;
    var email = userData.email;
    var passwordHash = hashPassword(userData.password);
    
    db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ("' + 
      username + '", "' + email + '", "' + passwordHash + '")', 
      function(err, result) {
        if (err) return callback(err);
        callback(null, { id: result.insertId, username: username, email: email });
      }
    );
  };
}
              `,
              after: `
class UserService {
  static async findUserById(userId) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(\`Error finding user: \${error.message}\`);
    }
  }
  
  static async createUser(userData) {
    const { username, email, password } = userData;
    const passwordHash = await hashPassword(password);
    
    try {
      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      
      return { id: result.insertId, username, email };
    } catch (error) {
      throw new Error(\`Error creating user: \${error.message}\`);
    }
  }
}
              `
            },
            {
              file: 'src/controllers/UserController.js',
              type: 'modified',
              before: `
var UserService = require('../services/UserService');
var userService = new UserService();

module.exports.getUserById = function(req, res) {
  var userId = req.params.id;
  
  userService.findUserById(userId, function(err, user) {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
};
              `,
              after: `
const { UserService } = require('../services/UserService');

module.exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
              `
            }
          ]
        };
      }
      
      const response = await axios.get(`/refactoring/jobs/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch refactoring job');
    }
  }
);

// Submit a new refactoring job
export const submitRefactoringJob = createAsyncThunk(
  'refactoring/submitJob',
  async (refactoringData, { rejectWithValue, dispatch }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: simulating refactoring job submission');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          id: 'ref_' + Date.now(),
          repository: refactoringData.repository_id,
          branch: refactoringData.branch || 'main',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          refactoring_type: refactoringData.refactoring_type || 'code_quality',
          description: refactoringData.description || 'Automated code refactoring'
        };
      }
      
      const response = await axios.post('/refactoring/jobs', refactoringData);
      
      dispatch(showToast({
        message: 'Refactoring job submitted successfully',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to submit refactoring job',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to submit refactoring job');
    }
  }
);