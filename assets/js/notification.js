/**
 * HyperOS Notification System v2.0
 * Modern, responsive notification system with mobile/desktop modes
 * Auto-detect CSS path with fallback support
 */

class HyperOSNotification {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.maxDesktopNotifications = 8;
        this.maxMobileNotifications = 3;
        this.autoIncrementId = 0;
        this.cssPaths = [
            'assets/css/notification.css',        // Root path
            '/assets/css/notification.css',       // Absolute path
            './assets/css/notification.css',      // Current directory
            '../assets/css/notification.css',     // Parent directory
            'assets/css/notification.css',        // Try without leading slash
            'css/notification.css',               // Try shorter path
            'notification.css'                    // Try root CSS
        ];
        
        // Default configurations
        this.config = {
            success: {
                icon: "check_circle",
                title: "Berhasil",
                msg: "Operasi berhasil diselesaikan",
                color: "#10b981"
            },
            error: {
                icon: "error",
                title: "Gagal",
                msg: "Terjadi kesalahan sistem",
                color: "#ef4444"
            },
            warning: {
                icon: "warning",
                title: "Peringatan",
                msg: "Perhatian diperlukan",
                color: "#f59e0b"
            },
            info: {
                icon: "info",
                title: "Informasi",
                msg: "Pembaruan tersedia",
                color: "#3b82f6"
            },
            loading: {
                icon: "hourglass_empty",
                title: "Memproses",
                msg: "Sedang memproses...",
                color: "#8b5cf6"
            }
        };
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the notification system
     */
    init() {
        // Load CSS styles first
        this.loadCSS();
        
        // Create container if not exists
        if (!document.getElementById('hyperos-notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'hyperos-notification-container';
            this.container.className = 'hyperos-notification-container';
            
            // Wait for body to be available
            const waitForBody = () => {
                if (document.body) {
                    document.body.appendChild(this.container);
                    this.loadMaterialIcons();
                    this.updateMode();
                    window.addEventListener('resize', () => this.updateMode());
                    console.log('🔔 HyperOS Notification System v2.0 Initialized');
                } else {
                    setTimeout(waitForBody, 100);
                }
            };
            
            waitForBody();
        } else {
            this.container = document.getElementById('hyperos-notification-container');
        }
    }
    
    /**
     * Load CSS styles with multiple fallback paths
     */
    loadCSS() {
        // Check if CSS is already loaded
        if (document.getElementById('hyperos-notification-css') || 
            document.getElementById('hyperos-fallback-css')) {
            return;
        }
        
        let cssLoaded = false;
        
        // Try all CSS paths
        this.cssPaths.forEach((path, index) => {
            if (cssLoaded) return;
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            link.id = 'hyperos-notification-css';
            
            // Success callback
            link.onload = () => {
                cssLoaded = true;
                console.log(`✅ HyperOS CSS Loaded from: ${path}`);
            };
            
            // Error callback - try next path
            link.onerror = () => {
                if (index === this.cssPaths.length - 1) {
                    // Last path failed, inject fallback
                    console.warn(`⚠️ All CSS paths failed, injecting inline styles`);
                    this.injectFallbackCSS();
                }
            };
            
            // Add to document head
            document.head.appendChild(link);
            
            // Check if CSS loaded within 2 seconds
            setTimeout(() => {
                if (!cssLoaded && index === this.cssPaths.length - 1) {
                    this.injectFallbackCSS();
                }
            }, 2000);
        });
    }
    
    /**
     * Inject fallback inline CSS
     */
    injectFallbackCSS() {
        if (document.getElementById('hyperos-fallback-css')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'hyperos-fallback-css';
        style.textContent = this.generateFallbackCSS();
        document.head.appendChild(style);
        
        console.log('📦 HyperOS Fallback CSS Injected');
    }
    
    /**
     * Generate fallback CSS dynamically
     */
    generateFallbackCSS() {
        return `
            /* HyperOS Notification System - Fallback CSS */
            .hyperos-notification-container {
                position: fixed;
                z-index: 99999;
                font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
                pointer-events: none;
            }
            
            .hyperos-notification-container.desktop-mode {
                top: 20px;
                right: 20px;
                width: 380px;
                max-width: 90vw;
            }
            
            .hyperos-notification-container.mobile-mode {
                bottom: 16px;
                left: 16px;
                right: 16px;
                width: calc(100% - 32px);
            }
            
            .hyperos-notification {
                position: relative;
                overflow: hidden;
                border-radius: 14px;
                padding: 18px;
                margin-bottom: 12px;
                backdrop-filter: blur(20px) saturate(180%);
                background: rgba(255, 255, 255, 0.12);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 
                    0 10px 25px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                color: white;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                transform-origin: center;
                opacity: 0;
                transform: translateY(15px);
                pointer-events: auto;
            }
            
            .hyperos-notification.success {
                background: linear-gradient(135deg, 
                    rgba(16, 185, 129, 0.92), 
                    rgba(5, 150, 105, 0.95));
            }
            
            .hyperos-notification.error {
                background: linear-gradient(135deg, 
                    rgba(239, 68, 68, 0.92), 
                    rgba(220, 38, 38, 0.95));
            }
            
            .hyperos-notification.warning {
                background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.92), 
                    rgba(217, 119, 6, 0.95));
            }
            
            .hyperos-notification.info {
                background: linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.92), 
                    rgba(37, 99, 235, 0.95));
            }
            
            .hyperos-notification.loading {
                background: linear-gradient(135deg, 
                    rgba(139, 92, 246, 0.92), 
                    rgba(124, 58, 237, 0.95));
            }
            
            .hyperos-notification.spawn {
                animation: hyperosSpawn 0.5s cubic-bezier(0.2, 0, 0, 1) forwards;
            }
            
            .hyperos-notification.active {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            
            .hyperos-notification.layer-1 {
                opacity: 0.7;
                transform: translateY(-25px) scale(0.96);
            }
            
            .hyperos-notification.layer-2 {
                opacity: 0.4;
                transform: translateY(-50px) scale(0.92);
            }
            
            .hyperos-notification.exit {
                opacity: 0;
                transform: translateY(-15px) scale(0.92);
                pointer-events: none;
            }
            
            .hyperos-notification-icon {
                position: absolute;
                left: 18px;
                top: 50%;
                transform: translateY(-50%);
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
            }
            
            .hyperos-icon-blob {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.18);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            
            .hyperos-icon-blob .material-icons-round {
                font-size: 22px;
                color: white;
            }
            
            .hyperos-notification-text {
                margin-left: 62px;
                padding-right: 16px;
                min-height: 44px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .hyperos-text-small {
                font-size: 13px;
                font-weight: 600;
                opacity: 0.95;
                margin-bottom: 3px;
                letter-spacing: 0.02em;
            }
            
            .hyperos-text-main {
                font-size: 15px;
                font-weight: 500;
                line-height: 1.4;
                opacity: 0.9;
            }
            
            .hyperos-progress-track {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.08);
                overflow: hidden;
            }
            
            .hyperos-progress-bar {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
                transform-origin: left center;
            }
            
            .hyperos-stagger {
                opacity: 0;
                animation: hyperosStagger 0.25s cubic-bezier(0.2, 0, 0, 1) forwards;
                animation-delay: 0.08s;
            }
            
            @keyframes hyperosSpawn {
                0% {
                    opacity: 0;
                    transform: translateY(15px) scale(0.96);
                }
                70% {
                    transform: translateY(-2px) scale(1.02);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes hyperosStagger {
                from {
                    opacity: 0;
                    transform: translateY(4px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .hyperos-notification-container.mobile-mode {
                    bottom: 12px;
                    left: 12px;
                    right: 12px;
                    width: calc(100% - 24px);
                }
                
                .hyperos-notification {
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 10px;
                }
                
                .hyperos-notification-icon {
                    width: 40px;
                    height: 40px;
                    left: 16px;
                }
                
                .hyperos-icon-blob {
                    width: 40px;
                    height: 40px;
                }
                
                .hyperos-icon-blob .material-icons-round {
                    font-size: 20px;
                }
                
                .hyperos-notification-text {
                    margin-left: 56px;
                    padding-right: 12px;
                }
                
                .hyperos-text-small {
                    font-size: 12px;
                }
                
                .hyperos-text-main {
                    font-size: 14px;
                }
                
                .hyperos-progress-bar {
                    transform-origin: top center;
                }
                
                .hyperos-notification.layer-1 {
                    transform: translateY(-20px) scale(0.96);
                }
                
                .hyperos-notification.layer-2 {
                    transform: translateY(-40px) scale(0.92);
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .hyperos-notification {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .hyperos-icon-blob {
                    background: rgba(255, 255, 255, 0.15);
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .hyperos-notification,
                .hyperos-progress-bar,
                .hyperos-stagger {
                    transition-duration: 0.1s !important;
                    animation-duration: 0.1s !important;
                }
            }
        `;
    }
    
    /**
     * Load Material Icons font if not already loaded
     */
    loadMaterialIcons() {
        // Check if already loaded
        if (document.querySelector('link[href*="material-icons"]')) {
            return;
        }
        
        // Create and append link
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Round';
        link.rel = 'stylesheet';
        link.crossOrigin = 'anonymous';
        
        // Fallback if CDN fails
        link.onerror = () => {
            console.warn('Material Icons CDN failed, using system icons');
            // Inject fallback icon styles
            const fallbackStyle = document.createElement('style');
            fallbackStyle.textContent = `
                .material-icons-round {
                    font-family: 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif;
                }
            `;
            document.head.appendChild(fallbackStyle);
        };
        
        document.head.appendChild(link);
        
        // Also load Inter font for better typography
        if (!document.querySelector('link[href*="inter"]')) {
            const interLink = document.createElement('link');
            interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
            interLink.rel = 'stylesheet';
            interLink.crossOrigin = 'anonymous';
            document.head.appendChild(interLink);
        }
    }
    
    /**
     * Update container mode (mobile/desktop) based on screen width
     */
    updateMode() {
        if (!this.container) return;
        
        const isDesktop = window.innerWidth > 768;
        const newMode = isDesktop ? 'desktop-mode' : 'mobile-mode';
        
        if (!this.container.className.includes(newMode)) {
            this.container.className = `hyperos-notification-container ${newMode}`;
            
            // Update all active notifications
            this.notifications.forEach((notification) => {
                if (!notification.isDead) {
                    notification.isDesktop = isDesktop;
                    this.updateNotificationUI(notification);
                }
            });
        }
    }
    
    /**
     * Show a notification
     */
    show(options) {
        // Ensure container exists
        if (!this.container) {
            console.warn('⚠️ Notification system not ready yet');
            return null;
        }
        
        const {
            type = 'info',
            title = null,
            message = null,
            duration = 4000,
            icon = null,
            progress = true,
            dismissible = true
        } = options;
        
        // Use default config if title/message not provided
        const config = this.config[type] || this.config.info;
        const finalTitle = title || config.title;
        const finalMessage = message || config.msg;
        const finalIcon = icon || config.icon;
        const finalColor = config.color;
        
        const id = `hyperos-notif-${Date.now()}-${this.autoIncrementId++}`;
        const isDesktop = window.innerWidth > 768;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `hyperos-notification ${type} spawn`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.setAttribute('aria-label', `${finalTitle}: ${finalMessage}`);
        
        // Prepare classes for animation
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
            ${progress ? `
            <div class="hyperos-progress-track" aria-hidden="true">
                <div class="hyperos-progress-bar" id="hyperos-pb-${id}"></div>
            </div>
            ` : ''}
        `;
        
        // Set custom color if available
        if (finalColor && !this.cssLoaded()) {
            notification.style.background = `linear-gradient(135deg, 
                ${this.hexToRgba(finalColor, 0.92)}, 
                ${this.hexToRgba(this.darkenColor(finalColor, 10), 0.95)})`;
        }
        
        const notificationData = {
            id,
            element: notification,
            isDead: false,
            duration: progress ? duration : 0,
            isDesktop,
            type,
            createdAt: Date.now(),
            timer: null,
            dismissible,
            progress
        };
        
        // Store notification
        this.notifications.set(id, notificationData);
        
        // Add to container
        this.container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.refreshUI();
                
                // Start progress bar if enabled
                if (progress && duration > 0) {
                    const progressBar = notification.querySelector(`#hyperos-pb-${id}`);
                    if (progressBar) {
                        progressBar.style.transition = `transform ${duration}ms linear`;
                        progressBar.style.transform = isDesktop ? "scaleY(1)" : "scaleX(1)";
                        requestAnimationFrame(() => {
                            progressBar.style.transform = isDesktop ? "scaleY(0)" : "scaleX(0)";
                        });
                    }
                }
            }, 50);
        });
        
        // Set auto-dismiss timer if duration > 0
        if (duration > 0) {
            notificationData.timer = setTimeout(() => this.dismiss(id), duration);
        }
        
        // Desktop hover interactions
        if (isDesktop && dismissible) {
            notification.addEventListener('mouseenter', () => this.pauseDismiss(id));
            notification.addEventListener('mouseleave', () => this.resumeDismiss(id));
            
            // Click to dismiss
            notification.addEventListener('click', (e) => {
                if (!e.target.closest('.hyperos-icon-blob')) {
                    this.dismiss(id);
                }
            });
        } else if (!isDesktop && dismissible) {
            // Mobile swipe to dismiss
            this.bindSwipe(notificationData);
            
            // Mobile tap to dismiss
            notification.addEventListener('click', () => this.dismiss(id));
        }
        
        // Limit number of notifications
        this.cleanupExcessNotifications(isDesktop);
        
        return id;
    }
    
    /**
     * Check if external CSS is loaded
     */
    cssLoaded() {
        return !document.getElementById('hyperos-fallback-css') && 
               (document.getElementById('hyperos-notification-css') || 
                document.querySelector('link[href*="notification.css"]'));
    }
    
    /**
     * Update notification UI based on position in stack
     */
    refreshUI() {
        if (!this.container) return;
        
        const isDesktop = window.innerWidth > 768;
        const aliveNotifications = Array.from(this.notifications.values())
            .filter(item => !item.isDead);
        
        aliveNotifications.forEach((notification, index) => {
            const element = notification.element;
            
            // Remove all state classes
            element.classList.remove('spawn', 'active', 'layer-1', 'layer-2');
            
            if (isDesktop) {
                // Stack vertically for desktop
                const yOffset = index * -(130 + 12);
                element.style.setProperty('--y-offset', `${yOffset}px`);
                element.classList.add('active');
            } else {
                // Mobile: Only show top 3 notifications with different layers
                const delay = Math.min(index * 0.05, 0.3);
                element.style.transitionDelay = `${delay}s`;
                
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
        const element = notification.element;
        
        // Update progress bar orientation
        if (notification.progress) {
            const progressBar = element.querySelector('.hyperos-progress-bar');
            if (progressBar) {
                progressBar.style.transform = notification.isDesktop ? "scaleY(1)" : "scaleX(1)";
            }
        }
        
        this.refreshUI();
    }
    
    /**
     * Dismiss a notification
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        notification.isDead = true;
        clearTimeout(notification.timer);
        
        const element = notification.element;
        element.classList.add('exit');
        element.classList.remove('active', 'layer-1', 'layer-2');
        
        // Remove hover listeners
        element.replaceWith(element.cloneNode(true));
        
        this.refreshUI();
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 400);
    }
    
    /**
     * Pause auto-dismiss on hover
     */
    pauseDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || !notification.progress) return;
        
        clearTimeout(notification.timer);
        
        const progressBar = notification.element.querySelector('.hyperos-progress-bar');
        if (progressBar) {
            const currentTransform = progressBar.style.transform;
            const currentScale = currentTransform ? 
                parseFloat(currentTransform.match(/\d+\.?\d*/)[0]) : 1;
            
            progressBar.style.transitionDuration = '0ms';
            notification.pausedProgress = currentScale;
        }
    }
    
    /**
     * Resume auto-dismiss after hover
     */
    resumeDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.isDesktop || notification.isDead || !notification.progress) return;
        
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
        }, 300);
    }
    
    /**
     * Bind swipe gesture for mobile dismiss
     */
    bindSwipe(notification) {
        let startY = 0;
        let isSwiping = false;
        const element = notification.element;
        const threshold = 50;
        
        element.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isSwiping = true;
            element.style.transition = 'none';
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;
            
            if (diff > 0) {
                const opacity = 1 - (diff / 200);
                const translateY = -Math.min(diff, 100);
                
                element.style.opacity = Math.max(opacity, 0.3);
                element.style.transform = `translateY(${translateY}px)`;
            }
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            
            isSwiping = false;
            element.style.transition = '';
            
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (diff > threshold) {
                this.dismiss(notification.id);
            } else {
                element.style.opacity = '';
                element.style.transform = '';
            }
        }, { passive: true });
    }
    
    /**
     * Remove excess notifications
     */
    cleanupExcessNotifications(isDesktop) {
        const maxNotifications = isDesktop ? this.maxDesktopNotifications : this.maxMobileNotifications;
        const activeNotifications = Array.from(this.notifications.values())
            .filter(item => !item.isDead && item.isDesktop === isDesktop)
            .sort((a, b) => a.createdAt - b.createdAt);
        
        if (activeNotifications.length > maxNotifications) {
            const notificationsToRemove = activeNotifications.slice(0, activeNotifications.length - maxNotifications);
            notificationsToRemove.forEach(item => this.dismiss(item.id));
        }
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
     * Show loading notification (no auto-dismiss)
     */
    loading(title = "Memproses", message = "Harap tunggu...", duration = 0) {
        return this.show({
            type: 'loading',
            title,
            message,
            duration,
            progress: false
        });
    }
    
    /**
     * Update notification content
     */
    update(id, options) {
        const notification = this.notifications.get(id);
        if (!notification || notification.isDead) return;
        
        const { title, message, type, icon } = options;
        const element = notification.element;
        
        if (title) {
            const titleEl = element.querySelector('.hyperos-text-small');
            if (titleEl) titleEl.textContent = title;
        }
        
        if (message) {
            const messageEl = element.querySelector('.hyperos-text-main');
            if (messageEl) messageEl.textContent = message;
        }
        
        if (type && this.config[type]) {
            element.className = element.className.replace(/success|error|warning|info|loading/g, type);
            
            if (!icon) {
                const iconEl = element.querySelector('.material-icons-round');
                if (iconEl) iconEl.textContent = this.config[type].icon;
            }
        }
        
        if (icon) {
            const iconEl = element.querySelector('.material-icons-round');
            if (iconEl) iconEl.textContent = icon;
        }
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
    
    /**
     * Check if notification system is ready
     */
    isReady() {
        return this.container !== null;
    }
    
    /**
     * Convert hex color to rgba
     */
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    /**
     * Darken a hex color
     */
    darkenColor(hex, percent) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// Initialize after DOM is fully loaded
let HyperOSNotifications;

document.addEventListener('DOMContentLoaded', () => {
    HyperOSNotifications = new HyperOSNotification();
    
    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HyperOSNotifications;
    }
    
    // Attach to window for global access
    window.HyperOS = window.HyperOS || {};
    window.HyperOS.Notifications = HyperOSNotifications;
    
    // Quick access methods with enhanced error handling
    window.notify = {
        success: (title, message, duration) => {
            try {
                return HyperOSNotifications.success(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        error: (title, message, duration) => {
            try {
                return HyperOSNotifications.error(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        warning: (title, message, duration) => {
            try {
                return HyperOSNotifications.warning(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        info: (title, message, duration) => {
            try {
                return HyperOSNotifications.info(title, message, duration);
            } catch (error) {
                console.error('Notification error:', error);
                return null;
            }
        },
        loading: (title, message) => HyperOSNotifications.loading(title, message),
        show: (options) => HyperOSNotifications.show(options),
        update: (id, options) => HyperOSNotifications.update(id, options),
        dismiss: (id) => HyperOSNotifications.dismiss(id),
        clearAll: () => HyperOSNotifications.clearAll(),
        isReady: () => HyperOSNotifications.isReady(),
        setConfig: (type, config) => HyperOSNotifications.setConfig(type, config),
        addType: (type, config) => HyperOSNotifications.addType(type, config)
    };
    
    console.log('🔔 HyperOS Notification System v2.0 Ready');
});

// Fallback initialization for edge cases
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!window.HyperOS?.Notifications) {
        setTimeout(() => {
            if (!window.HyperOS?.Notifications) {
                HyperOSNotifications = new HyperOSNotification();
                window.HyperOS = window.HyperOS || {};
                window.HyperOS.Notifications = HyperOSNotifications;
                console.log('🔔 HyperOS Notification System (Late Init) Ready');
            }
        }, 100);
    }
}
