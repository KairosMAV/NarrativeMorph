import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Stato sidebar
  sidebarOpen: true,
  
  // Notifiche
  notifications: [],
  unreadCount: 0,
  
  // Tema
  darkMode: localStorage.getItem('darkMode') === 'true',
  
  // Messaggi temporanei (toast/snackbar)
  toast: {
    open: false,
    message: '',
    severity: 'info', // 'error', 'warning', 'info', 'success'
    duration: 5000
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    // Notifiche
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...action.payload
      });
      state.unreadCount += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    // Tema
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
    
    // Toast/Snackbar
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        duration: action.payload.duration || 5000
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  toggleDarkMode,
  setDarkMode,
  showToast,
  hideToast
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadCount = (state) => state.ui.unreadCount;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectToast = (state) => state.ui.toast;

export default uiSlice.reducer;