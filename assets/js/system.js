// ByteWard v0.1.5 - AlbEdu Security & Profile System
// Advanced Security with Real-time Profile Management
// FIXED: GitHub Pages base path handling with explicit configuration

console.log('🚀 Memuat ByteWard v0.1.5 - Sistem Keamanan AlbEdu...');

// =======================  
// Configuration & Constants  
// =======================  
// 🔧 CONFIGURATION: Explicit base path for GitHub Pages
const APP_CONFIG = {
    BASE_PATH: '/AlbEdu', // 🔥 Hard-coded explicit base path
    APP_VERSION: '0.1.5',
    IS_GITHUB_PAGES: true,
    
    // Role-based redirects with base path included
    REDIRECT_PATHS: {
        admin: '/admin/index.html',
        siswa: '/siswa/index.html',
        login: '/login.html',
        logout: '/login.html'
    },
    
    // Asset paths with base path
    ASSETS: {
        profileCSS: '/assets/css/profile.css'
    }
};

// Global State  
let currentUser = null;  
let userRole = null;  
let userData = null;  
let authReady = false;  
let profileListener = null;  
let redirectInProgress = false;

// Avatar constants (unchanged)
const DEFAULT_AVATARS = [  
    {  
        id: 'github',  
        name: 'GitHub Identicon',  
        url: null,
        color: '#1f2937'  
    },  
    {  
        id: 'male1',  
        name: 'Male Avatar',  
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=5b6af0',  
        color: '#5b6af0'  
    },  
    {  
        id: 'female1',  
        name: 'Female Avatar',  
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=9d4edd',  
        color: '#9d4edd'  
    },  
    {  
        id: 'robot',  
        name: 'Robot',  
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=10b981',  
        color: '#10b981'  
    },  
    {  
        id: 'cat',  
        name: 'Cat',  
        url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=cat&backgroundColor=f59e0b',  
        color: '#f59e0b'  
    },  
    {  
        id: 'alien',  
        name: 'Alien',  
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alien&backgroundColor=8b5cf6',  
        color: '#8b5cf6'  
    }  
];  

// 🔧 FIXED: Role whitelist uses absolute paths WITH base path
const ROLE_WHITELIST = {
    admin: [
        APP_CONFIG.BASE_PATH + '/admin/index.html',
        APP_CONFIG.BASE_PATH + '/siswa/index.html',
        APP_CONFIG.BASE_PATH + '/ujian/index.html',
        APP_CONFIG.BASE_PATH + '/login.html'
    ],
    siswa: [
        APP_CONFIG.BASE_PATH + '/siswa/index.html',
        APP_CONFIG.BASE_PATH + '/ujian/index.html',
        APP_CONFIG.BASE_PATH + '/login.html'
    ]
};

// Profile State (unchanged)
let profileState = {  
    isProfileComplete: false,  
    selectedAvatar: null,  
    customAvatar: null,  
    tempName: '',  
    isLoading: false,  
    hasChanges: false,
    autoCloseTriggered: false
};  

// =======================  
// Enhanced Core Utilities  
// =======================  
/**
 * 🔧 FIXED: Returns explicit base path WITHOUT guessing
 * Always returns '/AlbEdu' for GitHub Pages
 * @returns {string} Base path for the application
 */
function getBasePath() {  
    // ✅ Explicit base path - no guessing, no URL parsing
    return APP_CONFIG.BASE_PATH;
}  

/**
 * 🔧 FIXED: Builds full URL with base path
 * @param {string} path - Relative path (e.g., '/siswa/index.html')
 * @returns {string} Full URL with base path
 */
function buildFullPath(path) {
    // Ensure path starts with slash
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    
    // Handle cases where base path might be empty (local development)
    if (!APP_CONFIG.BASE_PATH) {
        return normalizedPath;
    }
    
    // Remove trailing slash from base path if present
    const base = APP_CONFIG.BASE_PATH.endsWith('/') 
        ? APP_CONFIG.BASE_PATH.slice(0, -1) 
        : APP_CONFIG.BASE_PATH;
    
    return base + normalizedPath;
}

/**
 * 🔧 ENHANCED: Check if current page is login page with base path awareness
 * @returns {boolean} True if current page is login page
 */
function isLoginPage() {  
    const currentPath = window.location.pathname;
    const loginPath = buildFullPath(APP_CONFIG.REDIRECT_PATHS.login);
    
    // Direct comparison with full login path
    if (currentPath === loginPath) {
        return true;
    }
    
    // Handle potential trailing slashes
    if (currentPath === loginPath + '/') {
        return true;
    }
    
    // Handle query parameters
    const pathWithoutQuery = currentPath.split('?')[0];
    if (pathWithoutQuery === loginPath || pathWithoutQuery === loginPath + '/') {
        return true;
    }
    
    return false;
}

/**
 * 🔧 ENHANCED: Check if current path is within app scope
 * @returns {boolean} True if current path is within app base path
 */
function isWithinAppScope() {
    const currentPath = window.location.pathname;
    
    // If no base path, everything is within scope
    if (!APP_CONFIG.BASE_PATH) {
        return true;
    }
    
    // Check if current path starts with base path
    return currentPath.startsWith(APP_CONFIG.BASE_PATH);
}

// =======================  
// Enhanced Redirect System  
// =======================  
/**
 * 🔧 FIXED: Redirect based on role with proper base path
 * Uses explicit paths from APP_CONFIG
 */
function redirectBasedOnRole() {
    if (redirectInProgress) {
        console.log('⚠️ Redirect sedang berlangsung, skip untuk hindari loop');
        return;
    }
    
    if (!currentUser || !userRole) {
        console.log('⚠️ Menunggu data user...');
        setTimeout(redirectBasedOnRole, 500);
        return;
    }
    
    redirectInProgress = true;
    
    // Get target path from config
    const targetPath = APP_CONFIG.REDIRECT_PATHS[userRole] || APP_CONFIG.REDIRECT_PATHS.siswa;
    
    // Build full URL with base path
    const targetUrl = buildFullPath(targetPath);
    
    // Anti-loop: Check if already on target page
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl === targetUrl || currentUrl === targetUrl + '/') {
        console.log('✅ Sudah berada di halaman target, skip redirect');
        redirectInProgress = false;
        return;
    }
    
    console.log(`🔄 Smart redirect ${userRole} ke: ${targetUrl}`);
    
    // Add slight delay for better UX
    setTimeout(() => {
        window.location.replace(targetUrl);
        redirectInProgress = false;
    }, 800);
}

/**
 * 🔧 FIXED: Redirect to login with proper base path
 */
function redirectToLogin() {  
    if (redirectInProgress) {
        console.log('⚠️ Redirect sedang berlangsung, skip');
        return;
    }
    
    // Build login URL with base path
    const targetUrl = buildFullPath(APP_CONFIG.REDIRECT_PATHS.login);
    
    // Anti-loop: Check if already on login page
    const currentUrl = window.location.pathname;
    if (currentUrl === targetUrl || currentUrl === targetUrl + '/') {
        console.log('✅ Sudah di login page, skip redirect');
        return;
    }
    
    redirectInProgress = true;
    console.log('🔄 Redirect ke login:', targetUrl);
    
    // Use replace to prevent back navigation
    setTimeout(() => {
        window.location.replace(targetUrl);
        redirectInProgress = false;
    }, 500);
}

/**
 * 🔧 FIXED: Handle logout redirect with base path
 */
function redirectAfterLogout() {
    const targetUrl = buildFullPath(APP_CONFIG.REDIRECT_PATHS.logout);
    window.location.href = targetUrl;
}

// =======================  
// Enhanced Access Control  
// =======================  
/**
 * 🔧 FIXED: Check page access with base path awareness
 * @returns {Promise<boolean>} True if access granted
 */
async function checkPageAccess() {  
    const currentPath = window.location.pathname;
    
    console.log(`🔒 Mengecek akses: ${currentPath} | Role: ${userRole} | Base: ${getBasePath()}`);
    
    // Check if within app scope
    if (APP_CONFIG.BASE_PATH && !isWithinAppScope()) {
        console.log('⚠️ Di luar scope aplikasi, izinkan akses');
        return true;
    }
    
    // Handle unauthenticated users
    if (!currentUser) {  
        if (!isLoginPage()) {
            console.log('👤 User belum login, redirect ke login');
            redirectToLogin();
        }
        return false;
    }  
    
    // Redirect if on login page but already logged in
    if (isLoginPage()) {  
        console.log('📍 Di halaman login, redirect berdasarkan role');
        redirectBasedOnRole();  
        return true;
    }  
    
    // Admin access: Allow all paths within app
    if (userRole === 'admin') {
        console.log('✅ Admin: Akses diizinkan untuk semua halaman');
        return true;
    }
    
    // Student access: Check whitelist
    const allowedPaths = ROLE_WHITELIST[userRole] || [];
    const isAllowed = allowedPaths.some(allowedPath => 
        currentPath === allowedPath || 
        currentPath === allowedPath + '/' ||
        currentPath.startsWith(allowedPath.replace('.html', ''))
    );
    
    if (!isAllowed) {  
        console.warn('⛔ Akses ditolak untuk path:', currentPath);  
        showAccessDenied();
        return false;  
    }  
    
    console.log('✅ Akses diizinkan untuk', currentPath);  
    return true;
}

// =======================  
// Loading System (unchanged)
// =======================  
function showAuthLoading(text = 'Memverifikasi sesi login…') {  
    let el = document.getElementById('loadingIndicator');  
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingIndicator';
        el.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 18px;
            flex-direction: column;
        `;
        el.innerHTML = `
            <div class="spinner" style="
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 20px;
            "></div>
            <p>${text}</p>
        `;
        document.body.appendChild(el);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
      
    el.style.display = 'flex';  
    const p = el.querySelector('p');  
    if (p) p.textContent = text;  
      
    console.log('[BYTEWARD]', text);  
}  

function hideAuthLoading() {  
    const el = document.getElementById('loadingIndicator');  
    if (!el) return;  
    el.style.display = 'none';  
}  

// =======================  
// 404 Page Enhancement
// =======================  
/**
 * 🔧 NEW: Enhanced 404 page handler for GitHub Pages
 * This function should be called from 404.html
 */
function handle404Page() {
    console.log('🔧 Memproses 404 page dengan base path:', getBasePath());
    
    // Get current invalid path
    const invalidPath = window.location.pathname;
    
    // Check if this is actually our app's 404 page
    if (invalidPath === buildFullPath('/404.html')) {
        console.log('✅ Ini adalah halaman 404 yang valid');
        return;
    }
    
    // Check if the path should be within our app scope
    if (invalidPath.startsWith(getBasePath())) {
        console.log(`⚠️ Path ${invalidPath} berada dalam scope aplikasi`);
        
        // Try to redirect to login if not authenticated
        if (!currentUser) {
            console.log('🔄 Redirect ke login dari 404');
            redirectToLogin();
        } else {
            // If authenticated but path not found, redirect to dashboard
            console.log('🔄 Redirect ke dashboard dari 404');
            redirectBasedOnRole();
        }
    } else {
        // Path outside our app scope - show helpful message
        console.log('🌐 Path di luar scope aplikasi');
        const base = getBasePath();
        document.body.innerHTML += `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #fef3c7;
                border: 2px solid #f59e0b;
                border-radius: 8px;
                padding: 15px;
                max-width: 400px;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
            ">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Halaman Tidak Ditemukan</h4>
                <p style="margin: 0 0 10px 0; color: #78350f;">
                    Aplikasi AlbEdu berada di path: <strong>${base}</strong>
                </p>
                <a href="${base}/login.html" 
                   style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">
                    Ke Halaman Login
                </a>
            </div>
        `;
    }
}

// =======================  
// Enhanced CSS Injection with Base Path
// =======================  
function injectProfileCSS() {  
    if (document.querySelector('link[href*="profile.css"]')) return;  
      
    const cssPath = buildFullPath(APP_CONFIG.ASSETS.profileCSS);
    console.log('🎨 Memuat profile CSS dari:', cssPath);
    
    const link = document.createElement('link');  
    link.rel = 'stylesheet';  
    link.href = cssPath;  
    link.id = 'profile-css';  
      
    // Fallback jika CSS gagal dimuat  
    link.onerror = () => {  
        console.warn('Profile CSS gagal dimuat dari:', cssPath);  
        console.warn('Menggunakan inline styles sebagai fallback');  
        injectFallbackCSS();  
    };  
      
    // Success handler
    link.onload = () => {
        console.log('✅ Profile CSS berhasil dimuat');
    };
      
    document.head.appendChild(link);  
}  

function injectFallbackCSS() {  
    const style = document.createElement('style');  
    style.textContent = `  
        .profile-button-container { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
        }  
        .profile-button { 
            width: 56px; 
            height: 56px; 
            border-radius: 50%; 
            background: #333; 
            border: none; 
            cursor: pointer;
            position: relative;
            overflow: hidden;
            padding: 0;
        }  
        .profile-button img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .profile-indicator { 
            position: absolute; 
            top: -5px; 
            right: -5px; 
            width: 20px; 
            height: 20px; 
            background: #ef4444; 
            border-radius: 50%; 
            color: white;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .profile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .profile-overlay.active {
            display: flex;
        }
        .profile-panel {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s ease;
        }
        .profile-panel.active {
            transform: translateY(0);
            opacity: 1;
        }
    `;  
    document.head.appendChild(style);  
}  

// =======================  
// Authentication Functions (updated for base path)
// =======================  
async function authLogin() {  
    try {  
        console.log('🔐 Memulai login Google...');  
        showAuthLoading('Membuka Google Login…');  
          
        const provider = new firebase.auth.GoogleAuthProvider();  
        provider.addScope('profile');  
        provider.addScope('email');  
          
        const result = await firebaseAuth.signInWithPopup(provider);  
          
        console.log('✅ Login sukses:', result.user.email);  
        showAuthLoading('Login berhasil, menyiapkan sistem…');  
          
        return result.user;
    } catch (error) {  
        console.error('❌ Error login:', error);  
        hideAuthLoading();  
        throw new Error(error.message || 'Login Google gagal');  
    }  
}  

async function authLogout() {  
    try {  
        showAuthLoading('Logout…');  
          
        // Cleanup  
        if (profileListener) {  
            profileListener();  
            profileListener = null;  
        }  
          
        await firebaseAuth.signOut();  
        console.log('✅ Logout berhasil');  
          
        // Remove profile UI  
        const profileContainer = document.querySelector('.profile-button-container');  
        if (profileContainer) profileContainer.remove();  
          
        const profilePanel = document.getElementById('profileOverlay');  
        if (profilePanel) profilePanel.remove();  
          
        // Redirect to login with proper base path
        redirectAfterLogout();
    } catch (error) {  
        console.error('❌ Error logout:', error);  
        showError('Gagal logout.');  
    }  
}  

// =======================  
// Hard Block Access Denied (updated)
// =======================  
function showAccessDenied() {  
    console.log('🛑 Hard block: Menampilkan Error 405');
    
    const base = getBasePath();
    const dashboardPath = buildFullPath('/siswa/index.html');
    
    // Generate HTML error dinamis
    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: system-ui, -apple-system, sans-serif;
            color: #dc2626;
            text-align: center;
            padding: 20px;
            z-index: 99999;
        ">
            <h1 style="font-size: 48px; margin: 0;">405</h1>
            <h2 style="font-size: 24px; margin: 10px 0;">Access Denied</h2>
            <p style="font-size: 16px; max-width: 400px; color: #4b5563;">
                Anda tidak memiliki izin untuk mengakses halaman ini. 
                Silakan kembali ke dashboard atau hubungi administrator.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                Base Path: <code>${base}</code><br>
                Current Path: <code>${window.location.pathname}</code>
            </p>
            <a href="${dashboardPath}" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #2563eb;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            ">Kembali ke Dashboard</a>
        </div>
    `;
    
    // Hentikan semua script lain
    document.querySelectorAll('script').forEach(script => {
        if (!script.src.includes('ByteWard')) {
            script.remove();
        }
    });
}  

// =======================  
// System Initialization with Base Path Awareness
// =======================  
async function initializeSystem() {  
    console.log('⚙️ Menginisialisasi ByteWard v0.1.5...');  
    console.log('📍 Konfigurasi:', APP_CONFIG);
    console.log('📍 Base Path:', getBasePath());
    console.log('📍 Current Path:', window.location.pathname);
    console.log('📍 Is Login Page:', isLoginPage());
    console.log('📍 Within App Scope:', isWithinAppScope());
    
    // Check Firebase availability
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase tidak tersedia');
        showError('Firebase belum dimuat. Silakan refresh halaman.');
        hideAuthLoading();
        return;
    }
    
    // Check if we're on 404 page
    if (window.location.pathname.includes('404') || document.title.includes('404')) {
        console.log('🔧 Deteksi halaman 404, memanggil handler...');
        handle404Page();
    }
    
    showAuthLoading('Mengecek status autentikasi…');  
      
    // Inject profile CSS dengan base path
    injectProfileCSS();  
      
    firebaseAuth.onAuthStateChanged(async (user) => {  
        try {  
            if (user) {  
                console.log('👤 User terautentikasi:', user.email);  
                currentUser = user;  
                  
                showAuthLoading('Mengambil data pengguna…');  
                await fetchUserData(user.uid);  
                  
                showAuthLoading('Memverifikasi akses halaman…');  
                const accessGranted = await checkPageAccess();  
                  
                // Create profile button jika bukan halaman login dan akses granted  
                if (!isLoginPage() && accessGranted) {  
                    createProfileButton();  
                }  
                  
                authReady = true;  
                hideAuthLoading();  
                  
            } else {  
                console.log('👤 User belum login');  
                currentUser = null;  
                userRole = null;  
                userData = null;  
                authReady = true;  
                hideAuthLoading();  
                  
                if (!isLoginPage() && isWithinAppScope()) {
                    redirectToLogin();  
                }
            }  
        } catch (err) {  
            console.error('❌ Auth flow error:', err);  
            hideAuthLoading();  
            showError('Terjadi kesalahan sistem autentikasi');  
        } finally {
            redirectInProgress = false;
        }
    });  
}  

// =======================  
// Debug & Testing (Enhanced)
// =======================  
window.debugByteWard = function() {
    console.log('=== ByteWard Debug Info v0.1.5 ===');
    console.log('Configuration:', APP_CONFIG);
    console.log('Base Path Function:', getBasePath());
    console.log('Full Login Path:', buildFullPath(APP_CONFIG.REDIRECT_PATHS.login));
    console.log('Current User:', currentUser);
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('Profile Complete:', profileState.isProfileComplete);
    console.log('Current Path:', window.location.pathname);
    console.log('Is Login Page:', isLoginPage());
    console.log('Within App Scope:', isWithinAppScope());
    console.log('Auth Ready:', authReady);
    console.log('Redirect in Progress:', redirectInProgress);
    console.log('==========================');
};

// =======================  
// Bootstrap System  
// =======================  
document.addEventListener('DOMContentLoaded', () => {  
    setTimeout(() => {  
        if (typeof firebaseAuth === 'undefined') {  
            console.error('❌ Firebase belum siap');  
            showError('Firebase tidak tersedia');  
            return;  
        }  
          
        initializeSystem();  
    }, 300);  
});  

// =======================  
// Global Exports  
// =======================  
window.authLogin = authLogin;  
window.authLogout = authLogout;  
window.checkPageAccess = checkPageAccess;  
window.showProfilePanel = showProfilePanel;  
window.debugByteWard = debugByteWard;
window.getBasePath = getBasePath; // Export untuk debugging
window.buildFullPath = buildFullPath; // Export untuk testing

console.log('🛡️ ByteWard v0.1.5 AKTIF. Sistem keamanan dengan base path terkelola.');
