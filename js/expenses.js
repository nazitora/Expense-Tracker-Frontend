/* ═══════════════════════════════════════════════════════
   EXPENSES MODULE — CRUD + filtering
   ═══════════════════════════════════════════════════════ */

const expenses = {
  list: [],
  editingId: null,

  getFilterValues() {
    const monthEl = document.getElementById('expense-filter-month');
    const yearEl = document.getElementById('expense-filter-year');
    const catEl = document.getElementById('expense-filter-category');
    return {
      month: monthEl ? monthEl.value : '',
      year: yearEl ? yearEl.value : '',
      categoryId: catEl ? catEl.value : '',
    };
  },

  async load() {
    const filters = this.getFilterValues();
    try {
      this.list = await api.getExpenses(filters);
    } catch (err) {
      toast.show('Failed to load expenses', 'error');
    }
  },

  render() {
    const container = document.getElementById('expenses-list');
    if (!container) return;

    if (this.list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💸</div>
          <h3>No expenses found</h3>
          <p>Add your first expense or adjust the filters</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="expense-list stagger-in">
        ${this.list.map(exp => {
          const catName = exp.categoryId?.name || 'Unknown';
          const icon = categories.getIcon(catName);
          const date = new Date(exp.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          });
          return `
            <div class="expense-item" data-id="${exp._id}">
              <div class="expense-cat-badge">${icon}</div>
              <div class="expense-info">
                <div class="expense-desc">${exp.description || 'No description'}</div>
                <div class="expense-meta">
                  <span>${catName}</span>
                  <span>•</span>
                  <span>${date}</span>
                </div>
              </div>
              <div class="expense-amount">- ₹${exp.amount.toLocaleString('en-IN')}</div>
              <div class="expense-actions">
                <button class="btn btn-icon btn-secondary" onclick="expenses.openEditModal('${exp._id}')" title="Edit">✏️</button>
                <button class="btn btn-icon btn-danger" onclick="expenses.delete('${exp._id}')" title="Delete">🗑️</button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  populateFilterCategories() {
    const select = document.getElementById('expense-filter-category');
    if (!select) return;
    select.innerHTML = `<option value="">All Categories</option>` + categories.getOptionsHTML();
  },

  openAddModal() {
    this.editingId = null;
    const modal = document.getElementById('expense-modal');
    document.getElementById('expense-modal-title').textContent = 'Add Expense';
    document.getElementById('expense-form').reset();
    document.getElementById('expense-category').innerHTML = categories.getOptionsHTML();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    modal.querySelector('.modal-overlay').classList.add('active');
  },

  openEditModal(id) {
    const exp = this.list.find(e => e._id === id);
    if (!exp) return;

    this.editingId = id;
    const modal = document.getElementById('expense-modal');
    document.getElementById('expense-modal-title').textContent = 'Edit Expense';
    document.getElementById('expense-category').innerHTML = categories.getOptionsHTML(exp.categoryId?._id);
    document.getElementById('expense-amount').value = exp.amount;
    document.getElementById('expense-description').value = exp.description || '';
    document.getElementById('expense-date').value = new Date(exp.date).toISOString().split('T')[0];
    modal.querySelector('.modal-overlay').classList.add('active');
  },

  closeModal() {
    document.getElementById('expense-modal').querySelector('.modal-overlay').classList.remove('active');
    this.editingId = null;
  },

  async handleSubmit(e) {
    e.preventDefault();

    const data = {
      categoryId: document.getElementById('expense-category').value,
      amount: parseFloat(document.getElementById('expense-amount').value),
      description: document.getElementById('expense-description').value.trim(),
      date: document.getElementById('expense-date').value,
    };

    if (!data.categoryId || isNaN(data.amount) || data.amount <= 0) {
      toast.show('Please fill in category and a valid amount', 'error');
      return;
    }

    try {
      if (this.editingId) {
        await api.updateExpense(this.editingId, data);
        toast.show('Expense updated!', 'success');
      } else {
        await api.createExpense(data);
        toast.show('Expense added!', 'success');
      }

      this.closeModal();
      await this.load();
      this.render();

      // Also refresh dashboard if it's the current view
      if (document.getElementById('view-dashboard')?.classList.contains('active')) {
        dashboard.refresh();
      }
    } catch (err) {
      toast.show(err.message || 'Failed to save expense', 'error');
    }
  },

  async delete(id) {
    if (!confirm('Delete this expense?')) return;

    try {
      await api.deleteExpense(id);
      toast.show('Expense deleted', 'success');
      await this.load();
      this.render();

      if (document.getElementById('view-dashboard')?.classList.contains('active')) {
        dashboard.refresh();
      }
    } catch (err) {
      toast.show(err.message || 'Failed to delete expense', 'error');
    }
  },

  async applyFilters() {
    await this.load();
    this.render();
  },
};
