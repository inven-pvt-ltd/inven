/**
 * INVEN Portal - Authentication Module
 * Handles user authentication, session management
 */

class AuthManager {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // Check if user is already logged in
    const savedUser = sessionStorage.getItem('portal_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.onAuthStateChange();
    }

    // Setup form handlers
    this.setupLoginForm();
    this.setupLogout();
  }

  /**
   * Handle login form submission
   */
  setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('[name="email"]').value;
      const password = form.querySelector('[name="password"]').value;
      const remember = form.querySelector('[name="remember"]').checked;

      try {
        const response = await this.authenticateUser(email, password);
        
        if (response.success) {
          this.user = response.user;
          this.isAuthenticated = true;
          
          if (remember) {
            sessionStorage.setItem('portal_user', JSON.stringify(this.user));
          }

          window.location.href = 'dashboard.html';
        } else {
          this.showError(form, response.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.showError(form, 'An error occurred. Please try again.');
      }
    });
  }

  /**
   * Mock authentication - Replace with Firebase
   */
  async authenticateUser(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          resolve({
            success: true,
            user: {
              id: '123',
              email: email,
              name: email.split('@')[0],
              role: 'client',
              avatar: email.charAt(0).toUpperCase()
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Invalid email or password'
          });
        }
      }, 500);
    });
  }

  /**
   * Show error message on form
   */
  showError(form, message) {
    const errorDiv = form.querySelector('#errorMessage');
    if (errorDiv) {
      errorDiv.querySelector('#errorText').textContent = message;
      errorDiv.style.display = 'flex';
      errorDiv.classList.add('animate-fadeInDown');
    }
  }

  /**
   * Setup logout functionality
   */
  setupLogout() {
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  /**
   * Logout user
   */
  logout() {
    sessionStorage.removeItem('portal_user');
    this.isAuthenticated = false;
    this.user = null;
    window.location.href = 'login.html';
  }

  /**
   * Handle authentication state changes
   */
  onAuthStateChange() {
    if (this.isAuthenticated && this.user) {
      const userAvatar = document.querySelector('.navbar-avatar');
      const userName = document.querySelector('.navbar-user-name');
      const userRole = document.querySelector('.navbar-user-role');

      if (userAvatar) userAvatar.textContent = this.user.avatar || 'A';
      if (userName) userName.textContent = this.user.name || 'User';
      if (userRole) userRole.textContent = this.user.role || 'Client';
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Check if authenticated
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }
}

const authManager = new AuthManager();
window.AuthManager = authManager;
