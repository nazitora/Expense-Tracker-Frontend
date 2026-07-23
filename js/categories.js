/* ═══════════════════════════════════════════════════════
   CATEGORIES MODULE
   ═══════════════════════════════════════════════════════ */

const categories = {
  list: [],

  // Category emoji map
  iconMap: {
    'Food':               '🍔',
    'Travel':             '✈️',
    'Rent':               '🏠',
    'Shopping':           '🛍️',
    'Entertainment':      '🎬',
    'Bills & Utilities':  '💡',
    'Health':             '💊',
    'Other':              '📦',
  },

  getIcon(name) {
    return this.iconMap[name] || '🏷️';
  },

  async load() {
    try {
      this.list = await api.getCategories();
    } catch (err) {
      toast.show('Failed to load categories', 'error');
    }
  },

  render() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    if (this.list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏷️</div>
          <h3>No categories yet</h3>
          <p>Create your first custom category above</p>
        </div>`;
      return;
    }

    const user = api.getUser();

    container.innerHTML = `
      <div class="categories-grid stagger-in">
        ${this.list.map(cat => {
          const isCustom = cat.userId && cat.userId === user?._id;
          return `
            <div class="category-card" data-id="${cat._id}">
              <div class="category-icon">${this.getIcon(cat.name)}</div>
              <span class="category-card-name">${cat.name}</span>
              ${isCustom
                ? `<span class="category-badge custom">Custom</span>
                   <button class="btn btn-icon btn-danger" onclick="categories.delete('${cat._id}')" title="Delete">✕</button>`
                : `<span class="category-badge">Default</span>`
              }
            </div>`;
        }).join('')}
      </div>`;
  },

  async create() {
    const input = document.getElementById('new-category-name');
    const name = input.value.trim();
    if (!name) {
      toast.show('Enter a category name', 'error');
      return;
    }

    try {
      await api.createCategory(name);
      input.value = '';
      toast.show('Category created!', 'success');
      await this.load();
      this.render();
    } catch (err) {
      toast.show(err.message || 'Failed to create category', 'error');
    }
  },

  async delete(id) {
    if (!confirm('Delete this category?')) return;

    try {
      await api.deleteCategory(id);
      toast.show('Category deleted', 'success');
      await this.load();
      this.render();
    } catch (err) {
      toast.show(err.message || 'Failed to delete category', 'error');
    }
  },

  /** Returns an HTML <option> list for dropdowns */
  getOptionsHTML(selectedId) {
    return this.list.map(cat =>
      `<option value="${cat._id}" ${cat._id === selectedId ? 'selected' : ''}>
        ${this.getIcon(cat.name)} ${cat.name}
      </option>`
    ).join('');
  },
};
