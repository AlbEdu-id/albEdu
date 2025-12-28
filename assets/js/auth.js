/**
 * ByteWard Auth Module v0.1.7
 * Complete Authentication System with Notification System v3.0 Integration
 * Rewritten for maximum compatibility and performance
 */

console.log('🔐 Memuat Auth Module v0.1.7...');

// =======================
// Global State Management
// =======================
class AuthState {
    constructor() {
        this._currentUser = null;
        this._userRole = null;
        this._userData = null;
        this._authReady = false;
        this._profileState = null;
        this._profileListener = null;
        this._redirectInProgress = false;
        this._initialized = false;
        this._authHandlers = [];
    }

    // Getters and setters with validation
    get currentUser() { return this._currentUser; }
    set currentUser(value) { 
        const oldUser = this._currentUser;
        this._currentUser = value;
        this._notifyAuthChange(oldUser, value);
    }

    get userRole() { return this._userRole; }
    set userRole(value) { this._userRole = value; }

    get userData() { return this._userData; }
    set userData(value) { 
        this._userData = value;
        this._updateProfileState();
    }

    get authReady() { return this._authReady; }
    set authReady(value) { this._authReady = value; }

    get profileState() { return this._profileState; }
    set profileState(value) { this._profileState = value; }

    get profileListener() { return this._profileListener; }
    set profileListener(value) { this._profileListener = value; }

    get redirectInProgress() { return this._redirectInProgress; }
    set redirectInProgress(value) { this._redirectInProgress = value; }

    get initialized() { return this._initialized; }
    set initialized(value) { this._initialized = value; }

    // Utility methods
    reset() {
        this._currentUser = null;
        this._userRole = null;
        this._userData = null;
        this._authReady = false;
        this._profileState = null;
        this._redirectInProgress = false;
    }

    // Event system for auth changes
    onAuthChange(handler) {
        this._authHandlers.push(handler);
        return () => {
            const index = this._authHandlers.indexOf(handler);
            if (index > -1) this._authHandlers.splice(index, 1);
        };
    }

    _notifyAuthChange(oldUser, newUser) {
        this._authHandlers.forEach(handler => {
            try {
                handler(oldUser, newUser);
            } catch (error) {
                console.error('Auth change handler error:', error);
            }
        });
    }

    _updateProfileState() {
        if (!this._userData) {
            this._profileState = null;
            return;
        }

        if (!this._profileState) {
            this._profileState = {
                isProfileComplete: false,
                selectedAvatar: null,
                customAvatar: null,
                tempName: '',
                isLoading: false,
                hasChanges: false,
                autoCloseTriggered: false
            };
        }

        this._profileState.isProfileComplete = this._checkProfileCompleteness(this._userData);
    }

    _checkProfileCompleteness(data) {
        if (!data) return false;
        const hasName = data.nama && data.nama.trim().length > 0;
        const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;
        return hasName && hasAvatar;
    }
}

// Global state instance
const authState = new AuthState();

// =======================
// Constants & Configuration
// =======================
const AUTH_CONFIG = {
    version: '0.1.7',
    features: {
        googleLogin: true,
        profileManagement: true,
        realtimeUpdates: true,
        roleBasedAccess: true
    },
    defaults: {
        maxProfileRetries: 3,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        avatarCacheTime: 24 * 60 * 60 * 1000 // 24 hours
    }
};

const PROFILE_AVATARS = [
    {
        id: 'male1',
        name: 'Male Avatar 1',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=5b6af0&radius=50',
        color: '#5b6af0'
    },
    {
        id: 'female1',
        name: 'Female Avatar 1',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=9d4edd&radius=50',
        color: '#9d4edd'
    },
    {
        id: 'robot',
        name: 'Robot',
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=10b981&radius=50',
        color: '#10b981'
    },
    {
        id: 'cat',
        name: 'Cat',
        url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=f59e0b&radius=50',
        color: '#f59e0b'
    },
    {
        id: 'alien',
        name: 'Alien',
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alien&backgroundColor=8b5cf6&radius=50',
        color: '#8b5cf6'
    },
    {
        id: 'person1',
        name: 'Person 1',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person1&backgroundColor=ef4444&radius=50',
        color: '#ef4444'
    },
    {
        id: 'person2',
        name: 'Person 2',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person2&backgroundColor=14b8a6&radius=50',
        color: '#14b8a6'
    },
    {
        id: 'person3',
        name: 'Person 3',
        url: 'https://api.dicebear.com/7.x/personas/svg?seed=person3&backgroundColor=8b5cf6&radius=50',
        color: '#8b5cf6'
    }
];

// =======================
// Notification System Integration
// =======================
class NotificationManager {
    static show(type, title, message, duration = null) {
        // Priority 1: Notification System v3.0
        if (window.Notifications && window.Notifications.show) {
            return window.Notifications.show({
                type: type,
                title: title,
                message: message,
                duration: duration || this._getDefaultDuration(type)
            });
        }
        
        // Priority 2: window.notify shortcut
        if (window.notify && window.notify.show) {
            const method = this._getNotifyMethod(type);
            if (method) {
                return method(title, message, duration || this._getDefaultDuration(type));
            }
        }
        
        // Priority 3: Direct notification system call
        if (window.Notifications) {
            const methodName = type === 'success' ? 'sukses' : 
                              type === 'error' ? 'gagal' : 
                              type === 'warning' ? 'peringatan' : 'informasi';
            
            if (window.Notifications[methodName]) {
                return window.Notifications[methodName](title, message, duration || this._getDefaultDuration(type));
            }
        }
        
        // Priority 4: Legacy systems
        if (window.HyperOS && window.HyperOS.Notifications && window.HyperOS.Notifications.show) {
            return window.HyperOS.Notifications.show({
                type: type,
                title: title,
                message: message,
                duration: duration || this._getDefaultDuration(type)
            });
        }
        
        // Fallback: console with emoji
        const emoji = this._getTypeEmoji(type);
        console.log(`${emoji} [${title}] ${message}`);
        return null;
    }

    static _getNotifyMethod(type) {
        const methodMap = {
            'success': window.notify.sukses || window.notify.success,
            'error': window.notify.gagal || window.notify.error,
            'warning': window.notify.peringatan || window.notify.warning,
            'info': window.notify.informasi || window.notify.info
        };
        return methodMap[type] || window.notify.show;
    }

    static _getDefaultDuration(type) {
        const durations = {
            'success': 4000,
            'error': 5000,
            'warning': 4000,
            'info': 3000
        };
        return durations[type] || 3000;
    }

    static _getTypeEmoji(type) {
        const emojis = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return emojis[type] || '📢';
    }

    // Convenience methods
    static success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    static error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    static warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    static info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
}

// =======================
// Utility Functions
// =======================
class AuthUtils {
    static generateDefaultAvatar(seed) {
        const defaultSeed = seed || 'user' + Date.now();
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(defaultSeed)}&backgroundColor=6b7280`;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static formatFirebaseError(error) {
        const errorMap = {
            'auth/popup-blocked': 'Popup login diblokir. Izinkan popup untuk melanjutkan.',
            'auth/popup-closed-by-user': 'Login dibatalkan oleh pengguna.',
            'auth/network-request-failed': 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
            'auth/invalid-email': 'Alamat email tidak valid.',
            'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
            'auth/user-not-found': 'Akun tidak ditemukan.',
            'auth/wrong-password': 'Password salah.',
            'auth/email-already-in-use': 'Email sudah digunakan.',
            'auth/weak-password': 'Password terlalu lemah.',
            'auth/operation-not-allowed': 'Operasi ini tidak diizinkan.',
            'auth/requires-recent-login': 'Sesi telah berakhir. Silakan login ulang.',
            'auth/too-many-requests': 'Terlalu banyak percobaan gagal. Coba lagi nanti.'
        };

        return errorMap[error.code] || error.message || 'Terjadi kesalahan yang tidak diketahui';
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// =======================
// Firestore Data Manager
// =======================
class UserDataManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = AUTH_CONFIG.defaults.maxProfileRetries;
        this.cache = new Map();
    }

    async fetch(userId) {
        console.log('📡 Mengambil data user dari Firestore...');

        // Clean up previous listener
        if (authState.profileListener) {
            authState.profileListener();
            authState.profileListener = null;
        }

        return new Promise((resolve, reject) => {
            const ref = firebaseDb.collection('users').doc(userId);
            let resolved = false;
            let retryAttempt = 0;

            const handleSnapshot = async (snap) => {
                try {
                    if (snap.exists) {
                        const data = snap.data();
                        this._processUserData(data);
                        resolved = true;
                        this.retryCount = 0;
                        resolve(data);
                    } else {
                        console.log('📝 Data user belum ada, membuat data baru...');
                        NotificationManager.info('Info', 'Membuat profil baru...', 3000);
                        const newData = await this._createUserData(userId);
                        resolved = true;
                        resolve(newData);
                    }
                } catch (error) {
                    console.error('Error processing snapshot:', error);
                    
                    if (!resolved && retryAttempt < this.maxRetries) {
                        retryAttempt++;
                        console.log(`🔄 Retry attempt ${retryAttempt} of ${this.maxRetries}`);
                        setTimeout(() => {
                            if (!resolved) {
                                handleSnapshot(snap);
                            }
                        }, 1000 * retryAttempt);
                    } else {
                        if (!resolved) {
                            reject(error);
                        }
                    }
                }
            };

            authState.profileListener = ref.onSnapshot(
                handleSnapshot,
                (error) => {
                    console.error('Firestore listener error:', error);
                    
                    if (!resolved && retryAttempt < this.maxRetries) {
                        retryAttempt++;
                        console.log(`🔄 Retry listener ${retryAttempt} of ${this.maxRetries}`);
                        setTimeout(() => {
                            if (!resolved) {
                                // Re-subscribe
                                authState.profileListener = ref.onSnapshot(
                                    handleSnapshot,
                                    (err) => {
                                        if (!resolved) reject(err);
                                    }
                                );
                            }
                        }, 1000 * retryAttempt);
                    } else {
                        if (!resolved) {
                            NotificationManager.error('Koneksi Gagal', 'Gagal terhubung ke database', 5000);
                            reject(error);
                        }
                    }
                }
            );

            // Timeout fallback
            setTimeout(() => {
                if (!resolved) {
                    console.warn('⚠️ Firestore timeout, using fallback');
                    this._fallbackFetch(userId).then(resolve).catch(reject);
                }
            }, 10000);
        });
    }

    async _createUserData(userId) {
        const user = firebaseAuth.currentUser;
        if (!user) throw new Error('No authenticated user');

        const avatarSeed = user.email || user.uid || 'user' + Date.now();
        const avatarUrl = AuthUtils.generateDefaultAvatar(avatarSeed);

        const payload = {
            id: userId,
            nama: user.displayName || '',
            email: user.email,
            foto_profil: avatarUrl,
            peran: 'siswa',
            profilLengkap: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await firebaseDb.collection('users').doc(userId).set(payload);
            NotificationManager.success('Profil Baru', 'Profil berhasil dibuat', 4000);
            console.log('✅ Data user baru berhasil dibuat');
            return payload;
        } catch (error) {
            console.error('❌ Error creating user data:', error);
            throw error;
        }
    }

    _processUserData(data) {
        authState.userData = data;
        authState.userRole = data.peran || 'siswa';
        
        // Update profile completeness
        const isComplete = this._checkProfileCompleteness(data);
        if (authState.profileState) {
            authState.profileState.isProfileComplete = isComplete;
        }

        console.log('✅ Data user diperbarui:', {
            role: authState.userRole,
            name: data.nama,
            profileComplete: isComplete
        });

        // Cache for offline use
        this.cache.set(data.id, {
            data: data,
            timestamp: Date.now()
        });
    }

    _checkProfileCompleteness(data) {
        if (!data) return false;
        const hasName = data.nama && data.nama.trim().length > 0;
        const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;
        return hasName && hasAvatar;
    }

    async _fallbackFetch(userId) {
        console.log('🔄 Using fallback fetch for user data');
        
        try {
            const doc = await firebaseDb.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                this._processUserData(data);
                return data;
            } else {
                return await this._createUserData(userId);
            }
        } catch (error) {
            console.error('Fallback fetch failed:', error);
            
            // Try to get from cache
            const cached = this.cache.get(userId);
            if (cached && (Date.now() - cached.timestamp) < AUTH_CONFIG.defaults.avatarCacheTime) {
                console.log('📦 Using cached user data');
                this._processUserData(cached.data);
                return cached.data;
            }
            
            throw error;
        }
    }

    async update(userId, updates) {
        try {
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebaseDb.collection('users').doc(userId).update(updates);
            
            // Update local cache
            if (this.cache.has(userId)) {
                const cached = this.cache.get(userId);
                cached.data = { ...cached.data, ...updates };
                cached.timestamp = Date.now();
            }
            
            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }
}

// =======================
// Authentication Core
// =======================
class AuthCore {
    constructor() {
        this.dataManager = new UserDataManager();
        this.sessionTimer = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.loginBlockedUntil = 0;
    }

    async login() {
        // Check if login is blocked
        if (this.isLoginBlocked()) {
            const remaining = Math.ceil((this.loginBlockedUntil - Date.now()) / 1000);
            throw new Error(`Terlalu banyak percobaan login. Coba lagi dalam ${remaining} detik.`);
        }

        try {
            console.log('🔐 Memulai login Google...');
            
            // Show loading
            this._showLoading('Membuka Google Login…');

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            // Customize provider for better UX
            provider.setCustomParameters({
                prompt: 'select_account',
                login_hint: ''
            });

            const result = await firebaseAuth.signInWithPopup(provider);
            
            // Reset login attempts on success
            this.loginAttempts = 0;
            this.loginBlockedUntil = 0;

            console.log('✅ Login sukses:', result.user.email);
            NotificationManager.success('Login Berhasil', 
                `Selamat datang, ${result.user.displayName || result.user.email}`, 
                4000
            );

            // Update loading message
            this._showLoading('Login berhasil, menyiapkan sistem…');

            // Update last login time
            await this._updateLastLogin(result.user.uid);

            // Start session timer
            this._startSessionTimer();

            return result.user;

        } catch (error) {
            console.error('❌ Error login:', error);
            
            // Increment login attempts
            this.loginAttempts++;
            
            // Block if too many attempts
            if (this.loginAttempts >= this.maxLoginAttempts) {
                this.loginBlockedUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
                NotificationManager.error('Login Diblokir', 
                    'Terlalu banyak percobaan gagal. Coba lagi dalam 5 menit.', 
                    5000
                );
            } else {
                const errorMessage = AuthUtils.formatFirebaseError(error);
                NotificationManager.error('Login Gagal', errorMessage, 5000);
            }

            this._hideLoading();
            throw error;
        }
    }

    async logout() {
        try {
            this._showLoading('Logout…');

            // Clean up listeners
            if (authState.profileListener) {
                authState.profileListener();
                authState.profileListener = null;
            }

            // Clear session timer
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
                this.sessionTimer = null;
            }

            await firebaseAuth.signOut();
            
            // Clear all auth state
            authState.reset();
            
            console.log('✅ Logout berhasil');
            NotificationManager.info('Logout Berhasil', 'Anda telah keluar dari sistem', 3000);

            // Clean up UI elements
            this._cleanupUI();

            // Redirect if ByteWard exists
            if (window.ByteWard && window.ByteWard.redirectAfterLogout) {
                window.ByteWard.redirectAfterLogout();
            }

        } catch (error) {
            console.error('❌ Error logout:', error);
            NotificationManager.error('Logout Gagal', 'Gagal melakukan logout', 5000);
            throw error;
        } finally {
            this._hideLoading();
        }
    }

    async refreshSession() {
        try {
            if (!authState.currentUser) return false;
            
            await authState.currentUser.getIdToken(true);
            console.log('🔄 Session refreshed');
            
            // Reset session timer
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
            }
            this._startSessionTimer();
            
            return true;
        } catch (error) {
            console.error('❌ Session refresh failed:', error);
            return false;
        }
    }

    isLoginBlocked() {
        return this.loginBlockedUntil > Date.now();
    }

    async _updateLastLogin(userId) {
        try {
            await firebaseDb.collection('users').doc(userId).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Failed to update last login:', error);
        }
    }

    _startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        this.sessionTimer = setTimeout(() => {
            console.log('⏰ Session timeout warning');
            NotificationManager.warning('Sesi Akan Habis', 
                'Sesi Anda akan segera habis. Silakan refresh atau login ulang.', 
                10000
            );
        }, AUTH_CONFIG.defaults.sessionTimeout - (5 * 60 * 1000)); // Warn 5 minutes before
    }

    _showLoading(message) {
        if (window.UI && window.UI.showAuthLoading) {
            window.UI.showAuthLoading(message);
        } else {
            console.log('⏳', message);
        }
    }

    _hideLoading() {
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        }
    }

    _cleanupUI() {
        const profileContainer = document.querySelector('.profile-button-container');
        if (profileContainer) profileContainer.remove();

        const profilePanel = document.getElementById('profileOverlay');
        if (profilePanel) profilePanel.remove();

        const authOverlay = document.getElementById('authLoadingOverlay');
        if (authOverlay) authOverlay.remove();
    }
}

// =======================
// System Initializer
// =======================
class SystemInitializer {
    constructor() {
        this.initialized = false;
        this.initializationPromise = null;
        this.checkInterval = null;
    }

    async initialize() {
        // Prevent multiple initializations
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            console.log('⚙️ Menginisialisasi ByteWard Auth System v0.1.7...');
            
            // Check system requirements
            if (!this._checkRequirements()) {
                throw new Error('System requirements not met');
            }

            // Show initial loading
            this._showLoading('Mengecek sistem...');

            // Check Notification System
            this._checkNotificationSystem();

            // Setup Firebase auth state observer
            await this._setupAuthObserver();

            // Start system monitoring
            this._startMonitoring();

            this.initialized = true;
            console.log('✅ Auth System initialized successfully');
            
            this._hideLoading();
            return true;
        })();

        return this.initializationPromise;
    }

    _checkRequirements() {
        const errors = [];

        if (typeof firebase === 'undefined') {
            errors.push('Firebase SDK not loaded');
        }
        
        if (!firebase.auth) {
            errors.push('Firebase Auth not available');
        }
        
        if (!firebase.firestore) {
            errors.push('Firebase Firestore not available');
        }

        if (errors.length > 0) {
            console.error('❌ System requirements not met:', errors);
            NotificationManager.error('System Error', 
                `Missing requirements: ${errors.join(', ')}. Please refresh.`, 
                10000
            );
            return false;
        }

        return true;
    }

    _checkNotificationSystem() {
        if (window.Notifications) {
            console.log('✅ Notification System v3.0 detected');
            // Configure notification system
            if (window.Notifications.setConfig) {
                window.Notifications.setConfig('success', {
                    icon: "check_circle",
                    title: "Berhasil",
                    msg: "Operasi berhasil"
                });
            }
        } else if (window.notify) {
            console.log('✅ window.notify shortcut detected');
        } else {
            console.warn('⚠️ Notification system not found, using console fallback');
        }
    }

    async _setupAuthObserver() {
        return new Promise((resolve) => {
            firebaseAuth.onAuthStateChanged(async (user) => {
                try {
                    if (user) {
                        console.log('👤 User authenticated:', user.email);
                        authState.currentUser = user;

                        // Fetch user data
                        this._showLoading('Mengambil data pengguna…');
                        
                        const authCore = new AuthCore();
                        const dataManager = new UserDataManager();
                        
                        try {
                            const userData = await dataManager.fetch(user.uid);
                            
                            // Check page access if ByteWard exists
                            if (window.ByteWard && window.ByteWard.checkPageAccess) {
                                this._showLoading('Memverifikasi akses halaman…');
                                await window.ByteWard.checkPageAccess();
                            }

                            // Trigger UI updates
                            this._triggerUIUpdate();
                            
                        } catch (error) {
                            console.error('Failed to fetch user data:', error);
                            NotificationManager.error('Data Error', 
                                'Gagal memuat data pengguna. Coba refresh halaman.', 
                                5000
                            );
                        }

                        authState.authReady = true;

                    } else {
                        console.log('👤 User not logged in');
                        authState.reset();
                        authState.authReady = true;

                        // Check if should redirect to login
                        this._checkLoginRedirect();
                    }

                } catch (error) {
                    console.error('❌ Auth flow error:', error);
                    NotificationManager.error('Auth Error', 
                        `Authentication error: ${error.message}`, 
                        5000
                    );
                    
                    // Ensure loading is hidden
                    this._hideLoading();
                } finally {
                    this._hideLoading();
                    resolve();
                }
            });
        });
    }

    _triggerUIUpdate() {
        // Trigger profile button creation after a delay
        setTimeout(() => {
            if (window.UI && window.UI.createProfileButton) {
                window.UI.createProfileButton();
                console.log('✅ Profile button created');
            }
        }, 1000);
    }

    _checkLoginRedirect() {
        const isLoginPage = window.ByteWard && window.ByteWard.isLoginPage 
            ? window.ByteWard.isLoginPage() 
            : window.location.pathname.includes('login');
            
        const isWithinAppScope = window.ByteWard && window.ByteWard.isWithinAppScope 
            ? window.ByteWard.isWithinAppScope() 
            : window.location.pathname.includes('/app/');

        if (!isLoginPage && isWithinAppScope && window.ByteWard && window.ByteWard.redirectToLogin) {
            // Small delay to prevent redirect loops
            setTimeout(() => {
                window.ByteWard.redirectToLogin();
            }, 500);
        }
    }

    _startMonitoring() {
        // Monitor connection status
        if (firebase.database) {
            const connectedRef = firebase.database().ref('.info/connected');
            connectedRef.on('value', (snap) => {
                if (snap.val() === true) {
                    console.log('✅ Connected to Firebase');
                } else {
                    console.warn('⚠️ Disconnected from Firebase');
                    NotificationManager.warning('Koneksi Terputus', 
                        'Kehilangan koneksi ke server. Beberapa fitur mungkin terbatas.',
                        3000
                    );
                }
            });
        }

        // Periodic system check
        this.checkInterval = setInterval(() => {
            this._systemHealthCheck();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    _systemHealthCheck() {
        console.log('🩺 System health check...');
        
        // Check auth state
        if (firebaseAuth.currentUser) {
            // Verify token is still valid
            firebaseAuth.currentUser.getIdTokenResult()
                .then((tokenResult) => {
                    const expirationTime = new Date(tokenResult.expirationTime);
                    const now = new Date();
                    const timeLeft = expirationTime - now;
                    
                    if (timeLeft < 5 * 60 * 1000) { // 5 minutes
                        console.log('🔄 Token expiring soon, refreshing...');
                        firebaseAuth.currentUser.getIdToken(true);
                    }
                })
                .catch(console.error);
        }
    }

    _showLoading(message) {
        if (window.UI && window.UI.showAuthLoading) {
            window.UI.showAuthLoading(message);
        } else {
            // Create minimal loading if UI not available
            this._createMinimalLoading(message);
        }
    }

    _hideLoading() {
        if (window.UI && window.UI.hideAuthLoading) {
            window.UI.hideAuthLoading();
        } else {
            this._removeMinimalLoading();
        }
    }

    _createMinimalLoading(message) {
        let overlay = document.getElementById('authLoadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'authLoadingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                color: white;
                font-family: system-ui, -apple-system, sans-serif;
                flex-direction: column;
                backdrop-filter: blur(5px);
            `;
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            `;
            
            const text = document.createElement('div');
            text.id = 'authLoadingText';
            text.textContent = message;
            text.style.cssText = `
                font-size: 16px;
                text-align: center;
                max-width: 300px;
                line-height: 1.5;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            
            overlay.appendChild(spinner);
            overlay.appendChild(text);
            overlay.appendChild(style);
            document.body.appendChild(overlay);
        } else {
            const text = overlay.querySelector('#authLoadingText');
            if (text) text.textContent = message;
        }
    }

    _removeMinimalLoading() {
        const overlay = document.getElementById('authLoadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        if (authState.profileListener) {
            authState.profileListener();
            authState.profileListener = null;
        }
        
        this.initialized = false;
        this.initializationPromise = null;
    }
}

// =======================
// Debug & Testing Utilities
// =======================
class DebugUtils {
    static info() {
        console.log('=== ByteWard Auth Debug Info v0.1.7 ===');
        console.log('Configuration:', AUTH_CONFIG);
        console.log('Current User:', authState.currentUser);
        console.log('User Role:', authState.userRole);
        console.log('User Data:', authState.userData);
        console.log('Profile Complete:', authState.profileState?.isProfileComplete);
        console.log('Auth Ready:', authState.authReady);
        console.log('Initialized:', authState.initialized);
        console.log('Notification System:', 
            window.Notifications ? 'v3.0' : 
            window.notify ? 'Notify Shortcut' : 'None'
        );
        console.log('Firebase Auth:', !!firebaseAuth);
        console.log('Firebase Firestore:', !!firebaseDb);
        console.log('==========================');
    }

    static testNotifications() {
        console.log('🧪 Testing notification system...');
        
        setTimeout(() => NotificationManager.info('Test Info', 'Ini adalah notifikasi info', 3000), 0);
        setTimeout(() => NotificationManager.success('Test Sukses', 'Ini adalah notifikasi sukses', 4000), 1000);
        setTimeout(() => NotificationManager.warning('Test Peringatan', 'Ini adalah notifikasi peringatan', 4000), 2000);
        setTimeout(() => NotificationManager.error('Test Error', 'Ini adalah notifikasi error', 5000), 3000);
    }

    static simulateError() {
        throw new Error('Simulated error for testing');
    }
}

// =======================
// Global API Interface
// =======================
class AuthAPI {
    constructor() {
        this.core = new AuthCore();
        this.initializer = new SystemInitializer();
        this.utils = AuthUtils;
        this.debug = DebugUtils;
    }

    // Authentication methods
    async login() {
        return await this.core.login();
    }

    async logout() {
        return await this.core.logout();
    }

    async refreshSession() {
        return await this.core.refreshSession();
    }

    // User data methods
    async fetchUserData(userId) {
        const manager = new UserDataManager();
        return await manager.fetch(userId);
    }

    async updateUserData(userId, updates) {
        const manager = new UserDataManager();
        return await manager.update(userId, updates);
    }

    // System methods
    async initialize() {
        return await this.initializer.initialize();
    }

    destroy() {
        this.initializer.destroy();
    }

    // Notification methods
    showNotification(type, title, message, duration) {
        return NotificationManager.show(type, title, message, duration);
    }

    showSuccess(title, message, duration) {
        return NotificationManager.success(title, message, duration);
    }

    showError(title, message, duration) {
        return NotificationManager.error(title, message, duration);
    }

    showWarning(title, message, duration) {
        return NotificationManager.warning(title, message, duration);
    }

    showInfo(title, message, duration) {
        return NotificationManager.info(title, message, duration);
    }

    // Utility methods
    generateDefaultAvatar(seed) {
        return AuthUtils.generateDefaultAvatar(seed);
    }

    checkProfileCompleteness(data) {
        if (!data) return false;
        const hasName = data.nama && data.nama.trim().length > 0;
        const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;
        return hasName && hasAvatar;
    }

    // Event subscription
    onAuthChange(handler) {
        return authState.onAuthChange(handler);
    }
}

// =======================
// Bootstrap & Global Export
// =======================
// Create global instance
const Auth = new AuthAPI();

// Attach to window with safe initialization
window.Auth = Auth;

// Add state getters to Auth object for backward compatibility
Object.defineProperties(window.Auth, {
    currentUser: {
        get: () => authState.currentUser
    },
    userRole: {
        get: () => authState.userRole
    },
    userData: {
        get: () => authState.userData,
        set: (value) => { authState.userData = value; }
    },
    profileState: {
        get: () => authState.profileState,
        set: (value) => { authState.profileState = value; }
    },
    authReady: {
        get: () => authState.authReady
    },
    PROFILE_AVATARS: {
        get: () => PROFILE_AVATARS
    }
});

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            try {
                await Auth.initialize();
            } catch (error) {
                console.error('Failed to initialize Auth system:', error);
                NotificationManager.error('Initialization Error', 
                    'Gagal menginisialisasi sistem autentikasi. Silakan refresh halaman.',
                    10000
                );
            }
        }, 300);
    });
} else {
    setTimeout(async () => {
        try {
            await Auth.initialize();
        } catch (error) {
            console.error('Failed to initialize Auth system:', error);
        }
    }, 300);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Auth,
        AuthAPI,
        AuthState,
        NotificationManager,
        AuthUtils,
        UserDataManager,
        AuthCore,
        SystemInitializer,
        DebugUtils
    };
}

console.log('🔐 Auth Module v0.1.7 - Complete Authentication System Ready');
