import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import repositoryReducer from './slices/repositorySlice';
import analysisReducer from './slices/analysisSlice';
import uiReducer from './slices/uiSlice';
import securityReducer from './slices/securitySlice';
import testReducer from './slices/testSlice';
import refactoringReducer from './slices/refactoringSlice';
import documentationReducer from './slices/documentationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    repositories: repositoryReducer,
    analyses: analysisReducer,
    ui: uiReducer,
    security: securityReducer,
    test: testReducer,
    refactoring: refactoringReducer,
    documentation: documentationReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['some/action'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;