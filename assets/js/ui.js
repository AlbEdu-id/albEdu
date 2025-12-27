// ByteWard UI Module v0.1.9 - Enhanced UI & Notification System
console.log('🎨 Memuat UI Module v0.1.9...');

// =======================
// Configuration
// =======================
const UI_CONFIG = {
    version: '0.1.9',
    features: {
        profileSystem: true,
        notificationSystem: true,
        loadingSystem: true,
        errorSystem: true
    },
    defaults: {
        maxNotifications: 5,
        autoCloseDuration: 5000
    }
};

// =======================
// Notification System
// =======================
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.counter = 0;
        this.maxStack = UI_CONFIG.defaults.maxNotifications;
        this.init();
    }

    init() {
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }

        this.injectNotificationCSS();
        this.setupEventListeners();
        console.log('🔔 Notification System Initialized');
    }

    injectNotificationCSS() {
        if (document.querySelector('#notification-css')) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/css/notification.css';
        link.id = 'notification-css';

        link.onerror = () => {
            console.warn('Notification CSS failed to load, injecting fallback');
            this.injectNotificationFallbackCSS();
        };

        link.onload = () => console.log('✅ Notification CSS loaded');
        document.head.appendChild(link);
    }

    injectNotificationFallbackCSS() {
        const style = document.createElement('style');
        style.id = 'notification-fallback-css';
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
                animation: slideIn 0.3s ease;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.updatePosition());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updatePosition(), 100);
        });
        setTimeout(() => this.updatePosition(), 100);
    }

    updatePosition() {
        if (!this.container) return;
        
        const isMobile = window.innerWidth <= 767;
        if (isMobile) {
            this.container.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 0;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 100000;
                pointer-events: none;
            `;
        } else {
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 380px;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                z-index: 100000;
                pointer-events: none;
            `;
        }
    }

    show(options) {
        const {
            title = 'Notification',
            message = '',
            type = 'info',
            duration = UI_CONFIG.defaults.autoCloseDuration,
            icon = null,
            closeable = true
        } = options;

        const id = 'notification-' + Date.now() + '-' + this.counter++;
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification notification-${type} notification-enter`;
        
        const iconContent = icon || this.getIconByType(type);
        const typeTitle = this.getTypeTitle(type);
        
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

        if (closeable) {
            notification.querySelector('.notification-close').addEventListener('click', () => this.remove(id));
        }

        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close')) {
                this.remove(id);
            }
        });

        this.notifications.set(id, {
            element: notification,
            timeout: setTimeout(() => this.remove(id), duration)
        });

        this.container.appendChild(notification);
        this.updateStack();

        requestAnimationFrame(() => {
            notification.classList.remove('notification-enter');
        });

        return id;
    }

    getIconByType(type) {
        const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
        return icons[type] || '🔔';
    }

    getTypeTitle(type) {
        const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
        return titles[type] || 'Notification';
    }

    updateStack() {
        const notifications = Array.from(this.container.children);
        
        if (notifications.length > this.maxStack) {
            const toRemove = notifications.slice(this.maxStack);
            toRemove.forEach(notification => this.remove(notification.id));
        }

        notifications.forEach((notification, index) => {
            if (index > 0) {
                notification.classList.add('stacked');
                if (index >= 3) notification.style.zIndex = 100000 - index;
            } else {
                notification.classList.remove('stacked');
                notification.style.zIndex = 100000;
            }
        });
    }

    remove(id) {
        const data = this.notifications.get(id);
        if (!data) return;

        const { element, timeout } = data;
        if (timeout) clearTimeout(timeout);

        element.classList.add('notification-exit');
        setTimeout(() => {
            if (element.parentNode) element.parentNode.removeChild(element);
            this.notifications.delete(id);
            this.updateStack();
        }, 400);
    }

    clearAll() {
        Array.from(this.notifications.keys()).forEach(id => this.remove(id));
    }

    success(title, message, duration = 4000) {
        return this.show({ title, message, type: 'success', duration, icon: '✓' });
    }

    error(title, message, duration = 5000) {
        return this.show({ title, message, type: 'error', duration, icon: '✗' });
    }

    warning(title, message, duration = 4000) {
        return this.show({ title, message, type: 'warning', duration, icon: '⚠' });
    }

    info(title, message, duration = 3000) {
        return this.show({ title, message, type: 'info', duration, icon: 'ℹ' });
    }
}

// =======================
// Profile Button System
// =======================
function createProfileButton() {
    const existing = document.querySelector('.profile-button-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'profile-button-container';

    const button = document.createElement('button');
    button.className = 'profile-button';
    button.id = 'profileTrigger';
    
    const avatarUrl = window.Auth?.userData?.foto_profil || 
                     (window.Auth?.currentUser ? generateGitHubAvatar(window.Auth.currentUser.email) : '');
    const fallbackUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280';
    
    button.innerHTML = `<img src="${avatarUrl}" alt="Profile" class="profile-image" 
                          onerror="this.onerror=null; this.src='${fallbackUrl}'">`;

    if (window.Auth?.profileState && !window.Auth.profileState.isProfileComplete) {
        const indicator = document.createElement('div');
        indicator.className = 'profile-indicator';
        indicator.textContent = '!';
        indicator.title = 'Profil belum lengkap';
        button.appendChild(indicator);
    }

    button.addEventListener('click', showProfilePanel);
    container.appendChild(button);
    document.body.appendChild(container);
}

function updateProfileButton() {
    const button = document.getElementById('profileTrigger');
    if (!button) return;

    const img = button.querySelector('.profile-image');
    if (img && window.Auth?.userData?.foto_profil) {
        img.src = window.Auth.userData.foto_profil;
    }

    const indicator = button.querySelector('.profile-indicator');
    if (window.Auth?.profileState?.isProfileComplete) {
        if (indicator) indicator.remove();
    } else if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'profile-indicator';
        newIndicator.textContent = '!';
        newIndicator.title = 'Profil belum lengkap';
        button.appendChild(newIndicator);
    }
}

// =======================
// Profile Panel System
// =======================
function createProfilePanel() {
    const existing = document.getElementById('profilePanel');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profileOverlay';

    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';

    const headerTitle = window.Auth?.profileState?.isProfileComplete ? 'Profil Saya' : 'Lengkapi Profil';
    const avatarUrl = window.Auth?.userData?.foto_profil || 
                     (window.Auth?.currentUser ? generateGitHubAvatar(window.Auth.currentUser.email) : '');
    const userName = window.Auth?.userData?.nama || window.Auth?.currentUser?.displayName || 'Nama belum diisi';
    const userNama = window.Auth?.userData?.nama || '';
    const fallbackUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280';
    
    const panelHTML = `
        <div class="profile-header">
            <h2>${headerTitle}</h2>
            <button class="close-profile" id="closeProfile">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <div class="profile-content">
            <div class="current-profile">
                <img src="${avatarUrl}" alt="Current Avatar" class="current-avatar" 
                     onerror="this.onerror=null; this.src='${fallbackUrl}'">
                <div class="current-name">${userName}</div>
            </div>
            <div class="edit-section">
                <div class="name-input-group">
                    <label for="profileName">Nama Lengkap</label>
                    <input type="text" id="profileName" class="name-input" 
                           placeholder="Masukkan nama lengkap" value="${userNama}">
                </div>
                <div class="avatar-options">
                    <div class="option-title">Pilih Avatar</div>
                    <div class="option-grid" id="avatarOptions"></div>
                    <div class="custom-upload">
                        <label class="upload-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Unggah Foto Sendiri
                            <input type="file" id="avatarUpload" class="upload-input" accept="image/*">
                        </label>
                        <div class="preview-container" id="previewContainer">
                            <div class="preview-title">Pratinjau:</div>
                            <img class="preview-image" id="previewImage">
                        </div>
                    </div>
                </div>
                <div class="status-message" id="statusMessage"></div>
                <div class="profile-actions">
                    <button class="save-btn" id="saveProfile" disabled>
                        <span id="saveText">Simpan Perubahan</span>
                        <span class="save-loading" id="saveLoading">
                            <span class="spinner"></span>
                            Menyimpan...
                        </span>
                    </button>
                    <button class="cancel-btn" id="cancelEdit">Batal</button>
                </div>
            </div>
        </div>
    `;

    panel.innerHTML = panelHTML;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    initializeProfilePanel();
}

function initializeProfilePanel() {
    populateAvatarOptions();

    document.getElementById('closeProfile').addEventListener('click', hideProfilePanel);
    document.getElementById('cancelEdit').addEventListener('click', hideProfilePanel);
    document.getElementById('profileOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'profileOverlay') hideProfilePanel();
    });

    const nameInput = document.getElementById('profileName');
    nameInput.addEventListener('input', () => {
        if (window.Auth?.profileState) {
            const state = { ...window.Auth.profileState };
            state.tempName = nameInput.value.trim();
            window.Auth.profileState = state;
        }
        checkForChanges();
    });

    const uploadInput = document.getElementById('avatarUpload');
    uploadInput.addEventListener('change', handleAvatarUpload);

    document.getElementById('saveProfile').addEventListener('click', saveProfile);

    if (window.Auth?.profileState) {
        const state = { ...window.Auth.profileState };
        state.tempName = window.Auth?.userData?.nama || '';
        window.Auth.profileState = state;
    }
    checkForChanges();
}

function populateAvatarOptions() {
    const container = document.getElementById('avatarOptions');
    if (!container) return;

    container.innerHTML = '';
    const avatars = window.Auth?.DEFAULT_AVATARS || [];

    avatars.forEach(avatar => {
        const option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.id = avatar.id;

        if (avatar.id === 'github') {
            const githubUrl = window.Auth?.currentUser ? generateGitHubAvatar(window.Auth.currentUser.email) : '';
            option.innerHTML = `<img src="${githubUrl}" alt="${avatar.name}" 
                                   onerror="this.parentElement.innerHTML='<div class=\"option-label\">${avatar.name}</div>'">`;
        } else {
            option.innerHTML = `<img src="${avatar.url}" alt="${avatar.name}">`;
        }

        if (window.Auth?.userData?.foto_profil) {
            const currentUrl = window.Auth.userData.foto_profil;
            if (avatar.id === 'github' && currentUrl.includes('github.com/identicons/')) {
                option.classList.add('selected');
                if (window.Auth?.profileState) {
                    window.Auth.profileState = { ...window.Auth.profileState, selectedAvatar: 'github' };
                }
            } else if (currentUrl === avatar.url) {
                option.classList.add('selected');
                if (window.Auth?.profileState) {
                    window.Auth.profileState = { ...window.Auth.profileState, selectedAvatar: avatar.id };
                }
            }
        }

        option.addEventListener('click', () => selectAvatar(avatar.id));
        container.appendChild(option);
    });
}

function selectAvatar(avatarId) {
    if (window.Auth?.profileState) {
        window.Auth.profileState = {
            ...window.Auth.profileState,
            selectedAvatar: avatarId,
            customAvatar: null
        };
    }

    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.id === avatarId) opt.classList.add('selected');
    });

    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    previewContainer.classList.remove('active');
    previewImage.src = '';

    checkForChanges();
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        window.UI.Notification?.error('Error', 'Hanya file gambar yang diperbolehkan');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        window.UI.Notification?.error('Error', 'Ukuran gambar maksimal 2MB');
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (window.Auth?.profileState) {
                window.Auth.profileState = {
                    ...window.Auth.profileState,
                    customAvatar: e.target.result,
                    selectedAvatar: 'custom'
                };
            }

            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            const previewImage = document.getElementById('previewImage');
            const previewContainer = document.getElementById('previewContainer');
            previewImage.src = e.target.result;
            previewContainer.classList.add('active');
            checkForChanges();
        };
        reader.readAsDataURL(file);
    } catch (error) {
        window.UI.Notification?.error('Error', 'Gagal membaca file');
        console.error('Upload error:', error);
    }
}

function checkForChanges() {
    const nameChanged = window.Auth?.profileState?.tempName !== (window.Auth?.userData?.nama || '');
    let avatarChanged = false;

    if (window.Auth?.profileState) {
        const state = window.Auth.profileState;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            avatarChanged = state.customAvatar !== window.Auth?.userData?.foto_profil;
        } else if (state.selectedAvatar === 'github') {
            const githubUrl = window.Auth?.currentUser ? generateGitHubAvatar(window.Auth.currentUser.email) : '';
            avatarChanged = githubUrl !== window.Auth?.userData?.foto_profil;
        } else if (state.selectedAvatar) {
            const avatars = window.Auth?.DEFAULT_AVATARS || [];
            const selected = avatars.find(a => a.id === state.selectedAvatar);
            avatarChanged = selected?.url !== window.Auth?.userData?.foto_profil;
        }

        window.Auth.profileState = { ...state, hasChanges: nameChanged || avatarChanged };
    }

    const saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
        const isLoading = window.Auth?.profileState?.isLoading || false;
        const hasChanges = window.Auth?.profileState?.hasChanges || false;
        saveBtn.disabled = !hasChanges || isLoading;
    }
}

function showProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');

    if (!overlay || !panel) {
        createProfilePanel();
        setTimeout(() => {
            document.getElementById('profileOverlay').classList.add('active');
            document.getElementById('profilePanel').classList.add('active');
        }, 10);
    } else {
        overlay.classList.add('active');
        setTimeout(() => panel.classList.add('active'), 10);
    }

    const nameInput = document.getElementById('profileName');
    if (nameInput && window.Auth?.userData) {
        nameInput.value = window.Auth.userData.nama || '';
        if (window.Auth?.profileState) {
            window.Auth.profileState = { ...window.Auth.profileState, tempName: window.Auth.userData.nama || '' };
        }
    }

    showStatus('', '');
    checkForChanges();
}

function hideProfilePanel() {
    const overlay = document.getElementById('profileOverlay');
    const panel = document.getElementById('profilePanel');

    if (panel) panel.classList.remove('active');
    if (overlay) {
        setTimeout(() => {
            overlay.classList.remove('active');
            const uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) uploadInput.value = '';
        }, 300);
    }
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = 'status-message';
    statusEl.style.display = message ? 'block' : 'none';

    if (type === 'success') {
        statusEl.classList.add('status-success');
        setTimeout(() => statusEl.style.display = 'none', 3000);
    } else if (type === 'error') {
        statusEl.classList.add('status-error');
    }

    // Also show notification for important messages
    if (message && (type === 'success' || type === 'error')) {
        const notificationType = type === 'success' ? 'success' : 'error';
        const title = type === 'success' ? 'Success' : 'Error';
        window.UI.Notification?.[notificationType]?.(title, message);
    }
}

async function saveProfile() {
    if (!window.Auth?.profileState || !window.Auth?.userData || !window.Auth?.currentUser) return;

    const state = window.Auth.profileState;
    if (state.isLoading || !state.hasChanges) return;

    try {
        window.Auth.profileState = { ...state, isLoading: true };
        updateSaveButtonState();

        const updates = {};
        if (state.tempName && state.tempName !== window.Auth.userData.nama) {
            updates.nama = state.tempName.trim();
        }

        let newAvatarUrl = window.Auth.userData.foto_profil;
        if (state.selectedAvatar === 'custom' && state.customAvatar) {
            newAvatarUrl = state.customAvatar;
        } else if (state.selectedAvatar === 'github') {
            newAvatarUrl = window.Auth?.currentUser ? generateGitHubAvatar(window.Auth.currentUser.email) : '';
        } else if (state.selectedAvatar) {
            const selected = window.Auth.DEFAULT_AVATARS.find(a => a.id === state.selectedAvatar);
            newAvatarUrl = selected?.url;
        }

        if (newAvatarUrl && newAvatarUrl !== window.Auth.userData.foto_profil) {
            updates.foto_profil = newAvatarUrl;
        }

        const willBeComplete = window.Auth.checkProfileCompleteness({
            ...window.Auth.userData,
            ...updates
        });

        updates.profilLengkap = willBeComplete;
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

        await firebaseDb.collection('users').doc(window.Auth.currentUser.uid).update(updates);

        window.Auth.userData = { ...window.Auth.userData, ...updates };
        window.Auth.profileState = {
            ...state,
            isProfileComplete: willBeComplete,
            hasChanges: false,
            isLoading: false
        };

        updateProfileButton();
        window.UI.Notification?.success('Profile Updated', 'Your profile has been successfully updated!');

        const currentAvatar = document.querySelector('.current-avatar');
        const currentName = document.querySelector('.current-name');
        if (currentAvatar && updates.foto_profil) currentAvatar.src = updates.foto_profil;
        if (currentName && updates.nama) currentName.textContent = updates.nama;

        if (willBeComplete && !state.autoCloseTriggered) {
            window.Auth.profileState = { ...window.Auth.profileState, autoCloseTriggered: true };
            setTimeout(hideProfilePanel, 1500);
        }

    } catch (error) {
        console.error('Save profile error:', error);
        window.UI.Notification?.error('Save Failed', 'Failed to save changes: ' + error.message);
        if (window.Auth?.profileState) {
            window.Auth.profileState = { ...window.Auth.profileState, isLoading: false };
        }
    } finally {
        updateSaveButtonState();
    }
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('saveProfile');
    const saveText = document.getElementById('saveText');
    const saveLoading = document.getElementById('saveLoading');

    if (!saveBtn) return;

    const isLoading = window.Auth?.profileState?.isLoading || false;
    const hasChanges = window.Auth?.profileState?.hasChanges || false;
    saveBtn.disabled = !hasChanges || isLoading;

    if (isLoading) {
        saveText.style.display = 'none';
        saveLoading.classList.add('active');
    } else {
        saveText.style.display = 'inline';
        saveLoading.classList.remove('active');
    }
}

// =======================
// CSS Injection System
// =======================
function injectProfileCSS() {
    if (document.querySelector('link[href*="profile.css"]')) return;

    const cssPath = window.ByteWard ? 
        window.ByteWard.buildFullPath(window.ByteWard.APP_CONFIG.ASSETS.profileCSS) : 
        '/assets/css/profile.css';
    
    console.log('🎨 Memuat profile CSS dari:', cssPath);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.id = 'profile-css';

    link.onerror = () => {
        console.warn('Profile CSS gagal dimuat');
        injectFallbackCSS();
    };

    link.onload = () => console.log('✅ Profile CSS berhasil dimuat');
    document.head.appendChild(link);
}

function injectFallbackCSS() {
    if (document.querySelector('#profile-fallback-css')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/profile-fallback.css';
    link.id = 'profile-fallback-css';
    
    link.onerror = () => console.warn('Fallback CSS juga gagal dimuat');
    document.head.appendChild(link);
}

// =======================
// Loading System
// =======================
function showAuthLoading(text = 'Memverifikasi sesi login…') {
    let el = document.getElementById('loadingIndicator');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.className = 'loading-indicator';
        
        el.innerHTML = `
            <div class="block-loader">
                <div class="block-block" style="--i:0"></div>
                <div class="block-block" style="--i:1"></div>
                <div class="block-block" style="--i:2"></div>
                <div class="block-block" style="--i:3"></div>
                <div class="block-block" style="--i:4"></div>
            </div>
            <div class="loading-text">${text}</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        document.body.appendChild(el);
        injectLoadingCSS();
    }

    el.style.display = 'flex';
    const textEl = el.querySelector('.loading-text');
    if (textEl) textEl.textContent = text;
    console.log('[BYTEWARD]', text);
}

function hideAuthLoading() {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;
    
    el.style.opacity = '0';
    setTimeout(() => el.style.display = 'none', 300);
}

function injectLoadingCSS() {
    if (document.querySelector('#loading-css')) return;
    
    const style = document.createElement('style');
    style.id = 'loading-css';
    style.textContent = `
        .loading-indicator {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            flex-direction: column;
            backdrop-filter: blur(4px);
        }
        .block-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 60px;
        }
        .block-block {
            width: 12px;
            height: 40px;
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            border-radius: 4px;
            animation: block-bounce 1.8s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.15s);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .block-block:nth-child(odd) {
            background: linear-gradient(to bottom, #1d4ed8, #3b82f6);
        }
        .block-block:nth-child(3) {
            width: 14px; height: 45px;
        }
        @keyframes block-bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-15px); }
        }
        .loading-text {
            margin-top: 30px;
            color: #1e293b;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
            max-width: 300px;
            line-height: 1.5;
        }
        .progress-bar {
            width: 200px;
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            margin-top: 20px;
            overflow: hidden;
        }
        .progress-fill {
            width: 40%;
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            border-radius: 2px;
            animation: progress-shift 2s ease-in-out infinite;
        }
        @keyframes progress-shift {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(200%); }
        }
    `;
    document.head.appendChild(style);
}

// =======================
// Error Handling
// =======================
function showError(message) {
    window.UI.Notification?.error('System Error', message);
    
    // Legacy fallback
    const el = document.getElementById('systemError') || (() => {
        const div = document.createElement('div');
        div.id = 'systemError';
        div.className = 'system-error';
        document.body.appendChild(div);
        injectErrorCSS();
        return div;
    })();
    
    el.textContent = 'ByteWard Error: ' + message;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
}

function injectErrorCSS() {
    if (document.querySelector('#error-css')) return;
    
    const style = document.createElement('style');
    style.id = 'error-css';
    style.textContent = `
        .system-error {
            position: fixed;
            top: 20px; right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            z-index: 10000;
            max-width: 420px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: system-ui, -apple-system, sans-serif;
            display: none;
        }
    `;
    document.head.appendChild(style);
}

// =======================
// Utility Functions
// =======================
function generateGitHubAvatar(email) {
    if (!email) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6b7280';
    
    const hash = email.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const seed = Math.abs(hash) || 12345;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=6b7280`;
}

function initializeUISystem() {
    console.log('🚀 Initializing UI System v' + UI_CONFIG.version);
    
    // Inject required CSS
    injectProfileCSS();
    
    // Initialize notification system
    const notificationManager = new NotificationManager();
    
    // Create profile button if user is logged in
    if (window.Auth?.currentUser) {
        setTimeout(() => createProfileButton(), 1000);
    }
    
    console.log('✅ UI System initialized successfully');
}

// =======================
// Global Exports
// =======================
window.UI = {
    // Configuration
    config: UI_CONFIG,
    
    // Profile System
    createProfileButton,
    updateProfileButton,
    createProfilePanel,
    initializeProfilePanel,
    populateAvatarOptions,
    selectAvatar,
    handleAvatarUpload,
    checkForChanges,
    showProfilePanel,
    hideProfilePanel,
    showStatus,
    saveProfile,
    updateSaveButtonState,
    
    // CSS Management
    injectProfileCSS,
    injectFallbackCSS,
    
    // Loading System
    showAuthLoading,
    hideAuthLoading,
    
    // Error Handling
    showError,
    
    // Utility
    generateGitHubAvatar,
    
    // Initialization
    initialize: initializeUISystem
};

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUISystem);
} else {
    setTimeout(initializeUISystem, 100);
}

console.log('🎨 UI Module v0.1.9 - Advanced UI System Ready');
