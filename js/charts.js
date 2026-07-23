/* ═══════════════════════════════════════════════════════
   CHARTS MODULE — Chart.js Pie & Bar
   ═══════════════════════════════════════════════════════ */

const charts = {
  pieChart: null,
  barChart: null,

  colors: [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#3b82f6', '#14b8a6',
    '#a855f7', '#0ea5e9', '#22c55e', '#eab308',
  ],

  /** Destroy existing chart instance before re-creating */
  destroyPie() {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
  },

  destroyBar() {
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
  },

  /** Doughnut chart — spending by category */
  renderPie(canvasId, data) {
    this.destroyPie();
    const canvas = document.getElementById(canvasId);
    if (!canvas || data.length === 0) {
      const wrapper = canvas?.parentElement;
      if (wrapper) wrapper.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px 0;">No data for this period</p>`;
      return;
    }

    const ctx = canvas.getContext('2d');
    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: this.colors.slice(0, data.length),
          borderColor: 'rgba(10,14,26,0.8)',
          borderWidth: 2,
          hoverBorderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Inter', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(17,24,39,0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            bodyFont: { family: 'Inter' },
            callbacks: {
              label(ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ₹${ctx.parsed.toLocaleString('en-IN')} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  },

  /** Bar chart — monthly trend */
  renderBar(canvasId, data) {
    this.destroyBar();
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(139,92,246,0.6)');
    gradient.addColorStop(1, 'rgba(6,182,212,0.1)');

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => monthNames[d.month - 1]),
        datasets: [{
          label: 'Spending',
          data: data.map(d => d.total),
          backgroundColor: gradient,
          borderColor: '#8b5cf6',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(139,92,246,0.8)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17,24,39,0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            bodyFont: { family: 'Inter' },
            callbacks: {
              label(ctx) {
                return ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 11 },
            },
          },
          y: {
            grid: {
              color: 'rgba(255,255,255,0.04)',
              drawBorder: false,
            },
            ticks: {
              color: '#64748b',
              font: { family: 'Inter', size: 11 },
              callback(val) { return '₹' + val.toLocaleString('en-IN'); },
            },
          },
        },
      },
    });
  },
};
