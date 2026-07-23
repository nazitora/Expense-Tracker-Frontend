/* ═══════════════════════════════════════════════════════
   GROUPS MODULE — Splitwise-style group expenses
   ═══════════════════════════════════════════════════════ */

const groups = {
  list: [],
  currentGroupId: null,

  async load() {
    try {
      this.list = await api.getGroups();
    } catch (err) {
      toast.show('Failed to load groups', 'error');
    }
  },

  render() {
    const container = document.getElementById('groups-list-container');
    const detailPanel = document.getElementById('group-detail-panel');
    if (!container) return;

    // When viewing detail, hide list
    if (this.currentGroupId) {
      container.style.display = 'none';
      if (detailPanel) detailPanel.style.display = 'block';
      return;
    }

    container.style.display = 'block';
    if (detailPanel) detailPanel.style.display = 'none';

    if (this.list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3>No groups yet</h3>
          <p>Create a group to start splitting expenses</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="groups-list stagger-in">
        ${this.list.map(g => {
          const members = g.members || [];
          return `
            <div class="group-card" onclick="groups.openGroup('${g._id}')">
              <div class="group-card-header">
                <div class="group-card-name">
                  <span>👥</span> ${g.name}
                </div>
                <span class="group-members-count">${members.length} member${members.length !== 1 ? 's' : ''}</span>
              </div>
              <div class="group-members-avatars">
                ${members.slice(0, 5).map(m => {
                  const initials = m.name ? m.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?';
                  return `<div class="member-avatar" title="${m.name || m.email}">${initials}</div>`;
                }).join('')}
                ${members.length > 5 ? `<div class="member-avatar" style="background:var(--bg-glass);color:var(--text-secondary);">+${members.length - 5}</div>` : ''}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  async openGroup(id) {
    this.currentGroupId = id;
    const group = this.list.find(g => g._id === id);
    if (!group) return;

    const detailPanel = document.getElementById('group-detail-panel');
    if (!detailPanel) return;

    // Show detail, hide list
    document.getElementById('groups-list-container').style.display = 'none';
    detailPanel.style.display = 'block';
    detailPanel.classList.add('active');

    // Header
    document.getElementById('group-detail-name').textContent = group.name;

    // Members list
    const membersEl = document.getElementById('group-detail-members');
    const members = group.members || [];
    membersEl.innerHTML = members.map(m =>
      `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;
        background:var(--bg-glass);border-radius:var(--radius-full);font-size:0.82rem;
        border:1px solid var(--border);">
        ${m.name || m.email}
      </span>`
    ).join('');

    // Load balances
    await this.loadBalances(id);
  },

  goBack() {
    this.currentGroupId = null;
    const detailPanel = document.getElementById('group-detail-panel');
    if (detailPanel) {
      detailPanel.style.display = 'none';
      detailPanel.classList.remove('active');
    }
    document.getElementById('groups-list-container').style.display = 'block';
  },

  async loadBalances(groupId) {
    const balancesContainer = document.getElementById('group-balances');
    const settlementsContainer = document.getElementById('group-settlements');

    try {
      const data = await api.getGroupBalances(groupId);

      // Render balances
      if (data.balances && data.balances.length > 0) {
        balancesContainer.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px;" class="stagger-in">
            ${data.balances.map(b => {
              const isPositive = b.netBalance >= 0;
              return `
                <div class="balance-card">
                  <div>
                    <div style="font-weight:600;">${b.name}</div>
                  </div>
                  <div class="${isPositive ? 'balance-positive' : 'balance-negative'}" style="font-weight:700;font-size:1.05rem;">
                    ${isPositive ? '+' : ''}₹${Math.abs(b.netBalance).toLocaleString('en-IN')}
                  </div>
                </div>`;
            }).join('')}
          </div>`;
      } else {
        balancesContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">No expenses yet</p>`;
      }

      // Render settlements
      if (data.settlements && data.settlements.length > 0) {
        settlementsContainer.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:8px;" class="stagger-in">
            ${data.settlements.map(s => `
              <div class="settlement-item">
                <span style="font-weight:600;">${s.from}</span>
                <span class="settlement-arrow">→</span>
                <span style="font-weight:600;">${s.to}</span>
                <span class="settlement-amount">₹${s.amount.toLocaleString('en-IN')}</span>
              </div>`
            ).join('')}
          </div>`;
      } else {
        settlementsContainer.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">All settled up! 🎉</p>`;
      }
    } catch (err) {
      balancesContainer.innerHTML = `<p style="color:var(--danger);">Failed to load balances</p>`;
    }
  },

  // ── Create Group Modal ──
  openCreateModal() {
    document.getElementById('create-group-modal').querySelector('.modal-overlay').classList.add('active');
    document.getElementById('create-group-form').reset();
  },

  closeCreateModal() {
    document.getElementById('create-group-modal').querySelector('.modal-overlay').classList.remove('active');
  },

  async handleCreateGroup(e) {
    e.preventDefault();
    const name = document.getElementById('group-name').value.trim();
    const memberIdsRaw = document.getElementById('group-member-ids').value.trim();

    if (!name) {
      toast.show('Enter a group name', 'error');
      return;
    }

    const memberIds = memberIdsRaw
      ? memberIdsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      await api.createGroup(name, memberIds);
      toast.show('Group created!', 'success');
      this.closeCreateModal();
      await this.load();
      this.render();
    } catch (err) {
      toast.show(err.message || 'Failed to create group', 'error');
    }
  },

  // ── Add Group Expense Modal ──
  openExpenseModal() {
    if (!this.currentGroupId) return;
    document.getElementById('group-expense-modal').querySelector('.modal-overlay').classList.add('active');
    document.getElementById('group-expense-form').reset();
    document.getElementById('group-expense-date').value = new Date().toISOString().split('T')[0];
  },

  closeExpenseModal() {
    document.getElementById('group-expense-modal').querySelector('.modal-overlay').classList.remove('active');
  },

  async handleAddExpense(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('group-expense-amount').value);
    const description = document.getElementById('group-expense-desc').value.trim();
    const date = document.getElementById('group-expense-date').value;

    if (isNaN(amount) || amount <= 0) {
      toast.show('Enter a valid amount', 'error');
      return;
    }

    try {
      await api.addGroupExpense(this.currentGroupId, { amount, description, date });
      toast.show('Group expense added!', 'success');
      this.closeExpenseModal();
      await this.loadBalances(this.currentGroupId);
    } catch (err) {
      toast.show(err.message || 'Failed to add expense', 'error');
    }
  },
};
