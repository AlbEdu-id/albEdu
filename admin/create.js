// create.js - Sidebar Animation SUPER "NIAT" dengan CASCADE OVERLAP
document.addEventListener('DOMContentLoaded', function() {
    
  /* =======================  
     DOM ELEMENTS  
  ======================= */  
  const menuItems = document.querySelectorAll('.menu-item');  
  const tabContents = document.querySelectorAll('.tab-content');  
  const pageTitle = document.getElementById('page-title');  
  const menuToggle = document.getElementById('menu-toggle');  
  const sidebar = document.querySelector('.sidebar');  
  const notificationBtn = document.querySelector('.notification-btn');  
  const logoutBtn = document.getElementById('logout-btn-header'); // Diubah ID  
  const badge = document.querySelector('.badge');  
    
  // SIDEBAR ITEMS (semua: logo, menu, user profile)  
  const sidebarItems = document.querySelectorAll('.sidebar-item');  
  const logoIcon = document.querySelector('.logo i');  
  const logoText = document.querySelector('.logo h2');  
    
  // State untuk animasi  
  let isAnimating = false;  
  let animationTimeouts = [];  
  let currentAnimationId = 0;  
    
  /* =======================  
     TAB TITLE MAPPING  
  ======================= */  
  const tabTitles = {  
    'profil': 'Profil Admin',  
    'buat-ujian': 'Buat Ujian',  
    'data-hasil': 'Data Hasil Siswa',  
    'ujian-siswa': 'Ujian Siswa'  
  };  
    
  /* =======================  
     PREVENT PROFILE BUTTON IN ADMIN PAGE  
  ======================= */  
  if (window.UI && window.UI.Profile) {
      const originalInit = window.UI.Profile.init;
      window.UI.Profile.init = function() {
          console.log('🚫 Profil tombol dinonaktifkan untuk halaman admin');
          return Promise.resolve();
      };
  }
    
  /* =======================  
     TAB SWITCH - DIPERBAIKI  
  ======================= */  
  function switchTab(tabId) {  
    window.location.hash = tabId;  
    pageTitle.textContent = tabTitles[tabId] || 'Dashboard';  
    
    // RESET SEMUA ACTIVE STATES
    menuItems.forEach(item => {
        item.classList.remove('active');
        // Reset transform dan hover effects
        item.style.transform = '';
        item.style.background = '';
        item.style.boxShadow = '';
        item.style.borderLeft = '';
    });
    
    // Reset user profile jika ada active state
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.classList.remove('active');
        userProfile.style.transform = '';
        userProfile.style.background = '';
        userProfile.style.boxShadow = '';
        
        // Reset ke state normal
        setTimeout(() => {
            userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
        }, 10);
    }
    
    tabContents.forEach(content => content.classList.remove('active'));  
      
    const activeMenuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);  
    const activeTabContent = document.getElementById(tabId);  
      
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        // Force reflow untuk memastikan transition berjalan
        void activeMenuItem.offsetWidth;
    }
    
    if (activeTabContent) activeTabContent.classList.add('active');  
    
    // Initialize admin profile if profil tab is active
    if (tabId === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 300);
    }
  }
    
  /* =======================  
     RESET SEMUA HOVER STATES  
  ======================= */  
  function resetAllHoverStates() {
    menuItems.forEach(item => {
        // Reset inline styles
        item.style.transform = '';
        item.style.background = '';
        item.style.boxShadow = '';
        item.style.borderLeft = '';
        
        // Force reflow
        void item.offsetWidth;
    });
    
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.style.transform = '';
        userProfile.style.background = '';
        userProfile.style.boxShadow = '';
        
        // Reset ke state normal
        setTimeout(() => {
            userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
        }, 10);
    }
  }
    
  /* =======================  
     ANIMASI SIDEBAR CASCADE OVERLAP  
  ======================= */  
    
  // RESET SEMUA ANIMASI  
  function resetAllAnimations() {  
    // Hentikan semua timeout yang berjalan  
    animationTimeouts.forEach(timeout => clearTimeout(timeout));  
    animationTimeouts = [];  
      
    isAnimating = false;  
    currentAnimationId++;  
      
    // Reset semua elemen  
    [logoIcon, logoText].forEach(el => {  
      if (el) el.classList.remove('show');  
    });  
      
    sidebarItems.forEach(item => {  
      item.classList.remove('show');  
        
      const icon = item.querySelector('.sidebar-icon');  
      const text = item.querySelector('.sidebar-text');  
        
      if (icon) icon.classList.remove('show');  
      if (text) text.classList.remove('show');  
    });  
  }  
    
  // ANIMASI MASUK DENGAN TIMING OVERLAP  
  function animateSidebarSuperNiat() {  
    // Hentikan animasi sebelumnya  
    resetAllAnimations();  
      
    const animationId = ++currentAnimationId;  
    isAnimating = true;  
      
    // Logo pertama (ikon + teks overlap)  
    if (logoIcon) {  
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId !== animationId) return;  
            logoIcon.classList.add('show');  
        }, 50)); // Start immediately  
    }  
      
    if (logoText) {  
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId !== animationId) return;  
            logoText.classList.add('show');  
        }, 100)); // 50ms overlap  
    }  
      
    // Menu items dengan timing cascade overlap  
    sidebarItems.forEach((item, index) => {  
        // BASE TIMING: 150ms untuk item pertama, +30ms untuk setiap berikutnya  
        // TAPI dengan overlap, jadi perbedaan hanya 15ms  
        const itemDelay = 150 + (index * 15); // Hanya 15ms gap  
          
        // Item container  
        animationTimeouts.push(setTimeout(() => {  
            if (currentAnimationId !== animationId) return;  
            item.classList.add('show');  
              
            // Icon muncul lebih cepat (5ms setelah item)  
            const icon = item.querySelector('.sidebar-icon');  
            if (icon) {  
                animationTimeouts.push(setTimeout(() => {  
                    icon.classList.add('show');  
                }, 5));  
            }  
              
            // Text muncul 10ms setelah icon (overlap)  
            const text = item.querySelector('.sidebar-text');  
            if (text) {  
                animationTimeouts.push(setTimeout(() => {  
                    text.classList.add('show');  
                }, 15));  
            }  
              
        }, itemDelay));  
    });  
      
    // User profile muncul SEBELUM semua item selesai (overlap)  
    const lastItemIndex = sidebarItems.length - 1;  
    const userProfileDelay = 150 + (lastItemIndex * 15) - 100; // Muncul 100ms sebelum item terakhir  
      
    animationTimeouts.push(setTimeout(() => {  
        if (currentAnimationId !== animationId) return;  
        // Animasikan user profile section  
        const userProfile = document.querySelector('.user-profile');  
        if (userProfile) {  
            userProfile.style.opacity = '0';  
            userProfile.style.transform = 'translateY(10px)';  
              
            setTimeout(() => {  
                userProfile.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';  
                userProfile.style.opacity = '1';  
                userProfile.style.transform = 'translateY(0)';  
            }, 10);  
        }  
    }, userProfileDelay));  
      
    // Setelah semua animasi selesai  
    const totalAnimationTime = 150 + (sidebarItems.length * 15) + 200;  
    animationTimeouts.push(setTimeout(() => {  
        if (currentAnimationId === animationId) {  
            isAnimating = false;  
        }  
    }, totalAnimationTime));  
  }  

  // ANIMASI KELUAR CASCADE OVERLAP  
  function animateSidebarExit() {  
    const animationId = ++currentAnimationId;  
      
    // Animasikan user profile pertama (reverse)  
    const userProfile = document.querySelector('.user-profile');  
    if (userProfile) {  
        userProfile.style.transition = 'all 0.3s ease';  
        userProfile.style.opacity = '0';  
        userProfile.style.transform = 'translateY(10px)';  
    }  
      
    // Menu items keluar dengan timing overlap (terbalik)  
    const reversedItems = Array.from(sidebarItems).reverse();  
      
    reversedItems.forEach((item, index) => {  
        // Timing overlap: 20ms gap, mulai dari 50ms  
        const exitDelay = 50 + (index * 20);  
          
        animationTimeouts.push(setTimeout(() => {  
            item.classList.remove('show');  
              
            // Icon dan text keluar bersamaan (tidak perlu delay)  
            const icon = item.querySelector('.sidebar-icon');  
            const text = item.querySelector('.sidebar-text');  
              
            if (icon) icon.classList.remove('show');  
            if (text) text.classList.remove('show');  
        }, exitDelay));  
    });  
      
    // Logo terakhir (teks dulu, lalu ikon)  
    animationTimeouts.push(setTimeout(() => {  
        if (logoText) logoText.classList.remove('show');  
    }, 50 + (reversedItems.length * 20) + 30));  
      
    animationTimeouts.push(setTimeout(() => {  
        if (logoIcon) logoIcon.classList.remove('show');  
    }, 50 + (reversedItems.length * 20) + 50));  
  }  

  /* =======================  
     INITIAL LOAD DENGAN OVERLAP  
  ======================= */  
  function initializePage() {  
    const hash = window.location.hash.substring(1) || 'profil';  
    switchTab(hash);  
      
    // Tunggu 100ms untuk DOM, lalu jalankan animasi overlap  
    setTimeout(() => {  
        animateSidebarSuperNiat();  
    }, 100);  
  }  
    
  initializePage();  
    
  /* =======================  
     MENU ITEM CLICK - DIPERBAIKI  
  ======================= */  
  menuItems.forEach(item => {  
    item.addEventListener('click', function(e) {  
      e.preventDefault();
      
      const tabId = this.getAttribute('data-tab');  
      switchTab(tabId);  
        
      // Reset semua hover states terlebih dahulu
      resetAllHoverStates();
        
      // Efek klik kecil  
      this.style.transform = 'scale(0.98)';  
      setTimeout(() => {  
        this.style.transform = '';  
      }, 150);  
        
      // Pastikan user profile tidak stuck
      const userProfile = document.querySelector('.user-profile');
      if (userProfile) {
          userProfile.classList.remove('active');
          userProfile.style.transform = '';
          userProfile.style.background = '';
          userProfile.style.boxShadow = '';
          
          // Reset ke state normal
          setTimeout(() => {
              userProfile.style.background = 'linear-gradient(135deg, #bae6fd, #e0f2fe)';
          }, 10);
      }
          
      if (window.innerWidth <= 992) {  
        sidebar.classList.remove('active');  
        menuToggle.querySelector('i').classList.remove('fa-times');  
        menuToggle.querySelector('i').classList.add('fa-bars');  
        animateSidebarExit();  
      }  
    });  
  });  
    
  /* =======================  
     MENU TOGGLE (MOBILE)  
  ======================= */  
  menuToggle.addEventListener('click', function() {  
    const wasActive = sidebar.classList.contains('active');  
    sidebar.classList.toggle('active');  
    const icon = this.querySelector('i');  
      
    if (sidebar.classList.contains('active')) {  
      // Sidebar dibuka  
      icon.classList.replace('fa-bars', 'fa-times');  
        
      // Reset hover states saat sidebar dibuka
      resetAllHoverStates();
        
      // Delay untuk memastikan transisi CSS selesai  
      setTimeout(() => {  
        animateSidebarSuperNiat();  
      }, 50);  
    } else {  
      // Sidebar ditutup  
      icon.classList.replace('fa-times', 'fa-bars');  
      animateSidebarExit();  
    }  
  });  
    
  /* =======================  
     CLICK OUTSIDE (MOBILE)  
  ======================= */  
  document.addEventListener('click', function(event) {  
    if (  
      window.innerWidth <= 992 &&  
      !sidebar.contains(event.target) &&  
      !menuToggle.contains(event.target) &&  
      sidebar.classList.contains('active')  
    ) {  
      sidebar.classList.remove('active');  
      menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
      animateSidebarExit();  
    }  
  });  
    
  /* =======================  
     NOTIFICATION  
  ======================= */  
  notificationBtn.addEventListener('click', function() {  
    this.style.transform = 'scale(0.95)';  
    setTimeout(() => this.style.transform = '', 150);  
      
    // Efek getar  
    this.style.animation = 'shake 0.5s';  
    setTimeout(() => this.style.animation = '', 500);  
      
    if (badge.textContent !== '0') {  
      badge.textContent = '0';  
      badge.style.background = '#10b981';  
      badge.style.transform = 'scale(1.2)';  
      setTimeout(() => badge.style.transform = '', 300);  
        
      // Notifikasi  
      showToast('Notifikasi telah dibersihkan!', 'success');  
    } else {  
      showToast('Tidak ada notifikasi baru', 'info');  
    }  
  });  
    
  /* =======================  
     LOGOUT (DIPINDAH KE HEADER)  
  ======================= */  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {  
        this.style.transform = 'scale(0.95)';  
        setTimeout(() => this.style.transform = '', 150);  
          
        // Efek konfirmasi dengan animasi  
        const modal = document.createElement('div');  
        modal.className = 'logout-modal';  
        modal.innerHTML = `  
          <div class="modal-content">  
            <i class="fas fa-sign-out-alt"></i>  
            <h3>Konfirmasi Logout</h3>  
            <p>Apakah Anda yakin ingin keluar dari sistem?</p>  
            <div class="modal-buttons">  
              <button class="btn-cancel">Batal</button>  
              <button class="btn-confirm">Keluar</button>  
            </div>  
          </div>  
        `;  
          
        document.body.appendChild(modal);  
          
        // Animasi masuk modal  
        setTimeout(() => {  
          modal.style.opacity = '1';  
          modal.style.transform = 'scale(1)';  
        }, 10);  
          
        // Event listeners untuk modal  
        modal.querySelector('.btn-cancel').addEventListener('click', function() {  
          modal.style.opacity = '0';  
          modal.style.transform = 'scale(0.8)';  
          setTimeout(() => modal.remove(), 300);  
        });  
          
        modal.querySelector('.btn-confirm').addEventListener('click', function() {  
          modal.querySelector('.modal-content').innerHTML = `  
            <i class="fas fa-check-circle" style="color:#10b981;font-size:48px;margin-bottom:20px;"></i>  
            <h3>Berhasil Logout</h3>  
            <p>Anda telah keluar dari sistem.</p>  
          `;  
            
          setTimeout(() => {  
            modal.style.opacity = '0';  
            setTimeout(() => {
                modal.remove();
                // Panggil logout dari Auth system
                if (window.Auth && window.Auth.authLogout) {
                    window.Auth.authLogout().then(() => {
                        showToast('Berhasil logout dari admin panel', 'success');
                        setTimeout(() => {
                            window.location.href = '../login.html';
                        }, 1500);
                    }).catch(err => {
                        showToast('Gagal logout: ' + err.message, 'error');
                    });
                }
            }, 300);  
          }, 1500);  
        });  
          
        // Klik di luar modal untuk tutup  
        modal.addEventListener('click', function(e) {  
          if (e.target === modal) {  
            modal.style.opacity = '0';  
            modal.style.transform = 'scale(0.8)';  
            setTimeout(() => modal.remove(), 300);  
          }  
        });  
    });
  }
    
  /* =======================  
     RESIZE HANDLER  
  ======================= */  
  let resizeTimer;  
  window.addEventListener('resize', function() {  
    clearTimeout(resizeTimer);  
    resizeTimer = setTimeout(() => {  
      if (window.innerWidth > 992) {  
        // Desktop: sidebar selalu terlihat  
        sidebar.classList.remove('active');  
        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');  
          
        // Reset hover states
        resetAllHoverStates();
          
        // Jalankan animasi masuk  
        setTimeout(() => {  
          animateSidebarSuperNiat();  
        }, 100);  
      } else {  
        // Mobile: jika sidebar tidak aktif, reset animasi  
        if (!sidebar.classList.contains('active')) {  
          resetAllAnimations();  
        }  
      }  
    }, 250);  
  });  
    
  /* =======================  
     HASH CHANGE  
  ======================= */  
  window.addEventListener('hashchange', function() {  
    const hash = window.location.hash.substring(1) || 'profil';  
    switchTab(hash);  
  });  
    
  /* =======================  
     UTILITY FUNCTIONS  
  ======================= */  
  function showToast(message, type = 'info') {  
    const toast = document.createElement('div');  
    toast.className = `toast toast-${type}`;  
    toast.innerHTML = `  
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>  
      <span>${message}</span>  
    `;  
      
    document.body.appendChild(toast);  
      
    // Animasi masuk  
    setTimeout(() => {  
      toast.style.opacity = '1';  
      toast.style.transform = 'translateY(0)';  
    }, 10);  
      
    // Auto remove setelah 3 detik  
    setTimeout(() => {  
      toast.style.opacity = '0';  
      toast.style.transform = 'translateY(20px)';  
      setTimeout(() => toast.remove(), 300);  
    }, 3000);  
  }  
    
  /* =======================  
     STYLE UNTUK MODAL & TOAST  
  ======================= */  
  const style = document.createElement('style');  
  style.textContent = `  
    .logout-modal {  
      position: fixed;  
      top: 0;  
      left: 0;  
      width: 100%;  
      height: 100%;  
      background: rgba(0, 0, 0, 0.5);  
      display: flex;  
      align-items: center;  
      justify-content: center;  
      z-index: 9999;  
      opacity: 0;  
      transform: scale(0.8);  
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
    }  
      
    .modal-content {  
      background: white;  
      padding: 30px;  
      border-radius: 16px;  
      text-align: center;  
      max-width: 400px;  
      width: 90%;  
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);  
    }  
      
    .modal-content i {  
      font-size: 48px;  
      color: #0ea5e9;  
      margin-bottom: 20px;  
    }  
      
    .modal-content h3 {  
      color: #0c4a6e;  
      margin-bottom: 10px;  
    }  
      
    .modal-content p {  
      color: #0369a1;  
      margin-bottom: 25px;  
    }  
      
    .modal-buttons {  
      display: flex;  
      gap: 15px;  
      justify-content: center;  
    }  
      
    .modal-buttons button {  
      padding: 12px 24px;  
      border-radius: 10px;  
      border: none;  
      font-weight: 600;  
      cursor: pointer;  
      transition: all 0.3s ease;  
    }  
      
    .btn-cancel {  
      background: #e0f2fe;  
      color: #0369a1;  
      border: 1px solid #7dd3fc;  
    }  
      
    .btn-cancel:hover {  
      background: #bae6fd;  
      transform: translateY(-2px);  
    }  
      
    .btn-confirm {  
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);  
      color: white;  
    }  
      
    .btn-confirm:hover {  
      transform: translateY(-2px);  
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);  
    }  
      
    .toast {  
      position: fixed;  
      bottom: 30px;  
      right: 30px;  
      background: white;  
      padding: 15px 20px;  
      border-radius: 10px;  
      display: flex;  
      align-items: center;  
      gap: 12px;  
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);  
      z-index: 9998;  
      opacity: 0;  
      transform: translateY(20px);  
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
      border-left: 4px solid #0ea5e9;  
    }  
      
    .toast-success {  
      border-left-color: #10b981;  
    }  
      
    .toast i {  
      color: #0ea5e9;  
      font-size: 20px;  
    }  
      
    .toast-success i {  
      color: #10b981;  
    }  
      
    .toast span {  
      color: #0c4a6e;  
      font-weight: 500;  
    }  
      
    @keyframes shake {  
      0%, 100% { transform: translateX(0); }  
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }  
      20%, 40%, 60%, 80% { transform: translateX(2px); }  
    }  
  `;  
  document.head.appendChild(style);  
    
});

/* =======================  
   PROFIL ADMIN FUNCTIONALITY (VERSI DIPERBAIKI)  
======================= */  

// Initialize Admin Profile
function initializeAdminProfile() {
    console.log('🔄 Menginisialisasi Profil Admin');
    
    // Load data dari Auth jika tersedia
    if (window.Auth && window.Auth.userData) {
        updateAdminProfile(window.Auth.userData);
    } else {
        // Gunakan data admin default dengan avatar yang pasti bekerja
        updateAdminProfile({
            nama: 'Admin AlbEdu',
            email: 'admin@alb.edu',
            foto_profil: getDefaultAvatar('Admin AlbEdu'),
            id: 'ADM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            peran: 'Administrator'
        });
    }
    
    // Setup event listeners
    setupProfileEventListeners();
}

// Generate avatar URL yang lebih reliable
function getDefaultAvatar(name) {
    // Gunakan Gravatar atau DiceBear dengan seed yang konsisten
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}&backgroundColor=0ea5e9&backgroundType=gradientLinear&mouth=smile&eyes=happy`;
}

// Update admin profile display dengan error handling yang lebih baik
function updateAdminProfile(userData) {
    // Update avatar dengan fallback yang lebih baik
    const avatarElement = document.getElementById('admin-avatar');
    const avatarUrl = userData.foto_profil || getDefaultAvatar(userData.nama);
    
    // Buat elemen gambar dengan multiple fallback
    const img = new Image();
    img.onload = function() {
        avatarElement.innerHTML = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        avatarElement.appendChild(img);
    };
    
    img.onerror = function() {
        // Fallback 1: Coba avatar alternatif
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nama)}&background=0ea5e9&color=fff&size=128&bold=true`;
        const fallbackImg = new Image();
        fallbackImg.onload = function() {
            avatarElement.innerHTML = '';
            fallbackImg.style.width = '100%';
            fallbackImg.style.height = '100%';
            fallbackImg.style.objectFit = 'cover';
            fallbackImg.style.borderRadius = '50%';
            avatarElement.appendChild(fallbackImg);
        };
        fallbackImg.onerror = function() {
            // Fallback 2: Gunakan SVG lokal
            avatarElement.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:white;font-size:48px;border-radius:50%;">
                    ${userData.nama.charAt(0).toUpperCase()}
                </div>
            `;
        };
        fallbackImg.src = fallbackUrl;
        fallbackImg.alt = userData.nama;
    };
    
    img.src = avatarUrl;
    img.alt = userData.nama;
    
    // Update name and email
    document.getElementById('admin-name').textContent = userData.nama || 'Admin AlbEdu';
    document.getElementById('admin-email').textContent = userData.email || 'admin@alb.edu';
    document.getElementById('admin-id').textContent = userData.id || 'ADM-001';
    
    // Set last login dengan format yang lebih menarik
    const lastLogin = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('admin-last-login').textContent = 
        lastLogin.toLocaleString('id-ID', options) + ' WIB';
}

// Setup event listeners for profile actions
function setupProfileEventListeners() {
    // Avatar Edit Button
    const avatarEditBtn = document.getElementById('btn-avatar-edit');
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', showAvatarPicker);
    }
    
    // Edit Profile Button (Modal Edit Sederhana)
    const editProfileBtn = document.getElementById('btn-edit-profile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }
}

// Show Edit Profile Modal (Hanya NAMA yang bisa diubah)
function showEditProfileModal() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'editProfileModal';
    
    const currentName = document.getElementById('admin-name').textContent;
    const currentEmail = document.getElementById('admin-email').textContent;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Profil Admin</h3>
                <button class="modal-close" id="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editFullName">
                        <i class="fas fa-user"></i> Nama Lengkap
                    </label>
                    <input type="text" id="editFullName" class="form-control" 
                           value="${currentName}" placeholder="Masukkan nama lengkap" maxlength="50">
                    <small class="form-text" style="color:#64748b;font-size:12px;margin-top:5px;">
                        Nama akan ditampilkan di semua halaman admin
                    </small>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <div class="email-display">
                        <i class="fas fa-at"></i>
                        <span>${currentEmail}</span>
                        <div class="email-locked">
                            <i class="fas fa-lock"></i>
                            <small>Email tidak dapat diubah</small>
                        </div>
                    </div>
                </div>
                
                <div class="password-change-info">
                    <i class="fas fa-info-circle"></i>
                    <p>Untuk mengubah password, silakan gunakan fitur "Reset Password" di halaman login</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelEdit">
                    <i class="fas fa-times"></i> Batal
                </button>
                <button class="btn-modal btn-modal-save" id="saveEdit">
                    <i class="fas fa-save"></i> Simpan Perubahan
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
        document.getElementById('editFullName').focus();
        document.getElementById('editFullName').select();
    }, 10);
    
    // Event listeners
    modal.querySelector('#closeEditModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelEdit').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#saveEdit').addEventListener('click', () => {
        const newName = document.getElementById('editFullName').value.trim();
        
        if (!newName) {
            showToast('Nama tidak boleh kosong', 'error');
            document.getElementById('editFullName').focus();
            return;
        }
        
        if (newName.length < 3) {
            showToast('Nama minimal 3 karakter', 'error');
            document.getElementById('editFullName').focus();
            return;
        }
        
        // Update display dengan animasi
        const nameElement = document.getElementById('admin-name');
        nameElement.style.transform = 'scale(0.95)';
        nameElement.style.opacity = '0.8';
        
        setTimeout(() => {
            nameElement.textContent = newName;
            nameElement.style.transform = 'scale(1)';
            nameElement.style.opacity = '1';
        }, 200);
        
        // Update in Auth system if available
        if (window.Auth && window.Auth.userData) {
            window.Auth.userData.nama = newName;
            
            // Update in Firestore if user is logged in
            if (window.Auth.currentUser && window.firebase) {
                firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                    nama: newName,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showToast('Profil berhasil diperbarui di database', 'success');
                }).catch(err => {
                    console.error('Error updating profile:', err);
                    showToast('Gagal menyimpan ke database', 'error');
                });
            }
        }
        
        showToast('Nama berhasil diperbarui', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Show Avatar Picker
function showAvatarPicker() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.id = 'avatarPickerModal';
    
    // Avatar options dengan URL yang lebih reliable
    const avatars = [
        { id: 1, style: 'avataaars', seed: 'Admin1', color: '0ea5e9' },
        { id: 2, style: 'adventurer', seed: 'Admin2', color: '0ea5e9' },
        { id: 3, style: 'bottts', seed: 'Admin3', color: '0ea5e9' },
        { id: 4, style: 'micah', seed: 'Admin4', color: '0ea5e9' },
        { id: 5, style: 'big-ears', seed: 'Admin5', color: '0ea5e9' },
        { id: 6, style: 'croodles', seed: 'Admin6', color: '0ea5e9' },
        { id: 7, style: 'miniavs', seed: 'Admin7', color: '0ea5e9' },
        { id: 8, style: 'personas', seed: 'Admin8', color: '0ea5e9' },
        { id: 9, style: 'pixel-art', seed: 'Admin9', color: '0ea5e9' },
        { id: 10, style: 'identicon', seed: 'Admin10', color: '0ea5e9' },
        { id: 11, style: 'fun-emoji', seed: 'Admin11', color: '0ea5e9' },
        { id: 12, style: 'shapes', seed: 'Admin12', color: '0ea5e9' }
    ];
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-circle"></i> Pilih Avatar Baru</h3>
                <button class="modal-close" id="closeAvatarModal">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #64748b; margin-bottom: 20px; text-align: center;">
                    Pilih avatar untuk profil Anda. Klik untuk melihat preview.
                </p>
                <div class="avatar-picker" id="avatarPicker">
                    ${avatars.map((avatar, index) => `
                        <div class="avatar-option ${index === 0 ? 'selected' : ''}" 
                             data-avatar="https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}&backgroundColor=${avatar.color}">
                            <img src="https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}&backgroundColor=${avatar.color}" 
                                 alt="Avatar ${index + 1}"
                                 onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#0ea5e9\"/><text x=\"50\" y=\"55\" text-anchor=\"middle\" dy=\".3em\" font-size=\"40\" fill=\"#fff\">${String.fromCharCode(65 + index)}</text></svg>'">
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 12px;">
                    <small style="color: #64748b;">
                        <i class="fas fa-info-circle"></i>
                        Avatar akan diperbarui secara instan. Anda dapat mengubahnya kapan saja.
                    </small>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" id="cancelAvatar">
                    <i class="fas fa-times"></i> Batal
                </button>
                <button class="btn-modal btn-modal-save" id="saveAvatar">
                    <i class="fas fa-check"></i> Terapkan Avatar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Event listeners
    let selectedAvatar = avatars[0].url;
    
    modal.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', () => {
            modal.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
        });
    });
    
    modal.querySelector('#closeAvatarModal').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#cancelAvatar').addEventListener('click', () => closeModal(modal));
    
    modal.querySelector('#saveAvatar').addEventListener('click', () => {
        // Update avatar display
        const avatarElement = document.getElementById('admin-avatar');
        const img = new Image();
        img.onload = function() {
            avatarElement.innerHTML = '';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            avatarElement.appendChild(img);
        };
        img.onerror = function() {
            avatarElement.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:white;font-size:48px;border-radius:50%;">
                    A
                </div>
            `;
        };
        img.src = selectedAvatar;
        img.alt = 'Avatar Baru';
        
        // Update in Auth system if available
        if (window.Auth && window.Auth.userData) {
            window.Auth.userData.foto_profil = selectedAvatar;
            
            // Update in Firestore if user is logged in
            if (window.Auth.currentUser && window.firebase) {
                firebase.firestore().collection('users').doc(window.Auth.currentUser.uid).update({
                    foto_profil: selectedAvatar,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showToast('Avatar berhasil disimpan ke database', 'success');
                }).catch(err => {
                    console.error('Error updating avatar:', err);
                    showToast('Gagal menyimpan avatar ke database', 'error');
                });
            }
        }
        
        showToast('Avatar berhasil diubah', 'success');
        closeModal(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

// Close Modal Helper
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Toast Helper
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    toast.innerHTML = `
        <span style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'}; font-weight: bold;">${icon}</span>
        <span style="color: #0c4a6e; font-weight: 500;">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize admin profile on page load if profil tab is active
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1) || 'profil';
    if (hash === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 1000);
    }
});

// Also initialize when switching to profil tab via hash change
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1) || 'profil';
    if (hash === 'profil') {
        setTimeout(() => {
            initializeAdminProfile();
        }, 300);
    }
});
