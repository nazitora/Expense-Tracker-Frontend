/* ═══════════════════════════════════════════════════════
   DASHBOARD MODULE — Summary cards + Charts
   ═══════════════════════════════════════════════════════ */

const dashboard = {
  async refresh() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Update filter display
    const monthLabel = document.getElementById('dashboard-month-label');
    if (monthLabel) {
      const monthNames = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      monthLabel.textContent = `${monthNames[month - 1]} ${year}`;
    }

    this.showLoading(true);

    try {
      const [summary, byCategory, trend] = await Promise.all([
        api.getSummary(month, year),
        api.getSpendingByCategory(month, year),
        api.getMonthlyTrend(year),
      ]);

      this.renderStats(summary);
      charts.renderPie('pie-chart', byCategory);
      charts.renderBar('bar-chart', trend);
    } catch (err) {
      toast.show('Failed to load dashboard data', 'error');
    } finally {
      this.showLoading(false);
    }
  },

  renderStats(summary) {
    const totalEl = document.getElementById('stat-total');
    const countEl = document.getElementById('stat-count');
    const avgEl = document.getElementById('stat-avg');

    if (totalEl) this.animateValue(totalEl, summary.totalSpent, '₹');
    if (countEl) this.animateValue(countEl, summary.transactionCount, '', true);
    if (avgEl) this.animateValue(avgEl, summary.averagePerTransaction, '₹');
  },

  /** Simple count-up animation */
  animateValue(el, target, prefix = '', isInt = false) {
    const duration = 800;
    const startTime = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;

      if (isInt) {
        el.textContent = `${prefix}${Math.round(current).toLocaleString('en-IN')}`;
      } else {
        el.textContent = `${prefix}${current.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  },

  showLoading(show) {
    const loader = document.getElementById('dashboard-loader');
    const content = document.getElementById('dashboard-content');
    if (loader) loader.style.display = show ? 'flex' : 'none';
    if (content) content.style.display = show ? 'none' : 'block';
  },
};
