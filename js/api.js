/* ═══════════════════════════════════════════════════════
   API MODULE — Centralised fetch wrapper with JWT
   ═══════════════════════════════════════════════════════ */

const API_BASE = 'https://expense-tracker-7qlg.onrender.com/api';

const api = {
  /** Get stored JWT token */
  getToken() {
    return localStorage.getItem('et_token');
  },

  /** Set JWT token */
  setToken(token) {
    localStorage.setItem('et_token', token);
  },

  /** Clear auth data */
  clearAuth() {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
  },

  /** Get stored user info */
  getUser() {
    const u = localStorage.getItem('et_user');
    return u ? JSON.parse(u) : null;
  },

  /** Save user info */
  setUser(user) {
    localStorage.setItem('et_user', JSON.stringify(user));
  },

  /** Generic fetch helper */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, message: data.message || 'Something went wrong' };
      }

      return data;
    } catch (err) {
      if (err.status === 401) {
        this.clearAuth();
        window.location.reload();
      }
      throw err;
    }
  },

  // ── Auth ──
  register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  // ── Categories ──
  getCategories() {
    return this.request('/categories');
  },

  createCategory(name) {
    return this.request('/categories', {
      method: 'POST',
      body: { name },
    });
  },

  deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  },

  // ── Expenses ──
  getExpenses(params = {}) {
    const query = new URLSearchParams();
    if (params.month) query.set('month', params.month);
    if (params.year) query.set('year', params.year);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    const qs = query.toString();
    return this.request(`/expenses${qs ? '?' + qs : ''}`);
  },

  createExpense(data) {
    return this.request('/expenses', {
      method: 'POST',
      body: data,
    });
  },

  updateExpense(id, data) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  deleteExpense(id) {
    return this.request(`/expenses/${id}`, { method: 'DELETE' });
  },

  // ── Reports ──
  getSpendingByCategory(month, year) {
    return this.request(`/reports/by-category?month=${month}&year=${year}`);
  },

  getMonthlyTrend(year) {
    return this.request(`/reports/monthly-trend?year=${year}`);
  },

  getSummary(month, year) {
    return this.request(`/reports/summary?month=${month}&year=${year}`);
  },

  // ── Groups ──
  getGroups() {
    return this.request('/groups');
  },

  createGroup(name, memberIds) {
    return this.request('/groups', {
      method: 'POST',
      body: { name, memberIds },
    });
  },

  addGroupExpense(groupId, data) {
    return this.request(`/groups/${groupId}/expenses`, {
      method: 'POST',
      body: data,
    });
  },

  getGroupBalances(groupId) {
    return this.request(`/groups/${groupId}/balances`);
  },
};
