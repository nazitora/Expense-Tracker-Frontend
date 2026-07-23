/* ═══════════════════════════════════════════════════════
   APP MODULE — Router, Navigation & Toast
   ═══════════════════════════════════════════════════════ */

/* ── Toast Notifications ── */
const toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;
    toastEl.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    this.container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('removing');
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  },
};

/* ── Main App Controller ── */
const app = {
  currentView: 'dashboard',

  init() {
    toast.init();
    auth.init();

    // Check if user is already logged in
    if (api.getToken() && api.getUser()) {
      this.showApp();
    } else {
      this.showAuth();
    }

    // Sidebar nav
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(item.dataset.view);
        this.closeMobileSidebar();
      });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => this.logout());

    // Mobile sidebar toggle
    document.getElementById('hamburger-btn')?.addEventListener('click', () => this.toggleMobileSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeMobileSidebar());

    // Expense form
    document.getElementById('expense-form')?.addEventListener('submit', (e) => expenses.handleSubmit(e));

    // Create group form
    document.getElementById('create-group-form')?.addEventListener('submit', (e) => groups.handleCreateGroup(e));

    // Group expense form
    document.getElementById('group-expense-form')?.addEventListener('submit', (e) => groups.handleAddExpense(e));

    // Category create button
    document.getElementById('btn-create-category')?.addEventListener('click', () => categories.create());
    // Allow Enter key in category input
    document.getElementById('new-category-name')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); categories.create(); }
    });

    // Expense filter listeners
    ['expense-filter-month', 'expense-filter-year', 'expense-filter-category'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => expenses.applyFilters());
    });
  },

  showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('app-screen').classList.remove('active');
  },

  async showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('app-screen').classList.add('active');

    // Set user info in sidebar
    const user = api.getUser();
    if (user) {
      const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';
      const avatarEl = document.getElementById('user-avatar');
      const nameEl = document.getElementById('user-name');
      const emailEl = document.getElementById('user-email');
      if (avatarEl) avatarEl.textContent = initials;
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
    }

    // Load categories (needed by most views)
    await categories.load();

    // Populate expense filter month/year
    this.populateFilters();

    // Navigate to default view
    this.navigate('dashboard');
  },

  populateFilters() {
    const now = new Date();
    const monthSelect = document.getElementById('expense-filter-month');
    const yearSelect = document.getElementById('expense-filter-year');

    if (monthSelect) {
      const months = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      monthSelect.innerHTML = `<option value="">All Months</option>` +
        months.map((m, i) => `<option value="${i+1}" ${i+1 === now.getMonth()+1 ? 'selected' : ''}>${m}</option>`).join('');
    }

    if (yearSelect) {
      const currentYear = now.getFullYear();
      yearSelect.innerHTML = `<option value="">All Years</option>` +
        [currentYear - 1, currentYear, currentYear + 1].map(y =>
          `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`
        ).join('');
    }
  },

  async navigate(view) {
    this.currentView = view;

    // Update nav
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.add('active');

    // Load data for the view
    switch (view) {
      case 'dashboard':
        await dashboard.refresh();
        break;
      case 'expenses':
        expenses.populateFilterCategories();
        await expenses.load();
        expenses.render();
        break;
      case 'categories':
        categories.render();
        break;
      case 'groups':
        groups.currentGroupId = null;
        await groups.load();
        groups.render();
        break;
    }
  },

  logout() {
    api.clearAuth();
    this.showAuth();
    toast.show('Logged out', 'info');
  },

  toggleMobileSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('open');
  },

  closeMobileSidebar() {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('open');
  },
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => app.init());
