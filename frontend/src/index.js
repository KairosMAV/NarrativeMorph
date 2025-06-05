import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import store from './redux/store';
import ToastNotification from './components/common/ToastNotification';

// Attendi che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  
  // Verifica che l'elemento root esista
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <CssBaseline />
            <App />
            <ToastNotification />
        </Provider>
      </React.StrictMode>
    );
  } else {
    console.error('Cannot find element with id "root"');
  }
});