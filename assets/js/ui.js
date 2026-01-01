// ByteWard UI Module v0.5.4 [Release] - Production Ready dengan Auth System
console.log('🎨 Memuat UI Module v0.5.4 - Arsitektur Berbasis Auth System');

// =======================
// CORE MODULE DEFINITION
// =======================
window.UI = window.UI || {};

// =======================
// AUTH UI (BACKWARD COMPATIBLE)
// =======================
UI.showAuthLoading = function(text = 'Memverifikasi sesi login…') {
    console.log('🔐 [UI] showAuthLoading:', text);
    
    // Cek apakah sudah ada loading indicator
    let loadingEl = document.getElementById('authLoadingIndicator');
    
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'authLoadingIndicator';
        loadingEl.className = 'auth-loading-indicator';
        loadingEl.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">${text}</div>
            </div>
        `;
        document.body.appendChild(loadingEl);
        
        // Inject CSS untuk loading indicator
        const style = document.createElement('style');
        style.id = 'auth-loading-css';
        style.textContent = `
            .auth-loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(4px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .loader-content {
                text-align: center;
                background: white;
                padding: 40px 60px;
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                border: 1px solid #e5e7eb;
                animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .loader-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid #f3f4f6;
                border-top-color: #6366f1;
                border-radius: 50%;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            }
            .loader-text {
                font-size: 16px;
                color: #4b5563;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 200px;
                line-height: 1.5;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes panelIn {
                0% { transform: translateY(20px) scale(0.97); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Update text jika berbeda
    const textEl = loadingEl.querySelector('.loader-text');
    if (textEl && textEl.textContent !== text) {
        textEl.textContent = text;
    }
    
    // Tampilkan dengan animasi
    loadingEl.style.display = 'flex';
    setTimeout(() => {
        loadingEl.style.opacity = '1';
    }, 10);
};

UI.hideAuthLoading = function() {
    console.log('🔐 [UI] hideAuthLoading');
    
    const loadingEl = document.getElementById('authLoadingIndicator');
    if (!loadingEl) return;
    
    loadingEl.style.opacity = '0';
    setTimeout(() => {
        loadingEl.style.display = 'none';
    }, 300);
};

UI.showLoginError = function(message) {
    console.error('🔐 [UI] showLoginError:', message);
    
    // Gunakan Modal System jika tersedia
    if (window.UI.Modal && window.UI.Modal.alert) {
        window.UI.Modal.alert({
            title: 'Login Gagal',
            message: message || 'Terjadi kesalahan saat login',
            okText: 'OK'
        });
    } else if (window.alert) {
        alert(message || 'Login gagal. Silakan coba lagi.');
    }
    
    // Sembunyikan loading jika masih tampil
    UI.hideAuthLoading();
};

UI.afterLogin = function() {
    console.log('🔐 [UI] afterLogin');
    
    // Buat profile button setelah login berhasil
    setTimeout(() => {
        UI.Profile.init();
    }, 1000);
};

UI.afterLogout = function() {
    console.log('🔐 [UI] afterLogout');
    
    // Hapus profile button
    const buttonContainer = document.querySelector('.profile-button-container');
    if (buttonContainer) {
        buttonContainer.remove();
    }
    
    // Hapus profile panel jika masih terbuka
    const overlay = document.getElementById('profileOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Sembunyikan loading
    UI.hideAuthLoading();
};

// =======================
// PROFILE UI (CORE v0.5.4)
// =======================
UI.Profile = {
    init: function() {
        console.log('👤 [UI.Profile] init');
        
        // Cek apakah user sudah login
        if (!window.Auth || !window.Auth.currentUser) {
            console.warn('User belum login, profile system tidak diinisialisasi');
            return;
        }
        
        // Inisialisasi profile state di Auth system jika belum ada
        if (!window.Auth.profileState) {
            window.Auth.profileState = {
                mode: 'view',
                isLoading: false,
                hasChanges: false,
                tempName: '',
                tempAvatar: null
            };
        }
        
        // Buat profile button
        this._createProfileButton();
        
        // Inject CSS untuk profile system
        this._injectProfileCSS();
        
        // Setup keyboard navigation
        this._initKeyboardNavigation();
        
        console.log('✅ Profile system initialized');
    },
    
    open: function(mode = 'view') {
        console.log('👤 [UI.Profile] open mode:', mode);
        
        // Update state di Auth system
        window.Auth.profileState.mode = mode;
        
        // Buat dan tampilkan panel
        this._createProfilePanel();
        this._showProfilePanel();
    },
    
    close: function() {
        console.log('👤 [UI.Profile] close');
        this._hideProfilePanel();
    },
    
    render: function() {
        console.log('👤 [UI.Profile] render mode:', window.Auth.profileState.mode);
        
        const panel = document.getElementById('profilePanel');
        if (!panel) return;
        
        // Get user data from Auth system
        const userData = window.Auth.userData || {};
        const currentUser = window.Auth.currentUser || {};
        const profileState = window.Auth.profileState || {};
        
        let content = '';
        
        // Render berdasarkan mode
        switch (profileState.mode) {
            case 'view':
                content = this._renderViewMode(userData, currentUser);
                break;
            case 'edit':
                content = this._renderEditMode(userData, profileState);
                break;
            case 'avatar':
                content = this._renderAvatarMode(profileState);
                break;
        }
        
        const title = this._getPanelTitle(profileState.mode);
        panel.innerHTML = `
            <div class="profile-header">
                <h2 id="profileTitle">${title}</h2>
                <button class="close-profile" id="closeProfile" aria-label="Tutup panel">&times;</button>
            </div>
            <div class="profile-content">
                ${content}
            </div>
        `;
        
        // Bind events
        this._bindPanelEvents();
    },
    
    save: async function() {
        console.log('👤 [UI.Profile] save');
        
        if (!window.Auth || !window.Auth.currentUser || !window.Auth.userData) {
            UI.showLoginError('Sistem auth tidak tersedia');
            return;
        }
        
        if (!window.Auth.profileState.hasChanges) return;
        
        try {
            // Tampilkan loading
            window.Auth.profileState.isLoading = true;
            UI.showAuthLoading('Menyimpan profil...');
            this.render();
            
            const updates = {};
            const profileState = window.Auth.profileState;
            const userData = window.Auth.userData;
            
            // Update nama jika berubah
            if (profileState.tempName && profileState.tempName !== userData.nama) {
                const cleanName = profileState.tempName.trim();
                if (cleanName.length > 0) {
                    updates.nama = cleanName;
                } else {
                    throw new Error('Nama tidak boleh kosong');
                }
            }
            
            // Update avatar jika berubah
            if (profileState.tempAvatar && profileState.tempAvatar !== userData.foto_profil) {
                updates.foto_profil = profileState.tempAvatar;
            }
            
            // Update status profilLengkap
            const finalName = updates.nama || userData.nama || '';
            const finalAvatar = updates.foto_profil || userData.foto_profil || '';
            updates.profilLengkap = finalName.trim().length > 0 && finalAvatar.trim().length > 0;
            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            // Hapus field yang tidak boleh diupdate
            delete updates.email;
            delete updates.peran;
            delete updates.id;
            delete updates.createdAt;
            
            // Update ke Firestore
            await firebase.firestore()
                .collection('users')
                .doc(window.Auth.currentUser.uid)
                .update(updates);
            
            // Update Auth.userData
            window.Auth.userData = { ...window.Auth.userData, ...updates };
            
            // Reset state
            window.Auth.profileState = {
                mode: 'view',
                isLoading: false,
                hasChanges: false,
                tempName: '',
                tempAvatar: null
            };
            
            // Update UI
            this._updateProfileButton();
            this.render();
            UI.hideAuthLoading();
            
            // Tampilkan success message
            this._showStatus('Profil berhasil disimpan!', 'success');
            
            // Auto close jika profil lengkap
            if (updates.profilLengkap) {
                setTimeout(() => {
                    this.close();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Save profile error:', error);
            
            let userMessage = 'Gagal menyimpan profil.';
            if (error.code === 'permission-denied') {
                userMessage = 'Anda tidak memiliki izin untuk mengubah data ini.';
            } else if (error.message) {
                userMessage += ' ' + error.message;
            }
            
            this._showStatus(userMessage, 'error');
            window.Auth.profileState.isLoading = false;
            this.render();
            UI.hideAuthLoading();
        }
    },
    
    // =======================
    // PRIVATE METHODS
    // =======================
    
    _createProfileButton: function() {
        console.log('👤 [UI.Profile] _createProfileButton');
        
        // Hapus yang sudah ada
        const existing = document.querySelector('.profile-button-container');
        if (existing) existing.remove();
        
        // Buat container
        const container = document.createElement('div');
        container.className = 'profile-button-container';
        
        // Buat button
        const button = document.createElement('button');
        button.className = 'profile-button';
        button.id = 'profileTrigger';
        button.setAttribute('aria-label', 'Buka panel profil');
        
        // Ambil avatar dari Auth system
        const userData = window.Auth.userData || {};
        const currentUser = window.Auth.currentUser || {};
        const avatarUrl = userData.foto_profil || 
                         `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || 'user')}&backgroundColor=6366f1`;
        
        // Buat gambar avatar
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Profile';
        img.className = 'profile-image';
        img.onerror = function() {
            this.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6366f1`;
        };
        
        button.appendChild(img);
        
        // Tambah indicator jika profil belum lengkap
        if (userData && !userData.profilLengkap) {
            const indicator = document.createElement('div');
            indicator.className = 'profile-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            indicator.textContent = '!';
            button.appendChild(indicator);
        }
        
        // Event listener
        button.addEventListener('click', () => this.open('view'));
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.4)';
        });
        
        container.appendChild(button);
        document.body.appendChild(container);
    },
    
    _updateProfileButton: function() {
        const button = document.getElementById('profileTrigger');
        if (!button) return;
        
        const img = button.querySelector('.profile-image');
        if (img && window.Auth.userData?.foto_profil) {
            const oldSrc = img.src;
            img.src = window.Auth.userData.foto_profil;
            img.onerror = function() {
                if (this.src !== oldSrc) {
                    this.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6366f1`;
                }
            };
        }
        
        const indicator = button.querySelector('.profile-indicator');
        if (window.Auth.userData?.profilLengkap) {
            if (indicator) indicator.remove();
        } else if (!indicator) {
            const newIndicator = document.createElement('div');
            newIndicator.className = 'profile-indicator';
            newIndicator.setAttribute('aria-hidden', 'true');
            newIndicator.textContent = '!';
            button.appendChild(newIndicator);
        }
    },
    
    _createProfilePanel: function() {
        // Hapus yang sudah ada
        const existingOverlay = document.getElementById('profileOverlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Buat overlay
        const overlay = document.createElement('div');
        overlay.className = 'profile-overlay';
        overlay.id = 'profileOverlay';
        
        // Buat panel
        const panel = document.createElement('div');
        panel.className = 'profile-panel';
        panel.id = 'profilePanel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'profileTitle');
        
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    },
    
    _showProfilePanel: function() {
        const overlay = document.getElementById('profileOverlay');
        const panel = document.getElementById('profilePanel');
        
        if (!overlay || !panel) return;
        
        // Reset state
        window.Auth.profileState.mode = 'view';
        window.Auth.profileState.hasChanges = false;
        window.Auth.profileState.tempName = window.Auth.userData?.nama || '';
        window.Auth.profileState.tempAvatar = null;
        
        // Render konten
        this.render();
        
        // Tampilkan dengan animasi
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.style.opacity = '1';
            panel.style.transform = 'translateY(0) scale(1)';
            panel.style.opacity = '1';
        }, 10);
        
        // Focus trap
        setTimeout(() => {
            const closeBtn = document.getElementById('closeProfile');
            if (closeBtn) closeBtn.focus();
        }, 100);
    },
    
    _hideProfilePanel: function() {
        const overlay = document.getElementById('profileOverlay');
        const panel = document.getElementById('profilePanel');
        
        if (!overlay || !panel) return;
        
        // Animasi keluar
        panel.style.transform = 'translateY(20px) scale(0.97)';
        panel.style.opacity = '0';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            
            // Reset file input
            const uploadInput = document.getElementById('avatarUpload');
            if (uploadInput) uploadInput.value = '';
            
            // Reset state
            window.Auth.profileState.mode = 'view';
            window.Auth.profileState.hasChanges = false;
            window.Auth.profileState.tempAvatar = null;
            
            // Kembalikan focus ke profile button
            const profileBtn = document.getElementById('profileTrigger');
            if (profileBtn) profileBtn.focus();
        }, 300);
    },
    
    _renderViewMode: function(userData, currentUser) {
        const avatarUrl = userData.foto_profil || 
                         `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || 'user')}&backgroundColor=6366f1`;
        
        return `
            <div class="view-mode">
                <div class="avatar-section">
                    <img src="${avatarUrl}" 
                         alt="Avatar ${userData.nama}" 
                         class="view-avatar"
                         onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6366f1'">
                    ${!userData.profilLengkap ? '<div class="incomplete-badge" aria-label="Profil belum lengkap">!</div>' : ''}
                </div>
                
                <div class="user-info">
                    <h3 class="user-name">${userData.nama || 'Nama belum diisi'}</h3>
                    <p class="user-email">${currentUser.email || 'Email tidak tersedia'}</p>
                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-value">${userData.totalUjian || 0}</span>
                            <span class="stat-label">Ujian Diselesaikan</span>
                        </div>
                    </div>
                </div>
                
                <div class="view-actions">
                    <button class="btn btn-edit" id="editProfileBtn">
                        <span>Edit Profil</span>
                    </button>
                    <button class="btn btn-logout" id="logoutBtn">
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    _renderEditMode: function(userData, profileState) {
        const avatarUrl = profileState.tempAvatar || userData.foto_profil || 
                         `https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6366f1`;
        
        return `
            <div class="edit-mode">
                <div class="edit-avatar-section">
                    <img src="${avatarUrl}" 
                         alt="Avatar ${userData.nama}" 
                         class="edit-avatar"
                         id="editAvatarImage"
                         onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=user&backgroundColor=6366f1'">
                    <button class="avatar-edit-btn" id="editAvatarBtn">
                        <span>Ubah Avatar</span>
                    </button>
                </div>
                
                <div class="edit-form">
                    <div class="form-group">
                        <label for="editName">Nama Lengkap</label>
                        <input type="text" 
                               id="editName" 
                               value="${profileState.tempName || userData.nama || ''}" 
                               placeholder="Masukkan nama lengkap"
                               aria-label="Nama lengkap">
                    </div>
                </div>
                
                <div class="status-message" id="statusMessage" role="alert"></div>
                
                <div class="edit-actions">
                    <button class="btn btn-primary" id="saveProfileBtn" ${profileState.hasChanges ? '' : 'disabled'} aria-label="Simpan perubahan">
                        ${profileState.isLoading ? 
                            '<div class="loading-container"><span class="loading-spinner"></span><span>Menyimpan...</span></div>' : 
                            '<span>Simpan</span>'}
                    </button>
                    <button class="btn btn-secondary" id="cancelEditBtn">
                        <span>Batal</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    _renderAvatarMode: function(profileState) {
        const avatars = this._generateAvatars(20);
        const customAvatar = profileState.tempAvatar;
        
        return `
            <div class="edit-avatar-mode">
                <h3>Pilih Avatar</h3>
                
                ${customAvatar ? `
                <div class="custom-avatar-preview active" id="customAvatarPreviewContainer">
                    <div class="preview-container">
                        <div class="preview-title">Preview Avatar Custom</div>
                        <img src="${customAvatar}" 
                             alt="Preview avatar custom" 
                             class="preview-image">
                    </div>
                </div>
                ` : ''}
                
                <div class="avatar-grid" id="avatarGrid" role="listbox" aria-label="Pilihan avatar">
                    ${avatars.map(avatar => `
                        <div class="avatar-item ${customAvatar === avatar.url ? 'selected' : ''}" 
                             data-url="${avatar.url}"
                             role="option"
                             aria-label="${avatar.name}"
                             aria-selected="${customAvatar === avatar.url}">
                            <img src="${avatar.url}" 
                                 alt="${avatar.name}"
                                 onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.id}&backgroundColor=6366f1'">
                        </div>
                    `).join('')}
                </div>
                
                <div class="upload-avatar">
                    <label for="avatarUpload" class="btn-upload">
                        <span>Unggah Avatar Custom</span>
                    </label>
                    <input type="file" 
                           id="avatarUpload" 
                           accept="image/*" 
                           style="display: none;"
                           aria-label="Unggah gambar avatar">
                </div>
                
                <div class="edit-avatar-actions">
                    <button class="btn-back" id="backToEditBtn">
                        <span>Kembali ke Edit Mode</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    _getPanelTitle: function(mode) {
        const titles = {
            'view': 'Profil Saya',
            'edit': 'Edit Profil',
            'avatar': 'Pilih Avatar'
        };
        return titles[mode] || 'Profil';
    },
    
    _generateAvatars: function(count = 20) {
        const avatars = [];
        const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles',
                       'fun-emoji', 'icons', 'identicon', 'initials', 'micah', 'miniavs',
                       'open-peeps', 'personas', 'pixel-art', 'shapes', 'thumbs'];
        
        for (let i = 1; i <= count; i++) {
            const style = styles[(i - 1) % styles.length];
            avatars.push({
                id: `avatar${i}`,
                name: `Avatar ${i}`,
                url: `https://api.dicebear.com/7.x/${style}/svg?seed=avatar${i}&backgroundColor=6366f1`,
                style: style
            });
        }
        return avatars;
    },
    
    _bindPanelEvents: function() {
        // Close button
        const closeBtn = document.getElementById('closeProfile');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Overlay click
        const overlay = document.getElementById('profileOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        // Mode-specific events
        switch (window.Auth.profileState.mode) {
            case 'view':
                this._bindViewModeEvents();
                break;
            case 'edit':
                this._bindEditModeEvents();
                break;
            case 'avatar':
                this._bindAvatarModeEvents();
                break;
        }
    },
    
    _bindViewModeEvents: function() {
        // Edit Profile button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                UI.Animate.modeTransition('edit', () => {
                    window.Auth.profileState.mode = 'edit';
                    window.Auth.profileState.tempName = window.Auth.userData?.nama || '';
                    this.render();
                });
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this._confirmLogout());
        }
    },
    
    _bindEditModeEvents: function() {
        // Name input
        const nameInput = document.getElementById('editName');
        if (nameInput) {
            nameInput.value = window.Auth.profileState.tempName || window.Auth.userData?.nama || '';
            
            nameInput.addEventListener('input', (e) => {
                window.Auth.profileState.tempName = e.target.value;
                window.Auth.profileState.hasChanges = 
                    window.Auth.profileState.tempName !== (window.Auth.userData?.nama || '') ||
                    window.Auth.profileState.tempAvatar !== null;
                this._updateSaveButton();
            });
            
            // Auto-focus
            setTimeout(() => nameInput.focus(), 50);
        }
        
        // Edit Avatar button
        const editAvatarBtn = document.getElementById('editAvatarBtn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                UI.Animate.modeTransition('avatar', () => {
                    window.Auth.profileState.mode = 'avatar';
                    this.render();
                });
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                UI.Animate.modeTransition('view', () => {
                    window.Auth.profileState.mode = 'view';
                    window.Auth.profileState.hasChanges = false;
                    window.Auth.profileState.tempAvatar = null;
                    this.render();
                });
            });
        }
    },
    
    _bindAvatarModeEvents: function() {
        // Avatar selection
        const avatarItems = document.querySelectorAll('.avatar-item');
        avatarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove selected class from all
                avatarItems.forEach(i => {
                    i.classList.remove('selected');
                    i.setAttribute('aria-selected', 'false');
                });
                
                // Add to clicked
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                
                // Store selection
                const avatarUrl = item.dataset.url;
                window.Auth.profileState.tempAvatar = avatarUrl;
                window.Auth.profileState.hasChanges = true;
                
                // Hide custom preview
                const previewContainer = document.getElementById('customAvatarPreviewContainer');
                if (previewContainer) {
                    previewContainer.classList.remove('active');
                    setTimeout(() => {
                        previewContainer.style.display = 'none';
                    }, 300);
                }
            });
        });
        
        // Custom upload
        const uploadInput = document.getElementById('avatarUpload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this._handleAvatarUpload(e));
            
            // Link button to input file
            const uploadBtn = document.querySelector('.btn-upload');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    uploadInput.click();
                });
            }
        }
        
        // Back button
        const backBtn = document.getElementById('backToEditBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                UI.Animate.modeTransition('edit', () => {
                    window.Auth.profileState.mode = 'edit';
                    this.render();
                    this._updateAvatarPreview();
                });
            });
        }
    },
    
    _handleAvatarUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validasi
        if (!file.type.startsWith('image/')) {
            this._showStatus('Hanya file gambar yang diperbolehkan', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this._showStatus('Ukuran gambar maksimal 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            window.Auth.profileState.tempAvatar = e.target.result;
            window.Auth.profileState.hasChanges = true;
            
            // Update selected visual
            const avatarItems = document.querySelectorAll('.avatar-item');
            avatarItems.forEach(item => {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            });
            
            // Show preview
            this._showStatus('Avatar custom berhasil diunggah!', 'success');
            
            // Render preview
            const previewContainer = document.createElement('div');
            previewContainer.id = 'customAvatarPreviewContainer';
            previewContainer.className = 'custom-avatar-preview active';
            previewContainer.innerHTML = `
                <div class="preview-container">
                    <div class="preview-title">Preview Avatar Custom</div>
                    <img src="${e.target.result}" 
                         alt="Preview avatar custom" 
                         class="preview-image">
                </div>
            `;
            
            const existingPreview = document.getElementById('customAvatarPreviewContainer');
            const avatarGrid = document.getElementById('avatarGrid');
            if (existingPreview && avatarGrid && avatarGrid.parentNode) {
                existingPreview.replaceWith(previewContainer);
            } else if (avatarGrid && avatarGrid.parentNode) {
                avatarGrid.parentNode.insertBefore(previewContainer, avatarGrid);
            }
            
            // Reset file input
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    },
    
    _updateAvatarPreview: function() {
        const avatarImg = document.getElementById('editAvatarImage');
        if (!avatarImg) return;
        
        if (window.Auth.profileState.tempAvatar) {
            avatarImg.src = window.Auth.profileState.tempAvatar;
        }
    },
    
    _updateSaveButton: function() {
        const saveBtn = document.getElementById('saveProfileBtn');
        if (!saveBtn) return;
        
        const profileState = window.Auth.profileState || {};
        saveBtn.disabled = !profileState.hasChanges || profileState.isLoading;
        
        if (profileState.hasChanges && !profileState.isLoading) {
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
        } else {
            saveBtn.style.opacity = '0.6';
            saveBtn.style.cursor = 'not-allowed';
        }
    },
    
    _showStatus: function(message, type = 'success') {
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;
        
        const icon = type === 'success' ? '✓' : '✗';
        statusEl.innerHTML = `
            <span class="status-icon">${icon}</span>
            <span>${message}</span>
        `;
        statusEl.className = `status-message status-${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusEl.className = 'status-message';
                statusEl.innerHTML = '';
                statusEl.style.cssText = 'display: none;';
            }, 3000);
        }
    },
    
    _confirmLogout: async function() {
        try {
            const confirmed = await window.UI.Modal.confirm({
                title: 'Konfirmasi Logout',
                message: 'Apakah Anda yakin ingin keluar dari akun Anda?',
                confirmText: 'Ya, Logout',
                cancelText: 'Batal'
            });
            
            if (confirmed) {
                UI.showAuthLoading('Sedang logout...');
                await window.Auth.authLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            UI.showLoginError('Gagal logout: ' + (error.message || 'Terjadi kesalahan'));
        }
    },
    
    _initKeyboardNavigation: function() {
        document.addEventListener('keydown', (e) => {
            // ESC key untuk menutup panel
            if (e.key === 'Escape') {
                const overlay = document.getElementById('profileOverlay');
                if (overlay && overlay.style.display === 'flex') {
                    this.close();
                    e.preventDefault();
                }
            }
            
            // Tab key untuk focus trap
            if (e.key === 'Tab' && document.getElementById('profileOverlay')?.style.display === 'flex') {
                const focusableElements = document.querySelectorAll('#profilePanel button, #profilePanel input, #profilePanel [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    },
    
    _injectProfileCSS: function() {
        if (document.querySelector('#profile-css')) return;
        
        const style = document.createElement('style');
        style.id = 'profile-css';
        style.textContent = `
            /* ==================== PROFILE BUTTON ==================== */
            .profile-button-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 10000;
            }
            
            .profile-button {
                width: 68px;
                height: 68px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                cursor: pointer;
                padding: 4px;
                position: relative;
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
            }
            
            .profile-button:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6);
            }
            
            .profile-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                border: 3px solid white;
                display: block;
            }
            
            .profile-indicator {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 26px;
                height: 26px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: 900;
                border: 2.5px solid white;
                z-index: 10;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }
            
            /* ==================== PROFILE OVERLAY & PANEL ==================== */
            .profile-overlay {
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
                z-index: 20000;
                padding: 16px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .profile-panel {
                width: 100%;
                max-width: 500px;
                background: white;
                border-radius: 28px;
                overflow: hidden;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
                transform: translateY(20px) scale(0.97);
                opacity: 0;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            }
            
            .profile-header {
                padding: 24px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }
            
            .profile-header h2 {
                font-size: clamp(20px, 2vw, 28px);
                font-weight: 700;
                margin: 0;
                line-height: 1.2;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .close-profile {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
                font-family: inherit;
            }
            
            .close-profile:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            .profile-content {
                overflow-y: auto;
                flex: 1;
            }
            
            /* ==================== VIEW MODE ==================== */
            .view-mode {
                padding: 24px;
            }
            
            .avatar-section {
                text-align: center;
                margin-bottom: 28px;
                position: relative;
            }
            
            .view-avatar {
                width: 140px;
                height: 140px;
                border-radius: 50%;
                object-fit: cover;
                border: 6px solid white;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            }
            
            .incomplete-badge {
                position: absolute;
                top: 10px;
                right: calc(50% - 70px);
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 900;
                border: 3px solid white;
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
                transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }
            
            .user-info {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .user-name {
                font-size: clamp(24px, 3vw, 32px);
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
                line-height: 1.2;
                word-break: break-word;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .user-email {
                font-size: clamp(14px, 1.5vw, 16px);
                color: #6b7280;
                margin-bottom: 24px;
                word-break: break-all;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .user-stats {
                background: #f8fafc;
                border-radius: 20px;
                padding: 20px;
                display: inline-block;
                border: 1px solid #e5e7eb;
                min-width: 180px;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-value {
                display: block;
                font-size: clamp(32px, 4vw, 42px);
                font-weight: 800;
                color: #6366f1;
                line-height: 1;
                margin-bottom: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .stat-label {
                font-size: clamp(13px, 1.5vw, 14px);
                color: #6b7280;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .view-actions {
                display: flex;
                flex-direction: column;
                gap: 16px;
                max-width: 320px;
                margin: 0 auto;
            }
            
            /* ==================== EDIT MODE ==================== */
            .edit-mode {
                padding: 24px;
            }
            
            .edit-avatar-section {
                text-align: center;
                margin-bottom: 28px;
            }
            
            .edit-avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
                border: 5px solid white;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                margin-bottom: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            }
            
            .edit-avatar:hover {
                transform: scale(1.05);
                box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2);
                border-color: #6366f1;
            }
            
            .avatar-edit-btn {
                background: none;
                border: none;
                color: #6366f1;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                padding: 8px 16px;
                border-radius: 10px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0 auto;
                font-family: inherit;
            }
            
            .avatar-edit-btn:hover {
                background: rgba(99, 102, 241, 0.1);
            }
            
            .edit-form {
                margin-bottom: 32px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .form-group input {
                width: 100%;
                padding: 16px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 16px;
                font-size: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                outline: none;
                font-family: inherit;
            }
            
            .form-group input:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
            
            .edit-actions {
                display: flex;
                gap: 16px;
                max-width: 400px;
                margin: 0 auto;
            }
            
            /* ==================== EDIT AVATAR MODE ==================== */
            .edit-avatar-mode {
                padding: 24px;
            }
            
            .edit-avatar-mode h3 {
                font-size: clamp(18px, 2vw, 22px);
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 20px;
                text-align: center;
                line-height: 1.3;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .avatar-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 28px;
                padding: 8px;
            }
            
            @media (max-width: 768px) {
                .avatar-grid {
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 4px;
                }
            }
            
            @media (max-width: 480px) {
                .avatar-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
            }
            
            .avatar-item {
                width: 100%;
                aspect-ratio: 1;
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
                border: 3px solid transparent;
                background: #f8fafc;
                position: relative;
                transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
            }
            
            .avatar-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            
            .avatar-item.selected {
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 
                            0 6px 20px rgba(99, 102, 241, 0.15);
                transform: scale(1.05);
            }
            
            @media (hover: hover) and (min-width: 769px) {
                .avatar-item:hover:not(.selected) {
                    transform: scale(1.03);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
                }
            }
            
            /* ==================== CUSTOM AVATAR PREVIEW ==================== */
            .custom-avatar-preview {
                width: 100%;
                display: none;
                margin: 0 auto 28px;
            }
            
            .custom-avatar-preview.active {
                display: block;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .preview-container {
                position: relative;
                width: 100%;
                max-width: 280px;
                margin: 0 auto;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                background: #f8fafc;
            }
            
            .preview-title {
                position: absolute;
                top: 12px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                z-index: 2;
                opacity: 0.8;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .preview-image {
                width: 100%;
                height: 280px;
                object-fit: cover;
                display: block;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            }
            
            .upload-avatar {
                text-align: center;
                margin-bottom: 28px;
                padding: 0 16px;
            }
            
            .edit-avatar-actions {
                display: flex;
                justify-content: center;
                padding: 0 16px;
            }
            
            /* ==================== BUTTON STYLES ==================== */
            .btn {
                padding: 18px 32px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-align: center;
                font-family: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                min-height: 56px;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                flex: 1;
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
            }
            
            .btn-primary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
                box-shadow: none !important;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                flex: 1;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
                transform: translateY(-2px);
            }
            
            .btn-edit {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
            }
            
            .btn-edit:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
            }
            
            .btn-logout {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
            }
            
            .btn-logout:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);
            }
            
            .btn-back {
                padding: 14px 28px;
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                border-radius: 16px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                max-width: 280px;
                font-family: inherit;
            }
            
            .btn-back:hover {
                background: #e5e7eb;
                transform: translateY(-2px);
            }
            
            .btn-upload {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 16px 32px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-radius: 16px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: none;
                font-family: inherit;
                width: 100%;
                max-width: 280px;
                margin: 0 auto;
            }
            
            .btn-upload:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
            }
            
            /* ==================== STATUS MESSAGES ==================== */
            .status-message {
                padding: 16px 20px;
                border-radius: 16px;
                margin-bottom: 24px;
                font-size: 14px;
                display: none;
                align-items: center;
                gap: 12px;
                line-height: 1.5;
            }
            
            .status-success {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #a7f3d0;
                display: flex !important;
            }
            
            .status-error {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
                display: flex !important;
            }
            
            /* ==================== LOADING STATES ==================== */
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
                flex-shrink: 0;
                margin: 0;
            }
            
            .loading-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            
            /* ==================== SCROLLBAR ==================== */
            .profile-panel::-webkit-scrollbar {
                width: 6px;
            }
            
            .profile-panel::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            
            .profile-panel::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            
            .profile-panel::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
            
            /* ==================== REDUCED MOTION ==================== */
            @media (prefers-reduced-motion: reduce) {
                .profile-panel,
                .avatar-item,
                .btn,
                .profile-indicator {
                    animation: none !important;
                    transition: none !important;
                }
                
                .profile-overlay.active .profile-panel {
                    transform: none;
                    opacity: 1;
                }
                
                .avatar-item.selected {
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// =======================
// ANIMATION SYSTEM
// =======================
UI.Animate = {
    panelIn: function(element) {
        if (!element) return;
        
        element.style.transform = 'translateY(0) scale(1)';
        element.style.opacity = '1';
    },
    
    panelOut: function(element) {
        if (!element) return;
        
        element.style.transform = 'translateY(20px) scale(0.97)';
        element.style.opacity = '0';
    },
    
    modeTransition: function(newMode, callback) {
        console.log('🎬 [UI.Animate] modeTransition to:', newMode);
        
        const panel = document.getElementById('profilePanel');
        const contentArea = panel?.querySelector('.view-mode, .edit-mode, .edit-avatar-mode');
        
        if (!contentArea) {
            callback();
            return;
        }
        
        // Tambah class exit
        contentArea.classList.add('mode-transition-exit');
        
        // Tunggu animasi keluar
        setTimeout(() => {
            // Eksekusi callback (render mode baru)
            callback();
            
            // Tunggu DOM update
            setTimeout(() => {
                const newContent = panel?.querySelector('.view-mode, .edit-mode, .edit-avatar-mode');
                if (newContent) {
                    // Tambah class enter
                    newContent.classList.add('mode-transition-enter');
                    
                    // Hapus class setelah animasi selesai
                    setTimeout(() => {
                        newContent.classList.remove('mode-transition-enter');
                        contentArea.classList.remove('mode-transition-exit');
                    }, 250);
                } else {
                    contentArea.classList.remove('mode-transition-exit');
                }
            }, 50);
        }, 200);
        
        // Inject CSS untuk transisi jika belum ada
        if (!document.querySelector('#animation-css')) {
            const style = document.createElement('style');
            style.id = 'animation-css';
            style.textContent = `
                .mode-transition-enter {
                    animation: modeFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                
                .mode-transition-exit {
                    animation: modeFadeOut 0.2s ease forwards;
                }
                
                @keyframes modeFadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes modeFadeOut {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// =======================
// COMPATIBILITY LAYER
// =======================
// Fungsi-fungsi lama untuk backward compatibility
UI.createProfileButton = function() {
    console.warn('⚠️ UI.createProfileButton() deprecated, gunakan UI.Profile.init()');
    UI.Profile.init();
};

UI.updateProfileButton = function() {
    console.warn('⚠️ UI.updateProfileButton() deprecated, gunakan UI.Profile._updateProfileButton()');
    if (UI.Profile && UI.Profile._updateProfileButton) {
        UI.Profile._updateProfileButton();
    }
};

UI.showProfilePanel = function() {
    console.warn('⚠️ UI.showProfilePanel() deprecated, gunakan UI.Profile.open("view")');
    UI.Profile.open('view');
};

UI.hideProfilePanel = function() {
    console.warn('⚠️ UI.hideProfilePanel() deprecated, gunakan UI.Profile.close()');
    UI.Profile.close();
};

UI.saveProfile = function() {
    console.warn('⚠️ UI.saveProfile() deprecated, gunakan UI.Profile.save()');
    UI.Profile.save();
};

UI.showStatus = function(message, type = 'success') {
    console.warn('⚠️ UI.showStatus() deprecated, gunakan UI.Profile._showStatus()');
    if (UI.Profile && UI.Profile._showStatus) {
        UI.Profile._showStatus(message, type);
    }
};

UI.initialize = function() {
    console.warn('⚠️ UI.initialize() deprecated, sistem inisialisasi otomatis');
    // Inisialisasi otomatis dilakukan saat DOM ready
};

// =======================
// AUTO-INITIALIZATION
// =======================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 UI Module v0.5.4 siap digunakan');
        // Profile system akan diinisialisasi oleh UI.afterLogin()
        // ketika user berhasil login melalui Auth system
    });
} else {
    console.log('🚀 UI Module v0.5.4 siap digunakan');
}

console.log('✅ UI Module v0.5.4 [Release] - Berbasis Auth System - Production Ready');
