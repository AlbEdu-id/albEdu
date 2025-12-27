// ByteWard Notification System v1.0
// Advanced Toast Notification with Stack Management

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map(); // id -> notification data
        this.counter = 0;
        this.maxStack = 5;
        this.init();
    }

    init() {
        // Create container if not exists
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        // Inject CSS if not already loaded
        this.injectCSS();

        console.log('🔔 Notification System Initialized');
    }

    injectCSS() {
        if (document.querySelector('#notification-css')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/css/notification.css';
        link.id = 'notification-css';

        link.onerror = () => {
            console.warn('Notification CSS failed to load, injecting fallback');
            this.injectFallbackCSS();
        };

        link.onload = () => {
            console.log('✅ Notification CSS loaded');
        };

        document.head.appendChild(link);
    }

    injectFallbackCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                pointer-events: none;
                width: 380px;
            }
            .notification {
                background: white;
                border-radius: 12px;
                padding: 16px;
                margin: 8px 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                pointer-events: auto;
                max-width: 380px;
            }
        `;
        document.head.appendChild(style);
    }

    showNotification(options) {
        const {
            title = 'Notification',
            message = '',
            type = 'info',
            duration = 5000,
            icon = null,
            closeable = true
        } = options;

        // Generate unique ID
        const id = 'notification-' + Date.now() + '-' + this.counter++;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification notification-${type} notification-enter`;
        
        // Get icon based on type
        const iconContent = icon || this.getIconByType(type);
        const typeTitle = this.getTypeTitle(type);
        
        // Create content
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${iconContent}</div>
                <div class="notification-text">
                    <div class="notification-title">${typeTitle}: ${title}</div>
                    ${message ? `<div class="notification-message">${message}</div>` : ''}
                </div>
            </div>
            ${closeable ? '<button class="notification-close">&times;</button>' : ''}
            <div class="notification-progress">
                <div class="notification-progress-bar" style="animation: progressShrink ${duration}ms linear forwards;"></div>
            </div>
        `;

        // Add click handlers
        if (closeable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.removeNotification(id));
        }

        // Add click to dismiss (outside close button)
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close')) {
                this.removeNotification(id);
            }
        });

        // Store notification data
        this.notifications.set(id, {
            element: notification,
            type,
            duration,
            timeout: null
        });

        // Add to container
        this.container.appendChild(notification);

        // Update stack order
        this.updateStack();

        // Auto remove after duration
        const timeout = setTimeout(() => {
            this.removeNotification(id);
        }, duration);

        this.notifications.get(id).timeout = timeout;

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.remove('notification-enter');
        });

        return id;
    }

    getIconByType(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || '🔔';
    }

    getTypeTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }

    updateStack() {
        const notifications = Array.from(this.container.children);
        
        // Remove excess notifications (beyond maxStack)
        if (notifications.length > this.maxStack) {
            const toRemove = notifications.slice(this.maxStack);
            toRemove.forEach(notification => {
                const id = notification.id;
                this.removeNotification(id);
            });
        }

        // Apply stacking effects
        notifications.forEach((notification, index) => {
            if (index > 0) {
                notification.classList.add('stacked');
                // More stacking effect for deeper items
                if (index >= 3) {
                    notification.style.zIndex = 100000 - index;
                }
            } else {
                notification.classList.remove('stacked');
                notification.style.zIndex = 100000;
            }
        });
    }

    removeNotification(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element, timeout } = notificationData;

        // Clear timeout if exists
        if (timeout) clearTimeout(timeout);

        // Add exit animation
        element.classList.add('notification-exit');

        // Remove after animation completes
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
            this.updateStack();
        }, 400); // Match animation duration
    }

    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.removeNotification(id);
        });
    }

    updatePosition() {
        // This can be used to dynamically adjust position based on screen size
        const isMobile = window.innerWidth <= 767;
        
        if (isMobile) {
            this.container.style.bottom = '80px';
            this.container.style.top = 'auto';
            this.container.style.left = '0';
            this.container.style.right = 'auto';
            this.container.style.alignItems = 'center';
        } else {
            this.container.style.top = '20px';
            this.container.style.bottom = 'auto';
            this.container.style.right = '20px';
            this.container.style.left = 'auto';
            this.container.style.alignItems = 'flex-end';
        }
    }
}

// Initialize and attach to window
const NotificationManager = new NotificationSystem();

// Helper functions for common notification types
window.UI = window.UI || {};
window.UI.Notification = {
    // Show notification with custom options
    show: (options) => NotificationManager.showNotification(options),
    
    // Quick methods for common types
    success: (title, message, duration = 4000) => {
        return NotificationManager.showNotification({
            title,
            message,
            type: 'success',
            duration,
            icon: '✓'
        });
    },
    
    error: (title, message, duration = 5000) => {
        return NotificationManager.showNotification({
            title,
            message,
            type: 'error',
            duration,
            icon: '✗'
        });
    },
    
    warning: (title, message, duration = 4000) => {
        return NotificationManager.showNotification({
            title,
            message,
            type: 'warning',
            duration,
            icon: '⚠'
        });
    },
    
    info: (title, message, duration = 3000) => {
        return NotificationManager.showNotification({
            title,
            message,
            type: 'info',
            duration,
            icon: 'ℹ'
        });
    },
    
    // Management methods
    remove: (id) => NotificationManager.removeNotification(id),
    clearAll: () => NotificationManager.clearAll(),
    updatePosition: () => NotificationManager.updatePosition()
};

// Update position on resize and orientation change
window.addEventListener('resize', () => NotificationManager.updatePosition());
window.addEventListener('orientationchange', () => {
    setTimeout(() => NotificationManager.updatePosition(), 100);
});

// Initialize position
setTimeout(() => NotificationManager.updatePosition(), 100);

console.log('🔔 ByteWard Notification System Ready');

// Replace old showError function with new notification system
const originalShowError = window.UI.showError;
window.UI.showError = function(message) {
    // Use new notification system
    window.UI.Notification.error('System Error', message);
    
    // Also call original if exists (for backward compatibility)
    if (originalShowError) {
        originalShowError(message);
    }
};

// Update showStatus function in profile system to use notifications
function updateStatusFunctions() {
    // This would be called after the notification system is loaded
    console.log('🔄 Updated status functions to use notification system');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
