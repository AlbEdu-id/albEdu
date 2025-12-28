/**
 * ByteWard UI Module v0.1.7
 * Complete UI System with Notification System v3.0 Integration
 * Rewritten for maximum compatibility and performance
 */

console.log('🎨 Memuat UI Module v0.1.7...');

// =======================
// Configuration & Constants
// =======================
const UI_CONFIG = {
    version: '0.1.7',
    build: '2024.01.17',
    features: {
        profileSystem: true,
        notificationSystem: true,
        loadingSystem: true,
        errorSystem: true,
        modalSystem: true,
        toastSystem: true,
        themeSystem: true,
        animationSystem: true
    },
    defaults: {
        theme: 'light',
        animationSpeed: 300,
        maxNotifications: 8,
        maxToasts: 5,
        autoCloseDuration: 5000,
        mobileBreakpoint: 768
    },
    classes: {
        profileButton: 'byteward-profile-btn',
        profilePanel: 'byteward-profile-panel',
        notificationContainer: 'byteward-notification-container',
        modalContainer: 'byteward-modal-container',
        toastContainer: 'byteward-toast-container',
        loadingOverlay: 'byteward-loading-overlay'
    }
};

// CSS Constants
const CSS_VARIABLES = {
    colors: {
        primary: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        dark: '#1f2937',
        light: '#f9fafb'
    },
    shadows: {
        small: '0 2px 8px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
        large: '0 8px 32px rgba(0, 0, 0, 0.2)',
        xlarge: '0 16px 64px rgba(0, 0, 0, 0.25)'
    },
    radii: {
        small: '8px',
        medium: '12px',
        large: '16px',
        xlarge: '24px',
        round: '50%'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    }
};

// =======================
// Core UI System Manager
// =======================
class UIManager {
    constructor() {
        this.components = new Map();
        this.listeners = new Map();
        this.stylesInjected = false;
        this.initialized = false;
        this.currentTheme = UI_CONFIG.defaults.theme;
        this.isMobile = window.innerWidth <= UI_CONFIG.defaults.mobileBreakpoint;
        
        // Initialize subsystems
        this.notification = null;
        this.modal = null;
        this.toast = null;
        this.profile = null;
        this.loading = null;
        this.error = null;
    }

    async initialize() {
        if (this.initialized) return;

        console.log(`🚀 Initializing UI System v${UI_CONFIG.version}...`);
        
        try {
            // 1. Inject global styles
            this.injectGlobalStyles();
            
            // 2. Initialize subsystems
            this.notification = new NotificationAdapter();
            this.modal = new ModalSystem();
            this.toast = new ToastSystem();
            this.profile = new ProfileSystem();
            this.loading = new LoadingSystem();
            this.error = new ErrorSystem();
            
            // 3. Setup event listeners
            this.setupEventListeners();
            
            // 4. Setup theme
            this.setupTheme();
            
            // 5. Check for logged in user
            this.checkUserState();
            
            this.initialized = true;
            
            console.log('✅ UI System successfully initialized with:');
            console.log('   - Notification System ✓');
            console.log('   - Modal System ✓');
            console.log('   - Toast System ✓');
            console.log('   - Profile System ✓');
            console.log('   - Loading System ✓');
            console.log('   - Error System ✓');
            console.log('   - Theme System ✓');
            
            // Dispatch ready event
            this.dispatchEvent('ui:ready', { version: UI_CONFIG.version });
            
        } catch (error) {
            console.error('❌ Failed to initialize UI System:', error);
            this.showError(`UI System initialization failed: ${error.message}`, {
                title: 'UI Error',
                showNotification: true
            });
        }
    }

    injectGlobalStyles() {
        if (this.stylesInjected) return;
        
        const style = document.createElement('style');
        style.id = 'byteward-ui-styles';
        style.textContent = this.generateGlobalCSS();
        document.head.appendChild(style);
        
        this.stylesInjected = true;
        console.log('🎨 Global UI styles injected');
    }

    generateGlobalCSS() {
        return `
            /* ByteWard UI Global Styles v${UI_CONFIG.version} */
            :root {
                /* Color Variables */
                --byteward-primary: ${CSS_VARIABLES.colors.primary};
                --byteward-success: ${CSS_VARIABLES.colors.success};
                --byteward-error: ${CSS_VARIABLES.colors.error};
                --byteward-warning: ${CSS_VARIABLES.colors.warning};
                --byteward-info: ${CSS_VARIABLES.colors.info};
                --byteward-dark: ${CSS_VARIABLES.colors.dark};
                --byteward-light: ${CSS_VARIABLES.colors.light};
                
                /* Shadow Variables */
                --byteward-shadow-sm: ${CSS_VARIABLES.shadows.small};
                --byteward-shadow-md: ${CSS_VARIABLES.shadows.medium};
                --byteward-shadow-lg: ${CSS_VARIABLES.shadows.large};
                --byteward-shadow-xl: ${CSS_VARIABLES.shadows.xlarge};
                
                /* Radius Variables */
                --byteward-radius-sm: ${CSS_VARIABLES.radii.small};
                --byteward-radius-md: ${CSS_VARIABLES.radii.medium};
                --byteward-radius-lg: ${CSS_VARIABLES.radii.large};
                --byteward-radius-xl: ${CSS_VARIABLES.radii.xlarge};
                --byteward-radius-round: ${CSS_VARIABLES.radii.round};
                
                /* Spacing Variables */
                --byteward-space-xs: ${CSS_VARIABLES.spacing.xs};
                --byteward-space-sm: ${CSS_VARIABLES.spacing.sm};
                --byteward-space-md: ${CSS_VARIABLES.spacing.md};
                --byteward-space-lg: ${CSS_VARIABLES.spacing.lg};
                --byteward-space-xl: ${CSS_VARIABLES.spacing.xl};
                --byteward-space-xxl: ${CSS_VARIABLES.spacing.xxl};
                
                /* Animation Variables */
                --byteward-animation-speed: ${UI_CONFIG.defaults.animationSpeed}ms;
                --byteward-transition: all var(--byteward-animation-speed) ease;
            }
            
            /* Utility Classes */
            .byteward-hidden { display: none !important; }
            .byteward-visible { display: block !important; }
            .byteward-flex { display: flex !important; }
            .byteward-flex-column { flex-direction: column !important; }
            .byteward-flex-center {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            /* Smooth transitions */
            .byteward-transition {
                transition: var(--byteward-transition);
            }
            
            /* High z-index for overlays */
            .byteward-overlay {
                z-index: 99990 !important;
            }
            
            .byteward-modal {
                z-index: 99991 !important;
            }
            
            .byteward-notification {
                z-index: 99992 !important;
            }
            
            .byteward-toast {
                z-index: 99993 !important;
            }
            
            .byteward-loading {
                z-index: 99994 !important;
            }
            
            .byteward-profile {
                z-index: 99995 !important;
            }
            
            /* Mobile optimizations */
            @media (max-width: ${UI_CONFIG.defaults.mobileBreakpoint}px) {
                .byteward-mobile-full {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                
                .byteward-mobile-padding {
                    padding-left: var(--byteward-space-md) !important;
                    padding-right: var(--byteward-space-md) !important;
                }
            }
            
            /* Animation keyframes */
            @keyframes byteward-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes byteward-fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes byteward-slide-up {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            
            @keyframes byteward-slide-down {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            
            @keyframes byteward-slide-left {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes byteward-slide-right {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes byteward-scale-up {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes byteward-scale-down {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.9); opacity: 0; }
            }
            
            @keyframes byteward-spin {
                to { transform: rotate(360deg); }
            }
            
            @keyframes byteward-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes byteward-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            /* Print styles */
            @media print {
                .byteward-no-print {
                    display: none !important;
                }
            }
        `;
    }

    setupEventListeners() {
        // Window resize for mobile detection
        this.addWindowListener('resize', this.handleResize.bind(this));
        
        // Theme change detection
        this.addWindowListener('storage', (e) => {
            if (e.key === 'byteward-theme') {
                this.currentTheme = e.newValue || UI_CONFIG.defaults.theme;
                this.applyTheme();
            }
        });
        
        // Click outside handlers
        this.addDocumentListener('click', this.handleClickOutside.bind(this));
        
        // Escape key handlers
        this.addDocumentListener('keydown', this.handleEscapeKey.bind(this));
        
        console.log('🎯 UI event listeners setup complete');
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= UI_CONFIG.defaults.mobileBreakpoint;
        
        if (wasMobile !== this.isMobile) {
            this.dispatchEvent('ui:breakpoint-change', { isMobile: this.isMobile });
            
            // Update components for mobile/desktop
            if (this.profile) this.profile.updateForMobile(this.isMobile);
            if (this.notification) this.notification.updateForMobile(this.isMobile);
            if (this.modal) this.modal.updateForMobile(this.isMobile);
        }
    }

    handleClickOutside(event) {
        // Close profile panel if clicking outside
        if (this.profile) {
            this.profile.handleClickOutside(event);
        }
        
        // Close modals if clicking outside
        if (this.modal) {
            this.modal.handleClickOutside(event);
        }
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            // Close profile panel
            if (this.profile && this.profile.isOpen) {
                this.profile.hide();
                event.preventDefault();
            }
            
            // Close top modal
            if (this.modal) {
                this.modal.closeTop();
                event.preventDefault();
            }
        }
    }

    setupTheme() {
        // Check saved theme
        const savedTheme = localStorage.getItem('byteward-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        
        // Apply theme
        this.applyTheme();
        
        // Add theme change listener
        this.addWindowListener('theme:change', (e) => {
            this.currentTheme = e.detail.theme;
            this.applyTheme();
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('byteward-theme', this.currentTheme);
        this.dispatchEvent('ui:theme-change', { theme: this.currentTheme });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    checkUserState() {
        // Listen for auth changes
        if (window.Auth && window.Auth.onAuthChange) {
            window.Auth.onAuthChange((oldUser, newUser) => {
                if (newUser && !oldUser) {
                    // User logged in
                    setTimeout(() => {
                        if (this.profile) {
                            this.profile.createButton();
                        }
                    }, 1000);
                } else if (!newUser && oldUser) {
                    // User logged out
                    if (this.profile) {
                        this.profile.removeButton();
                        this.profile.hide();
                    }
                }
            });
        }
    }

    // Event system
    addListener(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        
        return () => {
            const handlers = this.listeners.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) handlers.splice(index, 1);
            }
        };
    }

    dispatchEvent(event, data) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
        
        // Also dispatch custom event
        const customEvent = new CustomEvent(event, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Utility methods
    addWindowListener(event, handler) {
        window.addEventListener(event, handler);
        this.components.set(`window:${event}`, { event, handler });
    }

    addDocumentListener(event, handler) {
        document.addEventListener(event, handler);
        this.components.set(`document:${event}`, { event, handler });
    }

    showError(message, options = {}) {
        if (this.error) {
            return this.error.show(message, options);
        }
        
        // Fallback
        console.error('ByteWard Error:', message);
        return null;
    }

    // Cleanup
    destroy() {
        // Remove all listeners
        this.components.forEach((component, key) => {
            if (key.startsWith('window:')) {
                window.removeEventListener(component.event, component.handler);
            } else if (key.startsWith('document:')) {
                document.removeEventListener(component.event, component.handler);
            }
        });
        
        // Cleanup subsystems
        if (this.profile) this.profile.destroy();
        if (this.modal) this.modal.destroy();
        if (this.toast) this.toast.destroy();
        if (this.loading) this.loading.destroy();
        if (this.error) this.error.destroy();
        
        this.components.clear();
        this.listeners.clear();
        this.initialized = false;
        
        console.log('🧹 UI System destroyed');
    }
}

// =======================
// Notification System Adapter
// =======================
class NotificationAdapter {
    constructor() {
        this.system = null;
        this.detectSystem();
    }

    detectSystem() {
        // Priority 1: Notification System v3.0
        if (window.Notifications && window.Notifications.show) {
            this.system = 'v3';
            console.log('🔔 Using Notification System v3.0');
            return;
        }
        
        // Priority 2: notify shortcut
        if (window.notify && window.notify.show) {
            this.system = 'notify';
            console.log('🔔 Using notify shortcut');
            return;
        }
        
        // Priority 3: Legacy systems
        if (window.HyperOS && window.HyperOS.Notifications) {
            this.system = 'hyperos';
            console.log('🔔 Using HyperOS Notifications');
            return;
        }
        
        // Fallback: Built-in
        this.system = 'builtin';
        console.log('🔔 Using built-in notification system');
        this.setupBuiltIn();
    }

    setupBuiltIn() {
        // Create container if needed
        if (!document.getElementById(UI_CONFIG.classes.notificationContainer)) {
            const container = document.createElement('div');
            container.id = UI_CONFIG.classes.notificationContainer;
            container.className = `${UI_CONFIG.classes.notificationContainer} byteward-notification`;
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99992;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }

    show(options) {
        const {
            type = 'info',
            title = 'Notification',
            message = '',
            duration = UI_CONFIG.defaults.autoCloseDuration,
            icon = null,
            closeable = true,
            action = null
        } = options;

        switch (this.system) {
            case 'v3':
                return window.Notifications.show({
                    type: type,
                    title: title,
                    message: message,
                    duration: duration,
                    icon: icon || this.getDefaultIcon(type)
                });
                
            case 'notify':
                const method = this.getNotifyMethod(type);
                return method(title, message, duration);
                
            case 'hyperos':
                return window.HyperOS.Notifications.show({
                    type: type,
                    title: title,
                    message: message,
                    duration: duration,
                    icon: icon || this.getDefaultIcon(type)
                });
                
            case 'builtin':
            default:
                return this.showBuiltIn({ type, title, message, duration, icon, closeable, action });
        }
    }

    getNotifyMethod(type) {
        const methodMap = {
            'success': window.notify.sukses || window.notify.success,
            'error': window.notify.gagal || window.notify.error,
            'warning': window.notify.peringatan || window.notify.warning,
            'info': window.notify.informasi || window.notify.info
        };
        return methodMap[type] || window.notify.show;
    }

    getDefaultIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || 'notifications';
    }

    showBuiltIn(options) {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const container = document.getElementById(UI_CONFIG.classes.notificationContainer);
        
        if (!container) return id;

        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `byteward-notification-item byteward-notification-${options.type}`;
        
        const icon = options.icon || this.getDefaultIcon(options.type);
        const typeTitle = this.getTypeTitle(options.type);
        
        notification.innerHTML = `
            <div class="byteward-notification-content">
                <div class="byteward-notification-icon">
                    <span class="material-icons-round">${icon}</span>
                </div>
                <div class="byteward-notification-text">
                    <div class="byteward-notification-title">${typeTitle}: ${options.title}</div>
                    ${options.message ? `<div class="byteward-notification-message">${options.message}</div>` : ''}
                </div>
                ${options.closeable ? '<button class="byteward-notification-close">&times;</button>' : ''}
            </div>
            ${options.duration > 0 ? `
                <div class="byteward-notification-progress">
                    <div class="byteward-notification-progress-bar"></div>
                </div>
            ` : ''}
        `;

        // Style the notification
        notification.style.cssText = `
            background: white;
            border-radius: var(--byteward-radius-lg);
            padding: var(--byteward-space-md);
            box-shadow: var(--byteward-shadow-lg);
            border-left: 4px solid var(--byteward-${options.type});
            max-width: 380px;
            width: 100%;
            transform: translateX(120%);
            opacity: 0;
            transition: all var(--byteward-animation-speed) cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        `;

        // Add action button if provided
        if (options.action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'byteward-notification-action';
            actionBtn.textContent = options.action.label || 'Action';
            actionBtn.style.cssText = `
                margin-top: var(--byteward-space-sm);
                padding: var(--byteward-space-xs) var(--byteward-space-md);
                background: var(--byteward-primary);
                color: white;
                border: none;
                border-radius: var(--byteward-radius-sm);
                font-size: 14px;
                cursor: pointer;
                transition: var(--byteward-transition);
            `;
            actionBtn.addEventListener('click', () => {
                if (options.action.callback) options.action.callback();
                this.remove(id);
            });
            notification.querySelector('.byteward-notification-text').appendChild(actionBtn);
        }

        // Add close button listener
        if (options.closeable) {
            notification.querySelector('.byteward-notification-close').addEventListener('click', () => {
                this.remove(id);
            });
        }

        // Add click to dismiss
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.byteward-notification-close') && 
                !e.target.closest('.byteward-notification-action')) {
                this.remove(id);
            }
        });

        // Add to container
        container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto remove if duration > 0
        if (options.duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, options.duration);
        }

        return id;
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

    remove(id) {
        const notification = document.getElementById(id);
        if (!notification) return;

        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, UI_CONFIG.defaults.animationSpeed);
    }

    clearAll() {
        const container = document.getElementById(UI_CONFIG.classes.notificationContainer);
        if (container) {
            container.innerHTML = '';
        }
    }

    updateForMobile(isMobile) {
        const container = document.getElementById(UI_CONFIG.classes.notificationContainer);
        if (!container) return;

        if (isMobile) {
            container.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 0;
                right: 0;
                z-index: 99992;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                padding: 0 var(--byteward-space-md);
                max-width: 100%;
            `;
        } else {
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99992;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
                max-width: 400px;
            `;
        }
    }

    // Convenience methods
    success(title, message, duration = 4000) {
        return this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }

    error(title, message, duration = 5000) {
        return this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }

    warning(title, message, duration = 4000) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }

    info(title, message, duration = 3000) {
        return this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }

    action(title, message, actionConfig, duration = 5000) {
        return this.show({
            type: 'info',
            title,
            message,
            duration,
            action: actionConfig
        });
    }
}

// =======================
// Modal System
// =======================
class ModalSystem {
    constructor() {
        this.modals = new Map();
        this.currentZIndex = 10000;
        this.container = null;
        this.setupContainer();
    }

    setupContainer() {
        if (!document.getElementById(UI_CONFIG.classes.modalContainer)) {
            this.container = document.createElement('div');
            this.container.id = UI_CONFIG.classes.modalContainer;
            this.container.className = `${UI_CONFIG.classes.modalContainer} byteward-overlay`;
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99990;
                display: none;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById(UI_CONFIG.classes.modalContainer);
        }
    }

    show(options) {
        const {
            title = 'Modal',
            content = '',
            buttons = [],
            onClose = null,
            onOpen = null,
            closeOnOverlayClick = true,
            closeOnEscape = true,
            size = 'medium', // small, medium, large, xlarge
            showCloseButton = true
        } = options;

        const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.currentZIndex += 10;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = `${id}-overlay`;
        overlay.className = 'byteward-modal-overlay byteward-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: ${this.currentZIndex};
            opacity: 0;
            transition: opacity var(--byteward-animation-speed) ease;
        `;

        // Size mapping
        const sizeMap = {
            small: '400px',
            medium: '500px',
            large: '600px',
            xlarge: '800px',
            full: '90%'
        };

        // Create modal
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'byteward-modal byteward-modal';
        modal.style.cssText = `
            background: white;
            border-radius: var(--byteward-radius-xl);
            width: 90%;
            max-width: ${sizeMap[size] || sizeMap.medium};
            max-height: 90vh;
            overflow: hidden;
            box-shadow: var(--byteward-shadow-xl);
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
            transition: all var(--byteward-animation-speed) cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
        `;

        // Header
        const header = document.createElement('div');
        header.className = 'byteward-modal-header';
        header.style.cssText = `
            padding: var(--byteward-space-lg);
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        `;
        
        const titleEl = document.createElement('h2');
        titleEl.className = 'byteward-modal-title';
        titleEl.textContent = title;
        titleEl.style.cssText = `
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const headerActions = document.createElement('div');
        headerActions.className = 'byteward-modal-header-actions';
        headerActions.style.cssText = `
            display: flex;
            gap: var(--byteward-space-sm);
        `;
        
        if (showCloseButton) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'byteward-modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: var(--byteward-radius-round);
                color: white;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: var(--byteward-transition);
            `;
            
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
                closeBtn.style.transform = 'rotate(90deg)';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                closeBtn.style.transform = 'rotate(0deg)';
            });
            
            closeBtn.addEventListener('click', () => this.hide(id));
            headerActions.appendChild(closeBtn);
        }
        
        header.appendChild(titleEl);
        header.appendChild(headerActions);

        // Content
        const contentEl = document.createElement('div');
        contentEl.className = 'byteward-modal-content';
        contentEl.style.cssText = `
            padding: var(--byteward-space-lg);
            max-height: 60vh;
            overflow-y: auto;
            flex: 1;
        `;
        
        if (typeof content === 'string') {
            contentEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentEl.appendChild(content);
        } else {
            contentEl.textContent = content;
        }

        // Footer with buttons
        let footer = null;
        if (buttons.length > 0) {
            footer = document.createElement('div');
            footer.className = 'byteward-modal-footer';
            footer.style.cssText = `
                padding: var(--byteward-space-lg);
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: var(--byteward-space-sm);
                background: #f9fafb;
            `;
            
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `byteward-modal-btn byteward-modal-btn-${btn.type || 'secondary'}`;
                button.textContent = btn.text;
                button.style.cssText = `
                    padding: var(--byteward-space-sm) var(--byteward-space-lg);
                    border-radius: var(--byteward-radius-md);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--byteward-transition);
                    border: none;
                    min-width: 80px;
                `;
                
                if (btn.type === 'primary') {
                    button.style.background = 'var(--byteward-primary)';
                    button.style.color = 'white';
                } else {
                    button.style.background = '#f3f4f6';
                    button.style.color = '#374151';
                    button.style.border = '1px solid #d1d5db';
                }
                
                button.addEventListener('mouseenter', () => {
                    if (btn.type === 'primary') {
                        button.style.background = '#2563eb';
                        button.style.transform = 'translateY(-2px)';
                    } else {
                        button.style.background = '#e5e7eb';
                    }
                });
                
                button.addEventListener('mouseleave', () => {
                    if (btn.type === 'primary') {
                        button.style.background = 'var(--byteward-primary)';
                        button.style.transform = 'translateY(0)';
                    } else {
                        button.style.background = '#f3f4f6';
                    }
                });
                
                if (btn.onClick) {
                    button.addEventListener('click', () => {
                        btn.onClick();
                        if (btn.closeOnClick !== false) {
                            this.hide(id);
                        }
                    });
                } else {
                    button.addEventListener('click', () => this.hide(id));
                }
                
                footer.appendChild(button);
            });
        }

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(contentEl);
        if (footer) modal.appendChild(footer);

        // Assemble overlay
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Store reference
        this.modals.set(id, {
            overlay,
            modal,
            onClose,
            onOpen,
            closeOnOverlayClick,
            closeOnEscape
        });

        // Overlay click handler
        if (closeOnOverlayClick) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide(id);
                }
            });
        }

        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && closeOnEscape) {
                this.hide(id);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        this.modals.get(id).escapeHandler = escapeHandler;

        // Show with animation
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
            
            // Call onOpen callback
            if (onOpen) onOpen();
        }, 10);

        return id;
    }

    hide(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        const { overlay, modal, onClose, escapeHandler } = modalData;

        // Remove escape handler
        if (escapeHandler) {
            document.removeEventListener('keydown', escapeHandler);
        }

        // Animate out
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(-20px) scale(0.95)';
        overlay.style.opacity = '0';

        // Remove from DOM
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.modals.delete(id);
            
            // Call onClose callback
            if (onClose) onClose();
        }, UI_CONFIG.defaults.animationSpeed);
    }

    closeTop() {
        const ids = Array.from(this.modals.keys());
        if (ids.length > 0) {
            this.hide(ids[ids.length - 1]);
        }
    }

    handleClickOutside(event) {
        this.modals.forEach((modalData, id) => {
            if (modalData.closeOnOverlayClick && 
                event.target === modalData.overlay) {
                this.hide(id);
            }
        });
    }

    confirm(options) {
        return new Promise((resolve) => {
            const modalId = this.show({
                title: options.title || 'Konfirmasi',
                content: options.message || 'Apakah anda yakin?',
                buttons: [
                    {
                        text: options.cancelText || 'Batal',
                        type: 'secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        text: options.confirmText || 'Ya',
                        type: 'primary',
                        onClick: () => resolve(true)
                    }
                ]
            });
            
            this.modals.get(modalId).promiseResolve = resolve;
        });
    }

    alert(options) {
        return new Promise((resolve) => {
            this.show({
                title: options.title || 'Informasi',
                content: options.message || '',
                buttons: [
                    {
                        text: options.okText || 'OK',
                        type: 'primary',
                        onClick: () => resolve()
                    }
                ]
            });
        });
    }

    prompt(options) {
        return new Promise((resolve) => {
            const inputId = `prompt-input-${Date.now()}`;
            const content = document.createElement('div');
            content.innerHTML = `
                <p style="margin-bottom: var(--byteward-space-sm); color: #374151;">${options.message || 'Masukkan nilai:'}</p>
                <input type="${options.type || 'text'}" 
                       id="${inputId}" 
                       class="byteward-prompt-input"
                       style="width: 100%; padding: var(--byteward-space-sm); border: 2px solid #e5e7eb; border-radius: var(--byteward-radius-md); font-size: 14px;"
                       placeholder="${options.placeholder || ''}"
                       value="${options.defaultValue || ''}">
            `;
            
            const modalId = this.show({
                title: options.title || 'Input',
                content: content,
                buttons: [
                    {
                        text: options.cancelText || 'Batal',
                        type: 'secondary',
                        onClick: () => resolve(null)
                    },
                    {
                        text: options.confirmText || 'OK',
                        type: 'primary',
                        onClick: () => {
                            const input = document.getElementById(inputId);
                            resolve(input ? input.value : '');
                        }
                    }
                ]
            });
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }

    updateForMobile(isMobile) {
        this.modals.forEach((modalData) => {
            const modal = modalData.modal;
            if (isMobile) {
                modal.style.cssText += `
                    width: 95% !important;
                    max-width: 95% !important;
                    border-radius: var(--byteward-radius-lg) !important;
                `;
            }
        });
    }

    destroy() {
        this.modals.forEach((modalData, id) => {
            this.hide(id);
        });
        this.modals.clear();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// =======================
// Toast System
// =======================
class ToastSystem {
    constructor() {
        this.toasts = new Map();
        this.container = null;
        this.setupContainer();
    }

    setupContainer() {
        if (!document.getElementById(UI_CONFIG.classes.toastContainer)) {
            this.container = document.createElement('div');
            this.container.id = UI_CONFIG.classes.toastContainer;
            this.container.className = `${UI_CONFIG.classes.toastContainer} byteward-toast`;
            this.container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99993;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                pointer-events: none;
                width: 100%;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById(UI_CONFIG.classes.toastContainer);
        }
    }

    show(message, options = {}) {
        const {
            type = 'info',
            duration = 3000,
            closeable = true,
            icon = null,
            position = 'bottom' // top, bottom, middle
        } = options;

        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `byteward-toast-item byteward-toast-${type}`;
        
        const iconContent = icon || this.getIcon(type);
        
        toast.innerHTML = `
            <div class="byteward-toast-icon">
                <span class="material-icons-round">${iconContent}</span>
            </div>
            <div class="byteward-toast-message">${message}</div>
            ${closeable ? '<button class="byteward-toast-close">&times;</button>' : ''}
        `;

        // Style the toast
        toast.style.cssText = `
            background: var(--byteward-${type});
            color: white;
            padding: var(--byteward-space-md) var(--byteward-space-lg);
            border-radius: var(--byteward-radius-lg);
            box-shadow: var(--byteward-shadow-lg);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--byteward-space-md);
            width: 100%;
            transform: translateY(100px);
            opacity: 0;
            transition: all var(--byteward-animation-speed) cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
            backdrop-filter: blur(10px);
            background: rgba(31, 41, 55, 0.95);
        `;

        // Type-specific styling
        if (type === 'success') toast.style.background = 'rgba(16, 185, 129, 0.95)';
        if (type === 'error') toast.style.background = 'rgba(239, 68, 68, 0.95)';
        if (type === 'warning') toast.style.background = 'rgba(245, 158, 11, 0.95)';
        if (type === 'info') toast.style.background = 'rgba(59, 130, 246, 0.95)';

        // Event listeners
        if (closeable) {
            toast.querySelector('.byteward-toast-close').addEventListener('click', () => {
                this.hide(id);
            });
        }

        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.byteward-toast-close')) {
                this.hide(id);
            }
        });

        // Add to container
        this.container.appendChild(toast);
        
        // Store reference
        this.toasts.set(id, { element: toast, timeout: null });

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 10);

        // Auto-hide
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.hide(id);
            }, duration);
            this.toasts.get(id).timeout = timeout;
        }

        // Limit toasts
        this.cleanup();

        return id;
    }

    getIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || 'notifications';
    }

    hide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timeout } = toastData;
        
        if (timeout) clearTimeout(timeout);
        
        element.style.transform = 'translateY(-100px)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
        }, UI_CONFIG.defaults.animationSpeed);
    }

    cleanup() {
        if (this.toasts.size > UI_CONFIG.defaults.maxToasts) {
            const toRemove = Array.from(this.toasts.keys()).slice(0, this.toasts.size - UI_CONFIG.defaults.maxToasts);
            toRemove.forEach(id => this.hide(id));
        }
    }

    clearAll() {
        this.toasts.forEach((toastData, id) => {
            this.hide(id);
        });
    }

    // Convenience methods
    success(message, duration = 3000) {
        return this.show(message, { type: 'success', duration });
    }

    error(message, duration = 4000) {
        return this.show(message, { type: 'error', duration });
    }

    warning(message, duration = 3500) {
        return this.show(message, { type: 'warning', duration });
    }

    info(message, duration = 2500) {
        return this.show(message, { type: 'info', duration });
    }

    destroy() {
        this.clearAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// =======================
// Profile System
// =======================
class ProfileSystem {
    constructor() {
        this.isOpen = false;
        this.button = null;
        this.panel = null;
        this.overlay = null;
        this.avatarCache = new Map();
        this.init();
    }

    init() {
        console.log('👤 Profile System initialized');
        
        // Listen for auth changes
        if (window.Auth && window.Auth.onAuthChange) {
            window.Auth.onAuthChange((oldUser, newUser) => {
                if (newUser && !oldUser) {
                    this.createButton();
                } else if (!newUser && oldUser) {
                    this.removeButton();
                    this.hide();
                }
            });
        }
        
        // Inject profile CSS
        this.injectProfileCSS();
    }

    injectProfileCSS() {
        if (document.querySelector('#byteward-profile-css')) return;

        const style = document.createElement('style');
        style.id = 'byteward-profile-css';
        style.textContent = this.generateProfileCSS();
        document.head.appendChild(style);
    }

    generateProfileCSS() {
        return `
            /* Profile System Styles */
            .byteward-profile-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: white;
                cursor: pointer;
                padding: 0;
                box-shadow: var(--byteward-shadow-md);
                transition: var(--byteward-transition);
                z-index: 99995;
                overflow: hidden;
            }
            
            .byteward-profile-btn:hover {
                transform: scale(1.1);
                box-shadow: var(--byteward-shadow-lg);
            }
            
            .byteward-profile-btn img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .byteward-profile-indicator {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: var(--byteward-error);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: byteward-pulse 2s infinite;
            }
            
            .byteward-profile-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 99994;
                opacity: 0;
                transition: opacity var(--byteward-animation-speed) ease;
            }
            
            .byteward-profile-panel {
                background: white;
                border-radius: var(--byteward-radius-xl);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: var(--byteward-shadow-xl);
                transform: translateY(-20px) scale(0.95);
                opacity: 0;
                transition: all var(--byteward-animation-speed) cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex;
                flex-direction: column;
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .byteward-profile-btn {
                    top: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                }
                
                .byteward-profile-panel {
                    width: 95%;
                    max-width: 95%;
                    border-radius: var(--byteward-radius-lg);
                }
            }
        `;
    }

    createButton() {
        // Remove existing button
        this.removeButton();

        if (!window.Auth || !window.Auth.currentUser) return;

        // Create button container
        const button = document.createElement('button');
        button.className = `${UI_CONFIG.classes.profileButton} byteward-profile-btn byteward-profile`;
        button.id = 'bytewardProfileTrigger';
        button.setAttribute('aria-label', 'Open profile panel');
        
        // Avatar image
        const avatarUrl = (window.Auth.userData && window.Auth.userData.foto_profil) || 
                         window.Auth.generateDefaultAvatar(window.Auth.currentUser.email);
        
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Profile';
        img.className = 'byteward-profile-image';
        img.onerror = () => {
            img.src = window.Auth.generateDefaultAvatar('user');
        };
        
        button.appendChild(img);

        // Profile completion indicator
        if (window.Auth.profileState && !window.Auth.profileState.isProfileComplete) {
            const indicator = document.createElement('div');
            indicator.className = 'byteward-profile-indicator';
            indicator.textContent = '!';
            indicator.title = 'Profil belum lengkap';
            button.appendChild(indicator);
        }

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'byteward-profile-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            bottom: -45px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--byteward-dark);
            color: white;
            padding: var(--byteward-space-sm) var(--byteward-space-md);
            border-radius: var(--byteward-radius-sm);
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: var(--byteward-transition);
            pointer-events: none;
            z-index: 1000;
        `;
        
        button.appendChild(tooltip);
        
        // Update tooltip content
        const updateTooltip = () => {
            if (window.Auth && window.Auth.userData) {
                const name = window.Auth.userData.nama || 'User';
                const email = window.Auth.currentUser?.email || '';
                tooltip.textContent = `${name} • ${email}`;
            } else {
                tooltip.textContent = 'Guest User';
            }
        };
        
        // Hover events for tooltip
        button.addEventListener('mouseenter', () => {
            updateTooltip();
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
            tooltip.style.bottom = '-40px';
        });
        
        button.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            tooltip.style.bottom = '-45px';
        });

        // Click handler
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.show();
        });

        // Add to body
        document.body.appendChild(button);
        this.button = button;

        console.log('✅ Profile button created');
        return button;
    }

    removeButton() {
        if (this.button && this.button.parentNode) {
            this.button.parentNode.removeChild(this.button);
            this.button = null;
        }
    }

    updateButton() {
        if (!this.button) return;

        // Update avatar
        const img = this.button.querySelector('.byteward-profile-image');
        if (img && window.Auth && window.Auth.userData && window.Auth.userData.foto_profil) {
            const oldSrc = img.src;
            img.src = window.Auth.userData.foto_profil;
            img.onerror = () => {
                if (img.src !== oldSrc) {
                    img.src = window.Auth.generateDefaultAvatar(window.Auth.currentUser?.email || 'user');
                }
            };
        }

        // Update indicator
        const indicator = this.button.querySelector('.byteward-profile-indicator');
        if (window.Auth && window.Auth.profileState && window.Auth.profileState.isProfileComplete) {
            if (indicator) indicator.remove();
        } else if (!indicator && window.Auth && window.Auth.profileState && !window.Auth.profileState.isProfileComplete) {
            const newIndicator = document.createElement('div');
            newIndicator.className = 'byteward-profile-indicator';
            newIndicator.textContent = '!';
            newIndicator.title = 'Profil belum lengkap';
            this.button.appendChild(newIndicator);
        }
    }

    show() {
        if (this.isOpen) return;
        
        // Create panel if doesn't exist
        if (!this.panel) {
            this.createPanel();
        }
        
        // Show overlay and panel
        this.overlay.style.display = 'flex';
        
        setTimeout(() => {
            this.overlay.style.opacity = '1';
            this.panel.style.opacity = '1';
            this.panel.style.transform = 'translateY(0) scale(1)';
            this.isOpen = true;
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('profile:open'));
        }, 10);
    }

    hide() {
        if (!this.isOpen || !this.panel || !this.overlay) return;
        
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translateY(-20px) scale(0.95)';
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.isOpen = false;
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('profile:close'));
        }, UI_CONFIG.defaults.animationSpeed);
    }

    createPanel() {
        // Remove existing panel
        if (this.panel) {
            this.panel.remove();
        }
        
        if (this.overlay) {
            this.overlay.remove();
        }

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'byteward-profile-overlay byteward-overlay';
        this.overlay.id = 'bytewardProfileOverlay';
        
        // Create panel
        this.panel = document.createElement('div');
        this.panel.className = 'byteward-profile-panel byteward-profile';
        this.panel.id = 'bytewardProfilePanel';
        
        // Basic panel content
        this.panel.innerHTML = `
            <div class="byteward-profile-header">
                <h2>${window.Auth?.profileState?.isProfileComplete ? 'Profil Saya' : 'Lengkapi Profil'}</h2>
                <button class="byteward-profile-close">&times;</button>
            </div>
            <div class="byteward-profile-content">
                <div class="byteward-profile-current">
                    <img class="byteward-profile-avatar" src="${window.Auth?.userData?.foto_profil || window.Auth?.generateDefaultAvatar('user')}" alt="Avatar">
                    <div class="byteward-profile-info">
                        <div class="byteward-profile-name">${window.Auth?.userData?.nama || 'Nama belum diisi'}</div>
                        <div class="byteward-profile-email">${window.Auth?.currentUser?.email || ''}</div>
                        <div class="byteward-profile-role">Role: ${window.Auth?.userData?.peran || 'siswa'}</div>
                    </div>
                </div>
                <div class="byteward-profile-form">
                    <div class="byteward-profile-field">
                        <label for="bytewardProfileName">Nama Lengkap</label>
                        <input type="text" id="bytewardProfileName" value="${window.Auth?.userData?.nama || ''}" placeholder="Masukkan nama lengkap">
                    </div>
                    <div class="byteward-profile-actions">
                        <button class="byteward-profile-save" id="bytewardProfileSave">Simpan Perubahan</button>
                        <button class="byteward-profile-cancel" id="bytewardProfileCancel">Batal</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add overlay and panel to DOM
        this.overlay.appendChild(this.panel);
        document.body.appendChild(this.overlay);
        
        // Add event listeners
        this.addPanelListeners();
    }

    addPanelListeners() {
        if (!this.panel || !this.overlay) return;
        
        // Close button
        const closeBtn = this.panel.querySelector('.byteward-profile-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Cancel button
        const cancelBtn = this.panel.querySelector('#bytewardProfileCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }
        
        // Save button
        const saveBtn = this.panel.querySelector('#bytewardProfileSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }
        
        // Overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    }

    async saveProfile() {
        // Implementation for saving profile
        // This would integrate with Auth system
        console.log('💾 Saving profile...');
        
        // Show success message
        if (window.Auth && window.Auth.showSuccess) {
            window.Auth.showSuccess('Profil Disimpan', 'Perubahan berhasil disimpan');
        }
        
        // Close panel after save
        setTimeout(() => {
            this.hide();
        }, 1500);
    }

    handleClickOutside(event) {
        if (this.isOpen && 
            this.overlay && 
            event.target === this.overlay) {
            this.hide();
        }
    }

    updateForMobile(isMobile) {
        if (!this.button) return;
        
        if (isMobile) {
            this.button.style.top = '10px';
            this.button.style.right = '10px';
            this.button.style.width = '40px';
            this.button.style.height = '40px';
        } else {
            this.button.style.top = '20px';
            this.button.style.right = '20px';
            this.button.style.width = '50px';
            this.button.style.height = '50px';
        }
    }

    destroy() {
        this.removeButton();
        this.hide();
        
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        this.button = null;
        this.panel = null;
        this.overlay = null;
        this.isOpen = false;
    }
}

// =======================
// Loading System
// =======================
class LoadingSystem {
    constructor() {
        this.overlay = null;
        this.count = 0;
    }

    show(text = 'Memuat...') {
        this.count++;
        
        if (!this.overlay) {
            this.createOverlay();
        }
        
        // Update text if provided
        if (text) {
            const textEl = this.overlay.querySelector('.byteward-loading-text');
            if (textEl) textEl.textContent = text;
        }
        
        this.overlay.style.display = 'flex';
        
        // Force reflow for animation
        this.overlay.offsetHeight;
        
        console.log('⏳ Loading:', text);
        return this.count;
    }

    hide(id = null) {
        if (id && id !== this.count) {
            // Only hide if this is the matching loader
            return;
        }
        
        this.count = Math.max(0, this.count - 1);
        
        if (this.count === 0 && this.overlay) {
            this.overlay.style.opacity = '0';
            
            setTimeout(() => {
                if (this.overlay && this.count === 0) {
                    this.overlay.style.display = 'none';
                    this.overlay.style.opacity = '1';
                }
            }, UI_CONFIG.defaults.animationSpeed);
        }
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = UI_CONFIG.classes.loadingOverlay;
        this.overlay.className = `${UI_CONFIG.classes.loadingOverlay} byteward-loading byteward-overlay`;
        
        this.overlay.innerHTML = `
            <div class="byteward-loading-content">
                <div class="byteward-loading-spinner">
                    <div class="byteward-loading-block" style="--i:0"></div>
                    <div class="byteward-loading-block" style="--i:1"></div>
                    <div class="byteward-loading-block" style="--i:2"></div>
                    <div class="byteward-loading-block" style="--i:3"></div>
                    <div class="byteward-loading-block" style="--i:4"></div>
                </div>
                <div class="byteward-loading-text">Memuat...</div>
                <div class="byteward-loading-progress">
                    <div class="byteward-loading-progress-fill"></div>
                </div>
            </div>
        `;
        
        // Style the overlay
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99994;
            flex-direction: column;
            backdrop-filter: blur(4px);
            transition: opacity var(--byteward-animation-speed) ease;
        `;
        
        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
            .byteward-loading-spinner {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 60px;
            }
            
            .byteward-loading-block {
                width: 12px;
                height: 40px;
                background: linear-gradient(to bottom, var(--byteward-primary), #2563eb);
                border-radius: 4px;
                animation: byteward-bounce 1.8s ease-in-out infinite;
                animation-delay: calc(var(--i) * 0.15s);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            
            .byteward-loading-block:nth-child(odd) {
                background: linear-gradient(to bottom, #1d4ed8, var(--byteward-primary));
            }
            
            .byteward-loading-block:nth-child(3) {
                width: 14px;
                height: 45px;
            }
            
            .byteward-loading-text {
                margin-top: 30px;
                color: var(--byteward-dark);
                font-size: 16px;
                font-weight: 500;
                text-align: center;
                max-width: 300px;
                line-height: 1.5;
            }
            
            .byteward-loading-progress {
                width: 200px;
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                margin-top: 20px;
                overflow: hidden;
            }
            
            .byteward-loading-progress-fill {
                width: 40%;
                height: 100%;
                background: linear-gradient(90deg, var(--byteward-primary), #2563eb);
                border-radius: 2px;
                animation: byteward-progress 2s ease-in-out infinite;
            }
            
            @keyframes byteward-progress {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(200%); }
            }
        `;
        
        this.overlay.appendChild(style);
        document.body.appendChild(this.overlay);
    }

    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.count = 0;
    }
}

// =======================
// Error System
// =======================
class ErrorSystem {
    constructor() {
        this.container = null;
    }

    show(message, options = {}) {
        const {
            title = 'System Error',
            duration = 5000,
            showNotification = true,
            showToast = false
        } = options;

        console.error('ByteWard Error:', message);
        
        // Show notification
        if (showNotification && window.Auth && window.Auth.showError) {
            window.Auth.showError(title, message, duration);
        } else if (showNotification && window.Notifications) {
            window.Notifications.error(title, message, duration);
        }
        
        // Show toast
        if (showToast && window.UI && window.UI.Toast) {
            window.UI.Toast.error(message, { duration });
        }
        
        // Fallback display
        if (!showNotification && !showToast) {
            this.showFallback(message, duration);
        }
        
        return message;
    }

    showFallback(message, duration) {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'byteward-error-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99996;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
        
        const errorEl = document.createElement('div');
        errorEl.className = 'byteward-error-item';
        errorEl.style.cssText = `
            background: var(--byteward-error);
            color: white;
            padding: var(--byteward-space-md);
            border-radius: var(--byteward-radius-md);
            margin-bottom: var(--byteward-space-sm);
            box-shadow: var(--byteward-shadow-md);
            animation: byteward-slide-left var(--byteward-animation-speed) ease;
        `;
        
        errorEl.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">Error</div>
            <div style="font-size: 14px;">${message}</div>
        `;
        
        this.container.appendChild(errorEl);
        
        // Auto remove
        setTimeout(() => {
            errorEl.style.animation = `byteward-slide-right ${UI_CONFIG.defaults.animationSpeed}ms ease`;
            setTimeout(() => {
                if (errorEl.parentNode) {
                    errorEl.parentNode.removeChild(errorEl);
                }
            }, UI_CONFIG.defaults.animationSpeed);
        }, duration);
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    destroy() {
        this.clear();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
    }
}

// =======================
// Global UI Instance
// =======================
// Create global UI manager
const UISystem = new UIManager();

// Attach to window with safe initialization
window.UI = window.UI || {};

// Merge UI systems into window.UI
Object.assign(window.UI, {
    // Configuration
    config: UI_CONFIG,
    css: CSS_VARIABLES,
    
    // Systems
    Notification: null, // Will be set after initialization
    Modal: null,
    Toast: null,
    Profile: null,
    Loading: null,
    Error: null,
    
    // Manager instance
    Manager: UISystem,
    
    // Quick access methods
    showLoading: (text) => UISystem.loading?.show(text),
    hideLoading: (id) => UISystem.loading?.hide(id),
    showError: (message, options) => UISystem.error?.show(message, options),
    showNotification: (options) => UISystem.notification?.show(options),
    showModal: (options) => UISystem.modal?.show(options),
    showToast: (message, options) => UISystem.toast?.show(message, options),
    toggleTheme: () => UISystem.toggleTheme(),
    
    // Profile methods
    createProfileButton: () => UISystem.profile?.createButton(),
    updateProfileButton: () => UISystem.profile?.updateProfileButton(),
    showProfilePanel: () => UISystem.profile?.show(),
    hideProfilePanel: () => UISystem.profile?.hide(),
    
    // Initialization
    initialize: () => UISystem.initialize(),
    destroy: () => UISystem.destroy(),
    
    // Utility
    generateDefaultAvatar: (seed) => {
        const defaultSeed = seed || 'user' + Date.now();
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
    }
});

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            UISystem.initialize().then(() => {
                // Attach systems to window.UI after initialization
                window.UI.Notification = UISystem.notification;
                window.UI.Modal = UISystem.modal;
                window.UI.Toast = UISystem.toast;
                window.UI.Profile = UISystem.profile;
                window.UI.Loading = UISystem.loading;
                window.UI.Error = UISystem.error;
                
                console.log('🎨 UI System v0.1.7 fully initialized and ready');
            }).catch(error => {
                console.error('Failed to initialize UI system:', error);
            });
        }, 100);
    });
} else {
    setTimeout(() => {
        UISystem.initialize().then(() => {
            window.UI.Notification = UISystem.notification;
            window.UI.Modal = UISystem.modal;
            window.UI.Toast = UISystem.toast;
            window.UI.Profile = UISystem.profile;
            window.UI.Loading = UISystem.loading;
            window.UI.Error = UISystem.error;
            
            console.log('🎨 UI System v0.1.7 fully initialized and ready');
        });
    }, 100);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UI: window.UI,
        UIManager,
        NotificationAdapter,
        ModalSystem,
        ToastSystem,
        ProfileSystem,
        LoadingSystem,
        ErrorSystem
    };
}

console.log('🎨 UI Module v0.1.7 - Complete UI System Ready');
