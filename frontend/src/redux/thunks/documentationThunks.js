import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/api';
import { showToast } from '../slices/uiSlice';

// Fetch all documentations
export const fetchDocumentations = createAsyncThunk(
  'documentation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock documentations data');
        return [
          {
            id: 'doc_1',
            repository: 'example-repo',
            branch: 'main',
            status: 'completed',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
            doc_type: 'api',
            format: 'markdown',
            title: 'API Documentation'
          },
          {
            id: 'doc_2',
            repository: 'another-repo',
            branch: 'feature/new-module',
            status: 'in_progress',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            doc_type: 'code',
            format: 'html'
          },
          {
            id: 'doc_3',
            repository: 'test-repo',
            branch: 'develop',
            status: 'completed',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1200000).toISOString(),
            doc_type: 'user_guide',
            format: 'pdf',
            title: 'User Guide'
          }
        ];
      }
      
      const response = await axios.get('/documentation');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documentations');
    }
  }
);

// Fetch documentation by ID
export const fetchDocumentationById = createAsyncThunk(
  'documentation/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: returning mock documentation detail data');
        return {
          id: id,
          repository: 'example-repo',
          branch: 'main',
          status: 'completed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1800000).toISOString(),
          doc_type: 'api',
          format: 'markdown',
          title: 'API Documentation',
          content: `
# API Documentation

## Overview

This documentation provides details about the REST API endpoints available in the system.

## Authentication

All API requests require authentication using JWT tokens. To obtain a token, use the login endpoint.

### Login Endpoint

\`\`\`http
POST /api/auth/login
\`\`\`

**Request Body:**

\`\`\`json
{
  "username": "string",
  "password": "string"
}
\`\`\`

**Response:**

\`\`\`json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
\`\`\`

## User API

### Get User Profile

\`\`\`http
GET /api/users/profile
\`\`\`

**Headers:**

\`\`\`
Authorization: Bearer {token}
\`\`\`

**Response:**

\`\`\`json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "createdAt": "string (ISO date)"
}
\`\`\`

### Update User Profile

\`\`\`http
PUT /api/users/profile
\`\`\`

**Headers:**

\`\`\`
Authorization: Bearer {token}
\`\`\`

**Request Body:**

\`\`\`json
{
  "fullName": "string",
  "email": "string"
}
\`\`\`

**Response:**

\`\`\`json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "updatedAt": "string (ISO date)"
}
\`\`\`
`
        };
      }
      
      const response = await axios.get(`/documentation/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documentation');
    }
  }
);

// Submit a new documentation generation
export const submitDocGeneration = createAsyncThunk(
  'documentation/submitGeneration',
  async (docData, { rejectWithValue, dispatch }) => {
    try {
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Dev mode: simulating documentation generation submission');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          id: 'doc_' + Date.now(),
          repository: docData.repository_id,
          branch: docData.branch || 'main',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          doc_type: docData.doc_type || 'api',
          format: docData.format || 'markdown',
          title: docData.title || 'Generated Documentation'
        };
      }
      
      const response = await axios.post('/documentation/generate', docData);
      
      dispatch(showToast({
        message: 'Documentation generation submitted successfully',
        severity: 'success'
      }));
      
      return response.data;
    } catch (error) {
      dispatch(showToast({
        message: error.response?.data?.message || 'Failed to submit documentation generation',
        severity: 'error'
      }));
      
      return rejectWithValue(error.response?.data?.message || 'Failed to submit documentation generation');
    }
  }
);