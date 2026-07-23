/* ═══════════════════════════════════════════════════════
   AUTH MODULE — Login & Register
   ═══════════════════════════════════════════════════════ */

const auth = {
  init() {
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.loginTab = document.getElementById('login-tab');
    this.registerTab = document.getElementById('register-tab');
    this.loginError = document.getElementById('login-error');
    this.registerError = document.getElementById('register-error');

    // Tab switching
    this.loginTab.addEventListener('click', () => this.switchTab('login'));
    this.registerTab.addEventListener('click', () => this.switchTab('register'));

    // Form submissions
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
  },

  switchTab(tab) {
    this.loginTab.classList.toggle('active', tab === 'login');
    this.registerTab.classList.toggle('active', tab === 'register');
    this.loginForm.classList.toggle('active', tab === 'login');
    this.registerForm.classList.toggle('active', tab === 'register');
    this.loginError.classList.remove('show');
    this.registerError.classList.remove('show');
  },

  showError(el, message) {
    el.textContent = message;
    el.classList.add('show');
  },

  setLoading(btn, loading) {
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = this.loginForm.querySelector('button[type="submit"]');

    this.loginError.classList.remove('show');

    if (!email || !password) {
      return this.showError(this.loginError, 'Please fill in all fields');
    }

    this.setLoading(btn, true);

    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      api.setUser({ _id: data._id, name: data.name, email: data.email });
      app.showApp();
    } catch (err) {
      this.showError(this.loginError, err.message || 'Login failed');
    } finally {
      this.setLoading(btn, false);
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const btn = this.registerForm.querySelector('button[type="submit"]');

    this.registerError.classList.remove('show');

    if (!name || !email || !password) {
      return this.showError(this.registerError, 'Please fill in all fields');
    }

    if (password.length < 6) {
      return this.showError(this.registerError, 'Password must be at least 6 characters');
    }

    this.setLoading(btn, true);

    try {
      const data = await api.register(name, email, password);
      api.setToken(data.token);
      api.setUser({ _id: data._id, name: data.name, email: data.email });
      app.showApp();
    } catch (err) {
      this.showError(this.registerError, err.message || 'Registration failed');
    } finally {
      this.setLoading(btn, false);
    }
  },
};
