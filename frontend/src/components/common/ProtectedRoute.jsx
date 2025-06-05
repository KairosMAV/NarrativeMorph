// src/components/common/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import authService from '../../services/authService';

/**
 * Componente che protegge le rotte che richiedono autenticazione
 * @param {Object} props - Proprietà del componente
 * @param {JSX.Element} props.children - Componenti figli
 * @param {boolean} [props.adminOnly=false] - Se true, richiede ruolo admin
 * @returns {JSX.Element} - Route protetta
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Verifica autenticazione
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Verifica se il token è valido provando a ottenere il profilo utente
        try {
          const user = await authService.getUserProfile();
          setIsAuthenticated(true);
          
          // Verifica se è admin (se necessario)
          if (adminOnly) {
            setIsAdmin(user.role === 'admin');
          } else {
            setIsAdmin(true); // Non serve il controllo admin
          }
        } catch (error) {
          console.error('Authentication error:', error);
          
          // Token non valido o scaduto
          authService.logout();
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [adminOnly]);

  // Mostra spinner durante il controllo
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Reindirizza al login se non autenticato
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Reindirizza alla dashboard se non è admin e la rotta richiede admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se autenticato, renderizza il contenuto protetto
  return children;
};

export default ProtectedRoute;