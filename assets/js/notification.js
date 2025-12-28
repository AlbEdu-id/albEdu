/**
 * HyperOS Notification System
 * Modern, responsive notification system with mobile/desktop modes
 */

class HyperOSNotification {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.maxDesktopNotifications = 8;
        this.maxMobileNotifications = 3;
        this.autoIncrementId = 0;
        
        // Default configurations
        this.config = {
            success: {
                icon: "check_circle",
                title: "Berhasil",
                msg: "Data berhasil sinkron"
            },
            error: {
                icon: "error",
                title: "Gagal",
                msg: "Terjadi kesalahan sistem"
            },
            warning: {
                icon: "warning",
                title: "Peringatan",
                msg: "Baterai mulai lemah"
            },
            info: {
                icon: "info",
                title: "Info",
                msg: "Pembaruan tersedia"
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize the notification system
     */
    init() {
        // Create container if not exists
        if (!document.getElementById('hyperos-notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'hyperos-notification-container';
            this.container.className = 'hyperos-notification-container';
            document.body.appendChild(this.container);
            
            // Load Material Icons if not already loaded
            this.loadMaterialIcons();
            
            // Set initial mode based on screen width
            this.updateMode();
            
            // Listen for resize events
            window.addEventListener('resize', () => this.updateMode());
            
            console.log('🔔 HyperOS Notification System Initialized');
        } else {
            this.container = document.getElementById('hyperos-notification-container');
        }
    }
    
    /**
     * Load Material Icons font if not already loaded
     */
    loadMaterialIcons() {
        if (!document.querySelector('link[href*="material-icons"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        // Load Inter font if not already loaded
        if (!document.querySelector('link[href*="inter"]')) {
            const interLink = document.createElement('link');
            interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            interLink.rel = 'stylesheet';
            document.head.appendChild(interLink);
        }
    }
    
    /**
     * Update container mode (mobile/desktop) based on screen width
     */
    updateMode() {
        const isDesktop = window.innerWidth > 768;
        this.container.className = `hyperos-notification-container ${isDesktop ? 'desktop-mode' : 'mobile-mode'}`;
        
        // Update all active notifications
        this.notifications.forEach((notification) => {
            if (!notification.isDead) {
                notification.isDesktop = isDesktop;
                this.updateNotificationUI(notification);
            }
        });
    }
    
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Type of notification (success, error, warning, info)
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {number} options.duration - Duration in milliseconds (default: 4000)
     * @param {string} options.icon - Custom Material Icon name
     * @returns {string} Notification ID
     */
    show(options) {
        const {
            type = 'info',
            title = null,
            message = null,
            duration = 4000,
            icon = null
        } = options;
        
        // Use default config if title/message not provided
        const config = this.config[type] || this.config.info;
        const finalTitle = title || config.title;
        const finalMessage = message || config.msg;
        const finalIcon = icon || config.icon;
        
        const id = `hyperos-notif-${Date.now()}-${this.autoIncrementId++}`;
        const isDesktop = window.innerWidth > 768;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `hyperos-notification ${type} spawn`;
        
        // Prepare classes for desktop animation
        const iconClass = isDesktop ? 'hyperos-stagger' : '';
        const textSmallClass = isDesktop ? 'hyperos-stagger' : '';
        const textMainClass = isDesktop ? 'hyperos-stagger' : '';
        
        // Build notification HTML
        notification.innerHTML = `
            <div class="hyperos-notification-icon ${iconClass}">
                <div class="hyperos-icon-blob">
                    <span class="material-icons-round">${finalIcon}</span>
                </div>
            </div>
            <div class="hyperos-notification-text">
                <div class="hyperos-text-small ${textSmallClass}">${finalTitle}</div>
                <div class="hyperos-text-main ${textMainClass}">${finalMessage}</div>
            </div>
            <div class="hyperos-progress-track">
                <div class="hyperos-progress-bar" id="hyperos-pb-${id}"></div>
            </div>
        `;
        
        const notificationData = {
            id,
            element: notification,
            isDead: false,
            duration,
            isDesktop,
            type,
            createdAt: Date.now(),
            timer: null
        };
        
        // Store notification
        this.notifications.set(id, notificationData);
        
        // Add to container
        this.container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.refreshUI();
                
                // Start progress bar
                const progressBar = notification.querySelector(`#hyperos-pb-${id}`);
                if (progressBar) {
                    progressBar.style.transition = `transform ${duration}ms linear`;
                    progressBar.style.transform = isDesktop ? "scaleY(0)" : "scaleX(0)";
                }
            }, 40);
        });
        
        // Set auto-dismiss timer
        notificationData.timer = setTimeout(() => this.dismiss(id), duration);
        
        // Desktop hover interactions
        if (isDesktop) {
            notification.addEventListener('mouseenter', () => this.pauseDismiss(id));
            notification.addEventListener('mouseleave', () => this.resumeDismiss(id));
        } else {
            // Mobile swipe to dismiss
            this.bindSwipe(notificationData);
            
            // Mobile: Remove excess notifications
            const activeMobileNotifications = Array.from(this.notifications.values())
                .filter(item => !item.isDead && !item.isDesktop);
            
            if (activeMobileNotifications.length > this.maxMobileNotifications) {
                const notificationsToRemove = activeMobileNotifications.slice(this.maxMobileNotifications);
                notificationsToRemove.forEach(item => this.dismiss(item.id));
            }
        }
        
        // Desktop: Remove excess notifications
        if (isDesktop) {
            const activeDesktopNotifications = Array.from(this.notifications.values())
                .filter(item => !item.isDead && item.isDesktop);
            
            if (activeDesktopNotifications.length > this.maxDesktopNotifications) {
                const notificationsToRemove = activeDesktopNotifications.slice(this.maxDesktopNotifications);
                notificationsToRemove.forEach(item => this.dismiss(item.id));
            }
        }
        
        return id;
    }
    
    /**
     * Update notification UI based on position in stack
     */
    refreshUI() {
        const isDesktop = window.innerWidth > 768;
        const aliveNotifications = Array.from(this.notifications.values())
            .filter(item => !item.isDead);
        
        aliveNotifications.forEach((notification, index) => {
            const element = notification.element;
            
            // Remove all state classes
            element.classList.remove('spawn', 'active', 'layer-1', 'layer-2');
            
            if (isDesktop) {
                // Stack vertically for desktop with 12px gap
                const yOffset = index * -(145 + 12);
                element.style.setProperty('--y-offset', `${yOffset}px`);
                element.classList.add('active');
            } else {
                // Mobile: Only show top 3 notifications with different layers
                element.style.transitionDelay = (index * 0.05) + "s";
                
                if (index === 0) element.classList.add('active');
                else if (index === 1) element.classList.add('layer-1');
                else if (index === 2) element.classList.add('layer-2');
            }
        });
    }
    
    /**
     * Update individual notification UI
     */
    updateNotificationUI(notification) {
        const isDesktop = notification.isDesktop;
        const element = notification.element;
        
        // Update progress bar orientation
        const progressBar = element.querySelector('.hyperos-progress-bar');
        if (progressBar) {
            progressBar.style.transform = isDesktop ? "scaleY(1)" : "scaleX(1)";
        }
        
        this.refreshUI();
    }
    
    /**
     * Dismiss a notification
     * @param {string} id - Notification ID
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        notification.isDead = true;
        clearTimeout(notification.timer);
        
        const element = notification.element;
        element.classList.add('exit');
        element.classList.remove('active', 'layer-1', 'layer-2');
        
        this.refreshUI();
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 800);
    }
    
    /**
     * Pause auto-dismiss on hover (desktop only)
     */
    pauseDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead) return;
        
        clearTimeout(notification.timer);
        
        const progressBar = notification.element.querySelector('.hyperos-progress-bar');
        if (progressBar) {
            // Freeze progress bar
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.replace('scaleY(', '').replace('scaleX(', '').replace(')', '')) : 1;
            
            progressBar.style.transitionDuration = '0ms';
            notification.pausedProgress = currentScale;
        }
    }
    
    /**
     * Resume auto-dismiss after hover (desktop only)
     */
    resumeDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead) return;
        
        // Resume after 500ms delay
        setTimeout(() => {
            if (notification.isDead) return;
            
            const progressBar = notification.element.querySelector('.hyperos-progress-bar');
            if (progressBar && notification.pausedProgress !== undefined) {
                const remaining = Math.max(1000, notification.duration * notification.pausedProgress);
                
                progressBar.style.transition = `transform ${remaining}ms linear`;
                progressBar.style.transform = notification.isDesktop ? "scaleY(0)" : "scaleX(0)";
                
                notification.timer = setTimeout(() => this.dismiss(id), remaining);
                delete notification.pausedProgress;
            }
        }, 500);
    }
    
    /**
     * Bind swipe gesture for mobile dismiss
     */
    bindSwipe(notification) {
        let startY = 0;
        const element = notification.element;
        
        element.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            // Swipe up to dismiss
            if (startY - endY > 40) {
                this.dismiss(notification.id);
            }
        }, { passive: true });
    }
    
    /**
     * Clear all notifications
     */
    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.dismiss(id);
        });
    }
    
    /**
     * Quick method to show success notification
     */
    success(title, message, duration = 4000) {
        return this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show error notification
     */
    error(title, message, duration = 5000) {
        return this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show warning notification
     */
    warning(title, message, duration = 4000) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }
    
    /**
     * Quick method to show info notification
     */
    info(title, message, duration = 3000) {
        return this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }
    
    /**
     * Update default configuration
     */
    setConfig(type, config) {
        if (this.config[type]) {
            this.config[type] = { ...this.config[type], ...config };
        }
    }
    
    /**
     * Add custom notification type
     */
    addType(type, config) {
        this.config[type] = config;
    }
}

// Create global instance
const HyperOSNotifications = new HyperOSNotification();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyperOSNotifications;
}

// Attach to window for global access
window.HyperOS = window.HyperOS || {};
window.HyperOS.Notifications = HyperOSNotifications;

// Quick access methods
window.notify = {
    success: (title, message, duration) => HyperOSNotifications.success(title, message, duration),
    error: (title, message, duration) => HyperOSNotifications.error(title, message, duration),
    warning: (title, message, duration) => HyperOSNotifications.warning(title, message, duration),
    info: (title, message, duration) => HyperOSNotifications.info(title, message, duration),
    show: (options) => HyperOSNotifications.show(options),
    dismiss: (id) => HyperOSNotifications.dismiss(id),
    clearAll: () => HyperOSNotifications.clearAll()
};

console.log('🔔 HyperOS Notification System Ready - Use window.notify.success(), window.notify.error(), etc.');
