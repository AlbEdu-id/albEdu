// ByteWard Auth Module v0.1.5
    
console.log('🔐 Memuat Auth Module...');    
    
// Global State      
let currentUser = null;      
let userRole = null;      
let userData = null;      
let authReady = false;      
let profileListener = null;      
let redirectInProgress = false;    
    
// =======================      
// Profile Completeness Check    
// =======================      
function checkProfileCompleteness(data) {      
    if (!data) return false;      
          
    const hasName = data.nama && data.nama.trim().length > 0;      
    const hasAvatar = data.foto_profil && data.foto_profil.trim().length > 0;      
          
    return hasName && hasAvatar;      
}      
    
function generateGitHubAvatar(email) {      
    const hash = email.split('').reduce((acc, char) => {      
        return char.charCodeAt(0) + ((acc << 5) - acc);      
    }, 0);      
    return `https://github.com/identicons/${Math.abs(hash)}.png`;      
}      
    
// =======================      
// User Data Management    
// =======================      
async function fetchUserData(userId) {      
    console.log('📡 Mengambil data user dari Firestore...');      
          
    // FIX: Return promise that resolves once with initial data    
    return new Promise((resolve, reject) => {    
        // Clean up previous listener    
        if (profileListener) {      
            profileListener();      
            profileListener = null;      
        }      
              
        const ref = firebaseDb.collection('users').doc(userId);      
            
        let resolved = false;    
            
        profileListener = ref.onSnapshot(async (snap) => {      
            try {      
                if (snap.exists) {      
                    userData = snap.data();      
                    userRole = userData.peran || 'siswa';      
                          
                    // Check profile completeness      
                    if (window.UI) {    
                        window.UI.profileState.isProfileComplete = checkProfileCompleteness(userData);      
                    }    
                          
                    console.log('✅ Data user diperbarui:', {       
                        role: userRole,       
                        name: userData.nama,      
                        profileComplete: window.UI?.profileState?.isProfileComplete       
                    });      
                          
                    // Resolve promise only on first load    
                    if (!resolved) {    
                        resolved = true;    
                        resolve(userData);    
                    }    
                          
                    // Update UI if user is logged in      
                    if (currentUser && window.UI) {      
                        window.UI.updateProfileButton();      
                              
                        // Update panel if it's open      
                        if (document.getElementById('profilePanel')) {      
                            const currentAvatar = document.querySelector('.current-avatar');      
                            const currentName = document.querySelector('.current-name');      
                                  
                            if (currentAvatar) {      
                                currentAvatar.src = userData.foto_profil || generateGitHubAvatar(currentUser.email);      
                            }      
                            if (currentName) {      
                                currentName.textContent = userData.nama || 'Nama belum diisi';      
                            }      
                        }      
                    }      
                          
                } else {      
                    console.log('📝 Data user belum ada, membuat data baru...');      
                    const newData = await createUserData(userId);      
                    if (!resolved) {    
                        resolved = true;    
                        resolve(newData);    
                    }    
                }      
            } catch (error) {      
                console.error('Error in user data listener:', error);      
                if (!resolved) {    
                    reject(error);    
                }    
            }      
        }, (error) => {      
            console.error('Firestore listener error:', error);      
            if (!resolved) {    
                reject(error);    
            }    
        });      
    });    
}      
    
async function createUserData(userId) {      
    const user = firebaseAuth.currentUser;      
          
    const payload = {      
        id: userId,      
        nama: user.displayName || '',      
        email: user.email,      
        foto_profil: generateGitHubAvatar(user.email),      
        peran: 'siswa',      
        profilLengkap: false,      
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),      
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()      
    };      
          
    await firebaseDb.collection('users').doc(userId).set(payload);      
    console.log('✅ Data user baru berhasil dibuat');      
    return payload;    
}      
    
// =======================      
// Authentication Functions    
// =======================      
async function authLogin() {      
    try {      
        console.log('🔐 Memulai login Google...');      
        if (window.UI) window.UI.showAuthLoading('Membuka Google Login…');      
              
        const provider = new firebase.auth.GoogleAuthProvider();      
        provider.addScope('profile');      
        provider.addScope('email');      
              
        const result = await firebaseAuth.signInWithPopup(provider);      
              
        console.log('✅ Login sukses:', result.user.email);      
        if (window.UI) window.UI.showAuthLoading('Login berhasil, menyiapkan sistem…');      
              
        return result.user;    
    } catch (error) {      
        console.error('❌ Error login:', error);      
        if (window.UI) window.UI.hideAuthLoading();      
        throw new Error(error.message || 'Login Google gagal');      
    }      
}      
    
async function authLogout() {      
    try {      
        if (window.UI) window.UI.showAuthLoading('Logout…');      
              
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
        if (window.ByteWard) window.ByteWard.redirectAfterLogout();    
    } catch (error) {      
        console.error('❌ Error logout:', error);      
        if (window.UI) window.UI.showError('Gagal logout.');      
    }      
}      
    
// =======================      
// System Initialization    
// =======================      
async function initializeSystem() {      
    console.log('⚙️ Menginisialisasi ByteWard v0.1.5...');      
    console.log('📍 Konfigurasi:', window.ByteWard?.APP_CONFIG);    
    console.log('📍 Base Path:', window.ByteWard?.getBasePath());    
    console.log('📍 Current Path:', window.location.pathname);    
    console.log('📍 Is Login Page:', window.ByteWard?.isLoginPage());    
    console.log('📍 Within App Scope:', window.ByteWard?.isWithinAppScope());    
        
    // Check Firebase availability    
    if (typeof firebase === 'undefined' || !firebase.auth) {    
        console.error('❌ Firebase tidak tersedia');    
        if (window.UI) window.UI.showError('Firebase belum dimuat. Silakan refresh halaman.');    
        if (window.UI) window.UI.hideAuthLoading();    
        return;    
    }    
        
    // Check if we're on 404 page    
    if (window.location.pathname.includes('404') || document.title.includes('404')) {    
        console.log('🔧 Deteksi halaman 404, memanggil handler...');    
        if (window.ByteWard) window.ByteWard.handle404Page();    
    }    
        
    if (window.UI) window.UI.showAuthLoading('Mengecek status autentikasi…');      
          
    // Inject profile CSS dengan base path    
    if (window.UI) window.UI.injectProfileCSS();      
          
    firebaseAuth.onAuthStateChanged(async (user) => {      
        try {      
            if (user) {      
                console.log('👤 User terautentikasi:', user.email);      
                currentUser = user;      
                      
                if (window.UI) window.UI.showAuthLoading('Mengambil data pengguna…');      
                await fetchUserData(user.uid);      
                      
                if (window.UI) window.UI.showAuthLoading('Memverifikasi akses halaman…');      
                const accessGranted = await window.ByteWard?.checkPageAccess();      
                      
                // Create profile button jika bukan halaman login dan akses granted      
                if (window.ByteWard && !window.ByteWard.isLoginPage() && accessGranted && window.UI) {      
                    window.UI.createProfileButton();      
                }      
                      
                authReady = true;      
                if (window.UI) window.UI.hideAuthLoading();      
                      
            } else {      
                console.log('👤 User belum login');      
                currentUser = null;      
                userRole = null;      
                userData = null;      
                authReady = true;      
                if (window.UI) window.UI.hideAuthLoading();      
                      
                if (window.ByteWard && !window.ByteWard.isLoginPage() && window.ByteWard.isWithinAppScope()) {    
                    window.ByteWard.redirectToLogin();      
                }    
            }      
        } catch (err) {      
            console.error('❌ Auth flow error:', err);      
            if (window.UI) window.UI.hideAuthLoading();      
            if (window.UI) window.UI.showError('Terjadi kesalahan sistem autentikasi');      
        } finally {    
            redirectInProgress = false;    
        }    
    });      
}      
    
// =======================      
// Bootstrap System      
// =======================      
document.addEventListener('DOMContentLoaded', () => {      
    setTimeout(() => {      
        if (typeof firebaseAuth === 'undefined') {      
            console.error('❌ Firebase belum siap');      
            if (window.UI) window.UI.showError('Firebase tidak tersedia');      
            return;      
        }      
              
        initializeSystem();      
    }, 300);      
});      
    
// =======================      
// Global Exports      
// =======================      
window.Auth = {    
    currentUser,    
    userRole,    
    userData,    
    authReady,    
    profileListener,    
    redirectInProgress,    
    checkProfileCompleteness,    
    generateGitHubAvatar,    
    fetchUserData,    
    createUserData,    
    authLogin,    
    authLogout,    
    initializeSystem    
};    
