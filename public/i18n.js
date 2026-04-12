/**
 * AP Physics Practice - i18n (Internationalization)
 * Simple EN/ZH toggle
 */

(function() {
  const STORAGE_KEY = 'physics_lang';
  const DEFAULT_LANG = 'zh';

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  let listeners = [];

  const I18n = {
    t: function(key) {
      const dict = window.I18N && window.I18N[currentLang];
      return dict && dict[key] !== undefined ? dict[key] : key;
    },

    toggle: function() {
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem(STORAGE_KEY, currentLang);
      this._apply();
      listeners.forEach(fn => fn(currentLang));
    },

    getLang: function() {
      return currentLang;
    },

    onSwitch: function(fn) {
      if (typeof fn === 'function') listeners.push(fn);
    },

    _apply: function() {
      // Apply to elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = this.t(key);
      });

      // Apply to elements with data-i18n-html
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = this.t(key);
      });

      // Apply to elements with data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = this.t(key);
      });

      // Apply to elements with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = this.t(key);
      });

      // Update toggle button text
      const toggleBtn = document.querySelector('.i18n-toggle');
      if (toggleBtn) {
        toggleBtn.textContent = currentLang === 'zh' ? 'EN' : '中文';
      }
    }
  };

  // Init on DOM ready
  function init() {
    I18n._apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.I18n = I18n;
})();
