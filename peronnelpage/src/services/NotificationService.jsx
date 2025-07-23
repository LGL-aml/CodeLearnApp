import React from 'react';
import { createRoot } from 'react-dom/client';
import { Snackbar, Alert, Box } from '@mui/material';

/**
 * NotificationService - A centralized service for displaying notifications
 * This creates a floating notification at the top center of the screen
 */
class NotificationService {
  constructor() {
    // Create container for notifications if it doesn't exist
    this.containerRef = document.getElementById('notification-container');
    
    if (!this.containerRef) {
      this.containerRef = document.createElement('div');
      this.containerRef.id = 'notification-container';
      document.body.appendChild(this.containerRef);
    }
    
    // Initialize root for React rendering
    this.root = createRoot(this.containerRef);
    this.activeNotification = null;
    this.queue = [];
  }

  /**
   * Show a notification
   * @param {string} message - Message to display
   * @param {string} severity - One of 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds
   */
  show(message, severity = 'info', duration = 6000) {
    const notification = { message, severity, duration, id: Date.now() };
    
    if (this.activeNotification) {
      // Queue the notification if one is already active
      this.queue.push(notification);
    } else {
      this.displayNotification(notification);
    }
  }

  /**
   * Display a notification
   * @param {Object} notification - Notification object
   */
  displayNotification(notification) {
    this.activeNotification = notification;
    
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') return;
      
      this.root.render(<></>);
      this.activeNotification = null;
      
      // Display next notification in queue if any
      if (this.queue.length > 0) {
        setTimeout(() => {
          const nextNotification = this.queue.shift();
          this.displayNotification(nextNotification);
        }, 300);
      }
    };
    
    this.root.render(
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          maxWidth: '90%',
          width: '500px'
        }}
      >
        <Snackbar
          open={true}
          autoHideDuration={notification.duration}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ width: '100%' }}
        >
          <Alert
            onClose={handleClose}
            severity={notification.severity}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '& .MuiAlert-message': {
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  /**
   * Show a success notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  success(message, duration = 6000) {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  error(message, duration = 6000) {
    this.show(message, 'error', duration);
  }

  /**
   * Show a warning notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  warning(message, duration = 6000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  info(message, duration = 6000) {
    this.show(message, 'info', duration);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 