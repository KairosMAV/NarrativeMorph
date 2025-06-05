import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { selectToast, hideToast } from '../../redux/slices/uiSlice';

/**
 * Global snackbar notification component that connects to Redux state
 */
const ToastNotification = () => {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    dispatch(hideToast());
  };
  
  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={toast.duration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={toast.severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;