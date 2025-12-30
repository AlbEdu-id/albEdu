// panel.js - Responsive Admin Panel Functionality

class AdminPanel {
  constructor() {
    this.init();
  }
  
  init() {
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      this.setupUserInfo();
      this.setupNavigation();
      this.setupIcons();
      this.updateTime();
      console.log('Responsive Admin Panel initialized');
      
      // Update time every minute
      setInterval(() => this.updateTime(), 60000);
    });
  }
  
  setupUserInfo() {
    const userInfoElement = document.getElementById('userInfo');
    
    // Check if user info is available from Auth module
    if (window.Auth && window.Auth.currentUser) {
      const user = window.Auth.currentUser;
      const userName = user.displayName || user.email.split('@')[0];
      
      // Update user info display
      if (userInfoElement) {
        userInfoElement.innerHTML = `
                    <div class="user-avatar-mobile">
                        <i class="fas fa-user-cog"></i>
                    </div>
                    <div class="user-details-mobile">
                        <h3>${userName}</h3>
                        <p>${user.email}</p>
                    </div>
                `;
      }
      
      // Set greeting based on time of day
      this.setGreeting();
    } else {
      // Fallback if Auth is not available
      if (userInfoElement) {
        userInfoElement.innerHTML = `
                    <div class="user-avatar-mobile">
                        <i class="fas fa-user-cog"></i>
                    </div>
                    <div class="user-details-mobile">
                        <h3>Administrator</h3>
                        <p>admin@albedu.com</p>
                    </div>
                `;
      }
    }
  }
  
  setGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;
    
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 19) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';
    
    greetingElement.textContent = `${greeting}, Admin!`;
  }
  
  updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (!timeElement) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    timeElement.textContent = timeString;
  }
  
  setupNavigation() {
    // Handle mobile card navigation
    const cards = document.querySelectorAll('.mobile-card');
    cards.forEach(card => {
      const link = card.dataset.link;
      if (link) {
        // Add click event to the entire card
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = link;
        });
      }
    });
  }
  
  setupIcons() {
    // We'll use Font Awesome icons
    // If not already loaded, we can load them dynamically
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(faLink);
    }
  }
  
  // Detect device type
  isMobileDevice() {
    return window.innerWidth <= 768;
  }
  
  // Detect if touch device
  isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}

// Initialize the Admin Panel
const adminPanel = new AdminPanel();
