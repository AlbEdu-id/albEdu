// =========================================
// AlbEdu - AlByte Guard v2.5 (FINAL)
// Auth Stabil • Anti Loop • Profile Morph UI
// =========================================

console.log('🔥 AlByte Guard v2.5 aktif');

// =======================
// GLOBAL STATE
// =======================
let currentUser = null;
let userRole = null;
let userData = null;
let authReady = false;
let hasRedirected = false;

// =======================
// PERMISSIONS (JANGAN DIUBAH)
// =======================
const rolePermissions = {
    admin: ['/', '/login', '/admin', '/admin/creates', '/admin/panel', '/ujian'],
    siswa: ['/', '/login', '/siswa', '/ujian']
};

// =======================
// PATH UTILS
// =======================
function getBasePath() {
    const parts = window.location.pathname.split('/');
    return `/${parts[1]}`;
}

function isLoginPage() {
    return window.location.pathname.endsWith('/login.html');
}

// =======================
// LOADING
// =======================
function showAuthLoading(text = 'Memverifikasi sesi…') {
    const el = document.getElementById('loadingIndicator');
    if (!el) return;
    el.style.display = 'flex';
    el.querySelector('p').textContent = text;
}

function hideAuthLoading() {
    const el = document.getElementById('loadingIndicator');
    if (el) el.style.display = 'none';
}

// =======================
// INIT SYSTEM
// =======================
async function initializeSystem() {
    showAuthLoading('Mengecek autentikasi…');

    firebaseAuth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                currentUser = user;
                showAuthLoading('Memuat data pengguna…');

                await fetchUserData(user.uid);
                listenUserRealtime(user.uid);

                await checkPageAccess();

                authReady = true;
                hideAuthLoading();

                if (userRole === 'siswa') {
                    injectProfileUI();
                }

            } else {
                currentUser = null;
                userRole = null;
                userData = null;
                authReady = true;
                hideAuthLoading();

                if (!isLoginPage() && !hasRedirected) {
                    hasRedirected = true;
                    redirectToLogin();
                }
            }
        } catch (err) {
            console.error(err);
            hideAuthLoading();
            showError('Kesalahan sistem autentikasi');
        }
    });
}

// =======================
// FIRESTORE USER
// =======================
async function fetchUserData(uid) {
    const ref = firebaseDb.collection('users').doc(uid);
    const snap = await ref.get();

    if (snap.exists) {
        userData = snap.data();
        userRole = userData.peran || 'siswa';
    } else {
        await createUserData(uid);
        await fetchUserData(uid);
    }
}

// =======================
// RANDOM DATA GENERATOR (INDONESIA)
// =======================
const randomNames = [
    'Siswa Cerdas', 'Pelajar Nusantara', 'Anak Bangsa',
    'Siswa Hebat', 'Pelajar Pintar', 'Generasi Emas'
];

const defaultAvatars = Array.from({ length: 20 }).map(
    (_, i) => `https://github.com/identicons/avatar-${i}.png`
);

function pickRandomOnce(seed) {
    return defaultAvatars[
        Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % defaultAvatars.length
    ];
}

// =======================
// CREATE USER (ONCE)
// =======================
async function createUserData(uid) {
    const user = firebaseAuth.currentUser;
    const avatar = pickRandomOnce(user.email);

    const payload = {
        id: uid,
        nama: randomNames[Math.floor(Math.random() * randomNames.length)],
        foto_profil: avatar,
        peran: 'siswa',
        profilLengkap: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebaseDb.collection('users').doc(uid).set(payload);
}

// =======================
// REALTIME LISTENER
// =======================
function listenUserRealtime(uid) {
    firebaseDb.collection('users').doc(uid)
        .onSnapshot((doc) => {
            if (!doc.exists) return;
            userData = doc.data();
            updateProfileUI();
        });
}

// =======================
// ACCESS CONTROL (ANTI LOOP)
// =======================
async function checkPageAccess() {
    const path = window.location.pathname.replace('.html', '');

    if (!currentUser) return;

    if (isLoginPage() && !hasRedirected) {
        hasRedirected = true;
        redirectBasedOnRole();
        return;
    }

    const allowed = rolePermissions[userRole] || [];
    if (!allowed.includes(path)) {
        showAccessDenied();
    }
}

// =======================
// REDIRECT
// =======================
function redirectBasedOnRole() {
    const base = getBasePath();
    if (userRole === 'admin') location.href = `${base}/admin/`;
    else location.href = `${base}/siswa/`;
}

function redirectToLogin() {
    location.href = `${getBasePath()}/login.html`;
}

// =======================
// AUTH
// =======================
async function authLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebaseAuth.signInWithPopup(provider);
}

async function authLogout() {
    await firebaseAuth.signOut();
    redirectToLogin();
}

// =======================
// PROFILE UI (HTML VIA JS)
// =======================
function injectProfileUI() {
    if (document.getElementById('profileMorph')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${getBasePath()}/assets/css/profile.css`;
    document.head.appendChild(link);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div id="profileMorph" class="morph-ui">
            <div class="toggle-icon">
                <img id="profileAvatar" />
                <span id="profileAlert">!</span>
            </div>

            <div class="content-layer">
                <div class="anim-item">
                    <img id="profileAvatarBig" class="avatar-lg"/>
                </div>

                <div class="anim-item">
                    <h3 id="profileName"></h3>
                    <p class="hint-text">Profil siswa AlbEdu</p>
                </div>

                <div class="anim-item">
                    <button onclick="openAvatarPicker()">Ganti Foto</button>
                </div>

                <div class="close-trigger" onclick="toggleProfile()">✕</div>
            </div>
        </div>
    `;

    document.body.appendChild(wrapper);
    updateProfileUI();

    document.getElementById('profileMorph')
        .addEventListener('click', toggleProfile);
}

// =======================
// PROFILE UI UPDATE
// =======================
function updateProfileUI() {
    if (!userData) return;

    document.getElementById('profileAvatar').src = userData.foto_profil;
    document.getElementById('profileAvatarBig').src = userData.foto_profil;
    document.getElementById('profileName').textContent = userData.nama;

    document.getElementById('profileAlert')
        .style.display = userData.profilLengkap ? 'none' : 'flex';
}

// =======================
// PROFILE INTERACTION
// =======================
function toggleProfile(e) {
    if (e) e.stopPropagation();
    document.getElementById('profileMorph')
        .classList.toggle('active');
}

// =======================
// AVATAR PICKER
// =======================
function openAvatarPicker() {
    const picker = document.createElement('div');
    picker.className = 'avatar-picker';

    defaultAvatars.slice(0, 10).forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => updateProfile(url);
        picker.appendChild(img);
    });

    const more = document.createElement('button');
    more.textContent = 'Muat lebih banyak…';
    more.onclick = () => {
        defaultAvatars.slice(10).forEach(url => {
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

// =======================
// UPDATE PROFILE
// =======================
function updateProfile(photo) {
    firebaseDb.collection('users').doc(currentUser.uid).update({
        foto_profil: photo,
        profilLengkap: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// =======================
// ERROR UI
// =======================
function showAccessDenied() {
    redirectBasedOnRole();
}

function showError(msg) {
    alert(msg);
}

// =======================
// BOOT
// =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeSystem();
});

// =======================
// EXPORT
// =======================
window.authLogin = authLogin;
window.authLogout = authLogout;
