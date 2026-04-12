/**
 * AP Physics Practice - Auth Guard
 * Protects routes that require login
 */

let showLoginModal = null; // Callback to show login modal

/**
 * Set the modal show function (called by app initialization)
 */
function setLoginModalCallback(callback) {
  showLoginModal = callback;
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  const token = localStorage.getItem('physics_token');
  const userStr = localStorage.getItem('physics_user');
  return !!token && !!userStr;
}

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('physics_token');
}

/**
 * Require login - returns true if logged in, shows modal if not
 * @param {string} [message] - Optional message to show
 * @returns {boolean}
 */
function requireLogin(message) {
  if (isLoggedIn()) {
    // Load user into window.user
    const userStr = localStorage.getItem('physics_user');
    if (userStr) {
      try {
        window.user = JSON.parse(userStr);
      } catch (e) {
        window.user = null;
      }
    }
    return true;
  }

  if (showLoginModal) {
    showLoginModal(message || '请先登录');
  }
  return false;
}

/**
 * Initialize auth state on page load
 */
function initAuth() {
  const userStr = localStorage.getItem('physics_user');
  if (userStr) {
    try {
      window.user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user:', e);
      window.user = null;
    }
  } else {
    window.user = null;
  }
}

// Auto-init on load
initAuth();

// Export functions (for potential module use)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { requireLogin, getAuthToken, isLoggedIn, setLoginModalCallback, initAuth };
}
