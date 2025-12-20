// =====================================================
// AlbEdu - AlByte Guard v3.0 (STABIL FINAL)
// Anti Infinite Loop • Auth Aman • Profil Realtime
// Semua log & debug: BAHASA INDONESIA
// =====================================================

console.log('[SYSTEM] AlByte Guard dimuat');

// =====================================================
// GLOBAL STATE
// =====================================================
let currentUser = null;
let userRole = null;
let userData = null;

let authInitialized = false;
let authResolved = false;

// =====================================================
// ROLE PERMISSIONS (JANGAN DIUBAH)
// =====================================================
const rolePermissions = {
    admin: ['/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian'],
    siswa: ['/', '/login', '/siswa', '/ujian']
};

// =====================================================
// PATH UTILS
// =====================================================
function getBasePath() {
    const parts = window.location.pathname.split('/');
    return `/${parts[1]}`;
}

function isLoginPage() {
    return window.location.pathname.endsWith('/login.html');
}

// =====================================================
// SYSTEM INIT
// =====================================================
function initializeSystem() {
    if (authInitialized) {
        console.warn('[SYSTEM] Inisialisasi sudah pernah dijalankan, dibatalkan');
        return;
    }

    authInitialized = true;
    console.log('[SYSTEM] Memulai inisialisasi autentikasi');

    firebaseAuth.onAuthStateChanged(async (user) => {
        if (authResolved) {
            console.warn('[AUTH] Status auth sudah diproses, abaikan');
            return;
        }

        authResolved = true;

        try {
            if (user) {
                console.log('[AUTH] Pengguna terdeteksi login:', user.email);
                currentUser = user;

                await fetchUserData(user.uid);
                listenUserRealtime(user.uid);

                await safeCheckAccess();

                if (userRole === 'siswa') {
                    injectProfileUI();
                }

                console.log('[SYSTEM] Autentikasi & halaman siap');

            } else {
                console.log('[AUTH] Tidak ada pengguna login');

                if (!isLoginPage()) {
                    console.warn('[REDIRECT] Arahkan ke halaman login');
                    location.replace(`${getBasePath()}/login.html`);
                }
            }
        } catch (err) {
            console.error('[SYSTEM ERROR]', err);
            alert('Terjadi kesalahan sistem. Silakan refresh halaman.');
        }
    });
}

// =====================================================
// FIRESTORE USER
// =====================================================
async function fetchUserData(uid) {
    console.log('[FIRESTORE] Mengambil data pengguna');

    const ref = firebaseDb.collection('users').doc(uid);
    const snap = await ref.get();

    if (snap.exists) {
        userData = snap.data();
        userRole = userData.peran || 'siswa';
        console.log('[FIRESTORE] Data pengguna ditemukan:', userRole);
    } else {
        console.warn('[FIRESTORE] Data belum ada, membuat data baru');
        await createUserData(uid);
        await fetchUserData(uid);
    }
}

// =====================================================
// DATA RANDOM (INDONESIA, EDUKATIF)
// =====================================================
const namaAcak = [
    'Siswa Cerdas',
    'Pelajar Nusantara',
    'Generasi Emas',
    'Siswa Berprestasi',
    'Pelajar Hebat Indonesia'
];

const avatarBawaan = Array.from({ length: 20 }).map(
    (_, i) => `https://github.com/identicons/albedu-${i}.png`
);

function pilihAvatarSekali(seed) {
    let total = 0;
    for (let i = 0; i < seed.length; i++) {
        total += seed.charCodeAt(i);
    }
    return avatarBawaan[total % avatarBawaan.length];
}

// =====================================================
// CREATE USER (HANYA SEKALI SEUMUR AKUN)
// =====================================================
async function createUserData(uid) {
    const user = firebaseAuth.currentUser;

    const payload = {
        id: uid,
        nama: namaAcak[Math.floor(Math.random() * namaAcak.length)],
        foto_profil: pilihAvatarSekali(user.email),
        peran: 'siswa',
        profilLengkap: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebaseDb.collection('users').doc(uid).set(payload);
    console.log('[FIRESTORE] Data pengguna baru dibuat');
}

// =====================================================
// REALTIME LISTENER
// =====================================================
function listenUserRealtime(uid) {
    console.log('[FIRESTORE] Listener realtime diaktifkan');

    firebaseDb.collection('users').doc(uid)
        .onSnapshot((doc) => {
            if (!doc.exists) return;

            userData = doc.data();
            console.log('[REALTIME] Data profil diperbarui');
            updateProfileUI();
        });
}

// =====================================================
// ACCESS CONTROL (ANTI LOOP TOTAL)
// =====================================================
async function safeCheckAccess() {
    const path = window.location.pathname.replace('.html', '');
    const allowed = rolePermissions[userRole] || [];

    console.log('[ACCESS] Cek akses:', path, 'Role:', userRole);

    if (!allowed.includes(path)) {
        const base = getBasePath();
        const target =
            userRole === 'admin'
                ? `${base}/admin/`
                : `${base}/siswa/`;

        console.warn('[ACCESS] Akses ditolak, redirect ke:', target);
        location.replace(target);
    } else {
        console.log('[ACCESS] Akses diizinkan');
    }
}

// =====================================================
// AUTH
// =====================================================
async function authLogin() {
    console.log('[AUTH] Memulai login Google');
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebaseAuth.signInWithPopup(provider);
}

async function authLogout() {
    console.log('[AUTH] Logout pengguna');
    await firebaseAuth.signOut();
    location.replace(`${getBasePath()}/login.html`);
}

// =====================================================
// PROFILE UI (HTML DIBUAT OLEH JS)
// =====================================================
function injectProfileUI() {
    if (document.getElementById('profileMorph')) {
        console.warn('[PROFILE] UI profil sudah ada');
        return;
    }

    console.log('[PROFILE] Menyuntikkan UI profil');

    const container = document.createElement('div');
    container.innerHTML = `
        <div id="profileMorph" class="morph-ui">
            <div class="toggle-icon">
                <img id="profileAvatar" alt="Avatar">
                <span id="profileAlert">!</span>
            </div>

            <div class="content-layer">
                <div class="anim-item">
                    <img id="profileAvatarBig" class="avatar-lg">
                </div>

                <div class="anim-item">
                    <h3 id="profileName"></h3>
                    <p class="hint-text">Profil Siswa AlbEdu</p>
                </div>

                <div class="anim-item">
                    <button onclick="openAvatarPicker()">Ganti Foto Profil</button>
                </div>

                <div class="close-trigger" onclick="toggleProfile()">✕</div>
            </div>
        </div>
    `;

    document.body.appendChild(container);
    updateProfileUI();

    document
        .getElementById('profileMorph')
        .addEventListener('click', toggleProfile);
}

// =====================================================
// UPDATE PROFILE UI
// =====================================================
function updateProfileUI() {
    if (!userData) return;

    const small = document.getElementById('profileAvatar');
    const big = document.getElementById('profileAvatarBig');
    const name = document.getElementById('profileName');
    const alert = document.getElementById('profileAlert');

    if (!small) return;

    small.src = userData.foto_profil;
    big.src = userData.foto_profil;
    name.textContent = userData.nama;

    alert.style.display = userData.profilLengkap ? 'none' : 'flex';
}

// =====================================================
// PROFILE INTERACTION
// =====================================================
function toggleProfile(e) {
    if (e) e.stopPropagation();
    document.getElementById('profileMorph').classList.toggle('active');
}

// =====================================================
// AVATAR PICKER (10 + MUAT LEBIH BANYAK)
// =====================================================
function openAvatarPicker() {
    console.log('[PROFILE] Membuka pemilih avatar');

    const picker = document.createElement('div');
    picker.className = 'avatar-picker';

    avatarBawaan.slice(0, 10).forEach((url) => {
        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => updateProfile(url);
        picker.appendChild(img);
    });

    const more = document.createElement('button');
    more.textContent = 'Muat lebih banyak...';
    more.onclick = () => {
        avatarBawaan.slice(10).forEach((url) => {
            const img = document.createElement('img');
            img.src = url;
            img.onclick = () => updateProfile(url);
            picker.appendChild(img);
        });
        more.remove();
    };

    picker.appendChild(more);
    document.body.appendChild(picker);
}

// =====================================================
// UPDATE PROFILE DATA
// =====================================================
function updateProfile(photoUrl) {
    console.log('[PROFILE] Memperbarui foto profil');

    firebaseDb.collection('users').doc(currentUser.uid).update({
        foto_profil: photoUrl,
        profilLengkap: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// =====================================================
// BOOTSTRAP
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SYSTEM] DOM siap, sistem dimulai');
    initializeSystem();
});

// =====================================================
// EXPORT
// =====================================================
window.authLogin = authLogin;
window.authLogout = authLogout;
