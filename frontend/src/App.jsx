// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

// Componenti di layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pagine
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import NewRepository from './pages/NewRepository';
import AnalysisDetail from './pages/AnalysisDetail';
import Analyses from './pages/Analyses';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Welcome from './pages/Welcome';

// Nuove pagine
import SecurityScan from './pages/SecurityScan';
import SecurityScans from './pages/SecurityScans';
import SecurityScanDetail from './pages/SecurityScanDetail';
import TestAutomation from './pages/TestAutomation';
import TestHistory from './pages/TestHistory';
import TestJobDetail from './pages/TestJobDetail';
import Refactoring from './pages/Refactoring';
import RefactoringHistory from './pages/RefactoringHistory';
import RefactoringJobDetail from './pages/RefactoringJobDetail';
import Documentation from './pages/Documentation';
import DocumentationHistory from './pages/DocumentationHistory';
import DocumentationDetail from './pages/DocumentationDetail';

// Componenti comuni
import ProtectedRoute from './components/common/ProtectedRoute';
import ToastNotification from './components/common/ToastNotification';

// Redux
import { fetchUserProfile } from './redux/thunks/authThunks';
import { selectIsAuthenticated, selectAuthLoading } from './redux/slices/authSlice';
import { selectDarkMode } from './redux/slices/uiSlice';

// Configurazione tema
const getLightTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
});

const getDarkTheme = () => createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ba68c8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
});

// Layout principale dell'applicazione
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: 10, // Spazio per l'header
            transition: 'margin-left 0.2s',
            marginLeft: sidebarOpen ? '240px' : '0',
            width: sidebarOpen ? 'calc(100% - 240px)' : '100%',
          }}
        >
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const darkMode = useSelector(selectDarkMode);
  
  // Verifica autenticazione all'avvio
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);
  
  // Selezione tema
  const theme = darkMode ? getDarkTheme() : getLightTheme();
  
  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh'
        }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          
          {/* Rotte protette */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/repositories" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Repositories />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/repositories/new" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NewRepository />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/repositories/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RepositoryDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analyses" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Analyses />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analysis/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AnalysisDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Security Routes */}
          <Route 
            path="/security/scan" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SecurityScan />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/security/scans" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SecurityScans />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/security/scans/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SecurityScanDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Test Automation Routes */}
          <Route 
            path="/test/generate" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TestAutomation />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/test/history" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TestHistory />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/test/jobs/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TestJobDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Refactoring Routes */}
          <Route 
            path="/refactoring" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Refactoring />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/refactoring/history" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RefactoringHistory />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/refactoring/jobs/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RefactoringJobDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Documentation Routes */}
          <Route 
            path="/documentation/generate" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Documentation />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/documentation/history" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DocumentationHistory />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/documentation/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DocumentationDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/help" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Help />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Pagina 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Notifiche toast globali */}
        <ToastNotification />
      </Router>
    </ThemeProvider>
  );
}

export default App;