/* === DN TikTok Dataset Explorer === */

(function () {
  'use strict';

  // --- State ---
  let allData = [];
  let filtered = [];
  let currentPage = 1;
  const PAGE_SIZE = 25;
  let sortCol = 'date';
  let sortDir = -1; // -1 = desc
  let activeHashtag = '';
  let timelineChart = null;

  // --- Theme Toggle ---
  (function () {
    const t = document.querySelector('[data-theme-toggle]');
    const r = document.documentElement;
    let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    r.setAttribute('data-theme', d);
    if (t) {
      updateToggleIcon(t, d);
      t.addEventListener('click', () => {
        d = d === 'dark' ? 'light' : 'dark';
        r.setAttribute('data-theme', d);
        t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
        updateToggleIcon(t, d);
        if (timelineChart) updateChartColors();
      });
    }
    function updateToggleIcon(btn, theme) {
      btn.innerHTML = theme === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  })();

  // --- Load Data ---
  fetch('./data.json')
    .then(r => r.json())
    .then(data => {
      allData = data;
      initApp();
    })
    .catch(err => {
      document.getElementById('loading-state').innerHTML =
        '<p style="color:var(--color-error)">Failed to load dataset. Please refresh the page.</p>';
      console.error(err);
    });

  function initApp() {
    populateStats();
    populateFilters();
    buildChart();
    bindEvents();
    applyFilters();

    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('table-wrap').style.display = '';
  }

  // --- Stats ---
  function populateStats() {
    const uniqueHashtags = new Set();
    const months = new Set();
    allData.forEach(r => {
      months.add(r.ym);
      r.hashtags.split(',').forEach(h => {
        h = h.trim();
        if (h) uniqueHashtags.add(h);
      });
    });

    animateNumber('stat-videos', allData.length);
    animateNumber('stat-months', months.size);
    animateNumber('stat-hashtags', uniqueHashtags.size);
  }

  function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const duration = 800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // --- Filters ---
  function populateFilters() {
    const ymSet = new Set();
    const hashtagCount = {};

    allData.forEach(r => {
      ymSet.add(r.ym);
      r.hashtags.split(',').forEach(h => {
        h = h.trim();
        if (h) hashtagCount[h] = (hashtagCount[h] || 0) + 1;
      });
    });

    // Year-month select
    const ymSelect = document.getElementById('filter-ym');
    Array.from(ymSet).sort().reverse().forEach(ym => {
      const opt = document.createElement('option');
      opt.value = ym;
      const [y, m] = ym.split('-');
      const monthName = new Date(y, parseInt(m) - 1).toLocaleString('en', { month: 'short' });
      opt.textContent = `${monthName} ${y}`;
      ymSelect.appendChild(opt);
    });

    // Top hashtag suggestions
    const topHashtags = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const sugContainer = document.getElementById('hashtag-suggestions');
    topHashtags.forEach(([tag, count]) => {
      const chip = document.createElement('button');
      chip.className = 'hashtag-chip';
      chip.textContent = `#${tag}`;
      chip.title = `${count} videos`;
      chip.dataset.tag = tag;
      chip.addEventListener('click', () => {
        if (activeHashtag === tag) {
          activeHashtag = '';
          document.getElementById('filter-hashtag').value = '';
          chip.classList.remove('active');
        } else {
          activeHashtag = tag;
          document.getElementById('filter-hashtag').value = tag;
          sugContainer.querySelectorAll('.hashtag-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
        currentPage = 1;
        applyFilters();
      });
      sugContainer.appendChild(chip);
    });
  }

  // --- Events ---
  function bindEvents() {
    document.getElementById('filter-ym').addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });

    let debounceTimer;
    document.getElementById('filter-hashtag').addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeHashtag = e.target.value.trim().toLowerCase().replace(/^#/, '');
        // Update chip highlights
        document.querySelectorAll('.hashtag-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.tag === activeHashtag);
        });
        currentPage = 1;
        applyFilters();
      }, 200);
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      document.getElementById('filter-ym').value = '';
      document.getElementById('filter-hashtag').value = '';
      activeHashtag = '';
      document.querySelectorAll('.hashtag-chip').forEach(c => c.classList.remove('active'));
      currentPage = 1;
      applyFilters();
    });

    document.getElementById('export-btn').addEventListener('click', exportCSV);

    // Sort headers
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortCol === col) {
          sortDir *= -1;
        } else {
          sortCol = col;
          sortDir = col === 'date' ? -1 : 1;
        }
        updateSortIndicators();
        applyFilters();
      });
    });
  }

  function updateSortIndicators() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      const col = th.dataset.sort;
      th.classList.toggle('sorted', col === sortCol);
      const icon = th.querySelector('.sort-icon');
      if (col === sortCol) {
        icon.textContent = sortDir === 1 ? '↑' : '↓';
      } else {
        icon.textContent = '↕';
      }
    });
  }

  // --- Apply Filters ---
  function applyFilters() {
    const ymVal = document.getElementById('filter-ym').value;
    const hashVal = activeHashtag;

    filtered = allData.filter(r => {
      if (ymVal && r.ym !== ymVal) return false;
      if (hashVal) {
        const tags = r.hashtags.toLowerCase();
        if (!tags.split(',').some(t => t.trim().includes(hashVal))) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let va = a[sortCol] || '';
      let vb = b[sortCol] || '';
      if (sortCol === 'date') {
        return (va < vb ? -1 : va > vb ? 1 : 0) * sortDir;
      }
      return va.localeCompare(vb) * sortDir;
    });

    renderResults();
  }

  // --- Render ---
  function renderResults() {
    const countEl = document.getElementById('results-count');
    const tableWrap = document.getElementById('table-wrap');
    const emptyState = document.getElementById('empty-state');
    const paginationEl = document.getElementById('pagination');
    const tbody = document.getElementById('table-body');

    countEl.innerHTML = `Showing <strong>${filtered.length.toLocaleString()}</strong> of ${allData.length.toLocaleString()} videos`;

    if (filtered.length === 0) {
      tableWrap.style.display = 'none';
      emptyState.style.display = '';
      paginationEl.style.display = 'none';
      return;
    }

    tableWrap.style.display = '';
    emptyState.style.display = 'none';

    // Paginate
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageData = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    // Build rows
    tbody.innerHTML = '';
    const hashVal = activeHashtag;

    pageData.forEach(r => {
      const tr = document.createElement('tr');

      // ID
      const tdId = document.createElement('td');
      tdId.className = 'cell-id';
      tdId.textContent = r.id;
      tr.appendChild(tdId);

      // Date
      const tdDate = document.createElement('td');
      tdDate.className = 'cell-date';
      tdDate.textContent = r.date;
      tr.appendChild(tdDate);

      // Desc
      const tdDesc = document.createElement('td');
      tdDesc.className = 'cell-desc';
      tdDesc.textContent = r.desc;
      tr.appendChild(tdDesc);

      // Hashtags
      const tdHash = document.createElement('td');
      tdHash.className = 'cell-hashtags';
      if (r.hashtags) {
        const seen = new Set();
        r.hashtags.split(',').forEach(h => {
          h = h.trim();
          if (!h || seen.has(h)) return;
          seen.add(h);
          const span = document.createElement('span');
          span.className = 'tag';
          if (hashVal && h.toLowerCase().includes(hashVal)) {
            span.classList.add('highlight');
          }
          span.textContent = h;
          tdHash.appendChild(span);
        });
      }
      tr.appendChild(tdHash);

      tbody.appendChild(tr);
    });

    // Pagination
    if (totalPages > 1) {
      paginationEl.style.display = '';
      renderPagination(totalPages);
    } else {
      paginationEl.style.display = 'none';
    }
  }

  function renderPagination(totalPages) {
    const el = document.getElementById('pagination');
    el.innerHTML = '';

    // Prev
    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { currentPage--; renderResults(); scrollToResults(); });
    el.appendChild(prev);

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      el.appendChild(createPageBtn(1));
      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.className = 'page-info';
        dots.textContent = '...';
        el.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      el.appendChild(createPageBtn(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.className = 'page-info';
        dots.textContent = '...';
        el.appendChild(dots);
      }
      el.appendChild(createPageBtn(totalPages));
    }

    // Next
    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { currentPage++; renderResults(); scrollToResults(); });
    el.appendChild(next);
  }

  function createPageBtn(num) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (num === currentPage ? ' active' : '');
    btn.textContent = num;
    btn.addEventListener('click', () => { currentPage = num; renderResults(); scrollToResults(); });
    return btn;
  }

  function scrollToResults() {
    document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Chart ---
  function buildChart() {
    const ymCounts = {};
    allData.forEach(r => {
      ymCounts[r.ym] = (ymCounts[r.ym] || 0) + 1;
    });

    const labels = Object.keys(ymCounts).sort();
    const values = labels.map(ym => ymCounts[ym]);

    const ctx = document.getElementById('timeline-chart');
    if (!ctx) return;

    const cs = getComputedStyle(document.documentElement);
    const primaryColor = cs.getPropertyValue('--color-primary').trim();
    const mutedColor = cs.getPropertyValue('--color-text-faint').trim();
    const dividerColor = cs.getPropertyValue('--color-divider').trim();

    timelineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(ym => {
          const [y, m] = ym.split('-');
          return new Date(y, parseInt(m) - 1).toLocaleString('en', { month: 'short', year: '2-digit' });
        }),
        datasets: [{
          data: values,
          backgroundColor: primaryColor + '88',
          hoverBackgroundColor: primaryColor,
          borderRadius: 2,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cs.getPropertyValue('--color-surface').trim(),
            titleColor: cs.getPropertyValue('--color-text').trim(),
            bodyColor: cs.getPropertyValue('--color-text-muted').trim(),
            borderColor: dividerColor,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => {
                const idx = items[0].dataIndex;
                const [y, m] = labels[idx].split('-');
                return new Date(y, parseInt(m) - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
              },
              label: (item) => `${item.raw} videos`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: mutedColor,
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 16
            },
            border: { display: false }
          },
          y: {
            grid: { color: dividerColor, lineWidth: 0.5 },
            ticks: {
              color: mutedColor,
              font: { size: 10 },
              padding: 8
            },
            border: { display: false },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const ym = labels[idx];
            document.getElementById('filter-ym').value = ym;
            currentPage = 1;
            applyFilters();
            document.querySelector('.filters-section').scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }

  function updateChartColors() {
    if (!timelineChart) return;
    const cs = getComputedStyle(document.documentElement);
    const primaryColor = cs.getPropertyValue('--color-primary').trim();
    const mutedColor = cs.getPropertyValue('--color-text-faint').trim();
    const dividerColor = cs.getPropertyValue('--color-divider').trim();

    timelineChart.data.datasets[0].backgroundColor = primaryColor + '88';
    timelineChart.data.datasets[0].hoverBackgroundColor = primaryColor;
    timelineChart.options.scales.x.ticks.color = mutedColor;
    timelineChart.options.scales.y.ticks.color = mutedColor;
    timelineChart.options.scales.y.grid.color = dividerColor;
    timelineChart.options.plugins.tooltip.backgroundColor = cs.getPropertyValue('--color-surface').trim();
    timelineChart.options.plugins.tooltip.titleColor = cs.getPropertyValue('--color-text').trim();
    timelineChart.options.plugins.tooltip.bodyColor = cs.getPropertyValue('--color-text-muted').trim();
    timelineChart.options.plugins.tooltip.borderColor = dividerColor;
    timelineChart.update('none');
  }

  // --- Export ---
  function exportCSV() {
    if (filtered.length === 0) return;

    const header = 'hashed_videoId_prefix,date,description,hashtags\n';
    const rows = filtered.map(r => {
      const desc = '"' + (r.desc || '').replace(/"/g, '""') + '"';
      const tags = '"' + (r.hashtags || '').replace(/"/g, '""') + '"';
      return `${r.id},${r.date},${desc},${tags}`;
    });

    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiktok_dataset_filtered.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

})();
