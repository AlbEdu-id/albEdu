// AlbEdu - AlByte Guard (Level 2)
// Sistem Proteksi Pusat untuk AlbEdu
// Tanggal: ${new Date().toLocaleDateString('id-ID')}

console.log('Memuat AlByte Guard - Sistem Proteksi AlbEdu...');

// =======================
// Variabel global
// =======================
let currentUser = null;
let userRole = null;
let userData = null;

// =======================
// Daftar halaman berdasarkan role
// =======================
const rolePermissions = {
    'admin': ['/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian'],
    'siswa': ['/', '/login', '/siswa', '/ujian']
};

// =======================
// Helper: Base path GitHub Pages
// =======================
function getBasePath() {
    const parts = window.location.pathname.split('/');
    return `/${parts[1]}`;
}

// =======================
// Fungsi utama untuk inisialisasi sistem
// =======================
async function initializeSystem() {
    console.log('Menginisialisasi sistem AlbEdu...');

    try {
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User terautentikasi:', user.email);
                currentUser = user;

                await fetchUserData(user.uid);
                await checkPageAccess();

                if (userRole === 'siswa' && userData && !userData.profilLengkap) {
                    showProfilePopup();
                }
            } else {
                console.log('User belum login');
                currentUser = null;
                userRole = null;
                userData = null;

                if (!isLoginPage()) {
                    redirectToLogin();
                }
            }
        });
    } catch (error) {
        console.error('Error inisialisasi sistem:', error);
        showError('Gagal memuat sistem. Silakan refresh halaman.');
    }
}

// =======================
// Firestore User
// =======================
async function fetchUserData(userId) {
    try {
        console.log('Mengambil data user dari Firestore...');

        const userDoc = await firebaseDb.collection('users').doc(userId).get();

        if (userDoc.exists) {
            userData = userDoc.data();
            userRole = userData.peran || 'siswa';
            console.log(`Role user: ${userRole}, Data:`, userData);
        } else {
            console.log('Data user belum ada, membuat data baru...');
            await createUserData(userId);
            await fetchUserData(userId);
        }
    } catch (error) {
        console.error('Error mengambil data user:', error);
        showError('Gagal mengambil data pengguna.');
    }
}

async function createUserData(userId) {
    try {
        const user = firebaseAuth.currentUser;

        const newUserData = {
            id: userId,
            nama: user.displayName || '',
            email: user.email,
            foto_profil: user.photoURL || `https://github.com/identicons/${user.email}.png`,
            peran: 'siswa',
            profilLengkap: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebaseDb.collection('users').doc(userId).set(newUserData);
        console.log('Data user baru berhasil dibuat');
    } catch (error) {
        console.error('Error membuat data user:', error);
        throw error;
    }
}

// =======================
// Auth
// =======================
async function authLogin() {
    try {
        console.log('Memulai proses login dengan Google (redirect mode)...');

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        await firebaseAuth.signInWithRedirect(provider);
    } catch (error) {
        console.error('Error login:', error);

        let errorMessage = 'Terjadi kesalahan saat login';
        if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Koneksi jaringan terganggu. Periksa koneksi internet Anda.';
        }

        throw new Error(errorMessage);
    }
}

async function authLogout() {
    try {
        await firebaseAuth.signOut();
        console.log('Logout berhasil');
        window.location.href = `${getBasePath()}/login.html`;
    } catch (error) {
        console.error('Error logout:', error);
        showError('Gagal logout. Silakan coba lagi.');
    }
}

// =======================
// Page Access
// =======================
async function checkPageAccess() {
    const currentPath = window.location.pathname.replace('.html', '');
    console.log(`Mengecek akses untuk path: ${currentPath}, Role: ${userRole}`);

    if (!currentUser) {
        if (!isLoginPage()) redirectToLogin();
        return;
    }

    if (isLoginPage()) {
        redirectBasedOnRole();
        return;
    }

    const allowedPaths = rolePermissions[userRole] || [];
    if (!allowedPaths.includes(currentPath)) {
        console.warn(`Akses ditolak: Role ${userRole} tidak diizinkan mengakses ${currentPath}`);
        showAccessDenied();
        return;
    }

    console.log('Akses diizinkan');
}

// =======================
// Redirect Helpers
// =======================
function redirectBasedOnRole() {
    if (!userRole) return;

    const base = getBasePath();
    let target = `${base}/login.html`;

    if (userRole === 'admin') target = `${base}/admin/`;
    if (userRole === 'siswa') target = `${base}/siswa/`;

    setTimeout(() => {
        window.location.href = target;
    }, 1000);
}

function redirectToLogin() {
    window.location.href = `${getBasePath()}/login.html`;
}

function isLoginPage() {
    const path = window.location.pathname;
    return path.includes('login') || path.endsWith('/');
}

// =======================
// Profile Popup (UNCHANGED STYLE)
// =======================
function showProfilePopup() {
    console.log('Menampilkan popup kelengkapan profil...');
    // (isi popup kamu BIARKAN seperti sebelumnya, tidak gue ubah)
}

// =======================
// Error Handling
// =======================
function showAccessDenied() {
    const base = getBasePath();
    if (userRole === 'admin') window.location.href = `${base}/admin/`;
    else if (userRole === 'siswa') window.location.href = `${base}/siswa/`;
    else window.location.href = `${base}/login.html`;
}

function showError(message) {
    let errorDiv = document.getElementById('systemError');

    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'systemError';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(errorDiv);
    }

    errorDiv.textContent = `Error: ${message}`;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// =======================
// BOOTSTRAP (REDIRECT SAFE)
// =======================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (typeof firebaseAuth === 'undefined') {
            console.error('Firebase tidak terinisialisasi dengan benar');
            showError('Sistem autentikasi tidak tersedia. Silakan refresh halaman.');
            return;
        }

        // HANDLE GOOGLE REDIRECT RESULT
        try {
            const result = await firebaseAuth.getRedirectResult();
            if (result && result.user) {
                console.log('Redirect login sukses:', result.user.email);
            }
        } catch (error) {
            console.error('Redirect login error:', error.code, error.message);
            showError('Login Google gagal: ' + error.message);
            return;
        }

        initializeSystem();
    }, 500);
});

// =======================
// Export
// =======================
window.authLogin = authLogin;
window.authLogout = authLogout;
window.checkPageAccess = checkPageAccess;

console.log('AlByte Guard siap melindungi AlbEdu!');
