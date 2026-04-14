(function (w) {
  'use strict';
  var root = w.TripleAFrontend = w.TripleAFrontend || {};
  var config = root.config;

  /* ─── Utilidades DOM ──────────────────────────────────────────────── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function setText(sel, val) { var n = qs(sel); if (n) n.textContent = val; }

  /* ─── Vistas ──────────────────────────────────────────────────────── */
  function showView(view, path) {
    qsa('[data-view-panel]').forEach(function (n) {
      n.classList.toggle('is-active', n.getAttribute('data-view-panel') === view);
    });
    qsa('[data-view]').forEach(function (n) {
      n.classList.toggle('is-active', n.getAttribute('data-view') === view);
    });
    if (path) {
      qsa('[data-route]').forEach(function (n) {
        n.classList.toggle('is-active', n.getAttribute('data-route') === path);
      });
    }
    var titles = config && config.viewTitles ? config.viewTitles : {};
    setText('#view-title', titles[view] || view);
  }

  /* ─── Status bar ──────────────────────────────────────────────────── */
  function setStatus(msg, tone) {
    var bar = document.getElementById('status-bar');
    if (!bar) return;
    bar.innerHTML = '<span class="status-pill">' + String(msg || '') + '</span>';
    if (tone) bar.dataset.tone = tone;
  }

  /* ─── Toast ───────────────────────────────────────────────────────── */
  function toast(title, text, type) {
    var stack = document.getElementById('toast-stack');
    if (!stack) return;
    var node = document.createElement('div');
    node.className = 'toast toast--' + (type || 'ok');
    node.innerHTML = '<p class="toast__title">' + title + '</p><p class="toast__text">' + (text || '') + '</p>';
    stack.appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 2800);
  }

  /* ─── Tema / sidebar ──────────────────────────────────────────────── */
  function syncTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
  }

  function toggleSidebar(forceCollapsed) {
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    var collapsed = typeof forceCollapsed === 'boolean'
      ? forceCollapsed
      : !shell.classList.contains('is-collapsed');
    shell.classList.toggle('is-collapsed', collapsed);
    try { localStorage.setItem(config && config.storageKeys.sidebar, collapsed ? '1' : '0'); } catch (_) {}
  }

  /* ─── Loader ──────────────────────────────────────────────────────── */
  function showLoader(msg) { void msg; }
  function hideLoader() {}

  /* ─── Renderizado de tablas ───────────────────────────────────────── */
  function renderEmptyState(msg) {
    return '<div class="empty-state">' + String(msg || '') + '</div>';
  }

  function renderMetric(label, value, meta) {
    return '<article class="metric">' +
      '<span class="metric__label">' + label + '</span>' +
      '<strong class="metric__value">' + value + '</strong>' +
      (meta ? '<span class="metric__meta">' + meta + '</span>' : '') +
      '</article>';
  }

  function renderTable(headers, rows) {
    var thead = '<thead><tr>' + headers.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + (rows.length
      ? rows.join('')
      : '<tr><td colspan="' + headers.length + '">' + renderEmptyState('Sin datos') + '</td></tr>') + '</tbody>';
    return '<table class="table">' + thead + tbody + '</table>';
  }

  function renderViewCollection(containerId, data, options) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var opts     = options || {};
    var empty    = opts.emptyMessage || 'Sin datos disponibles.';
    var preferred = opts.preferredColumns || [];
    var items    = Array.isArray(data) ? data : [];

    if (!items.length) { container.innerHTML = renderEmptyState(empty); return; }

    var allKeys = Object.keys(items[0] || {});
    var columns = preferred.filter(function (c) { return allKeys.indexOf(c) >= 0; });
    allKeys.forEach(function (k) { if (columns.indexOf(k) < 0) columns.push(k); });
    if (!columns.length) columns = allKeys;

    var headers = columns.map(function (c) { return c.charAt(0).toUpperCase() + c.slice(1); });
    var rows = items.map(function (item) {
      return '<tr>' + columns.map(function (c) {
        var v = item[c]; if (v === null || v === undefined) v = '';
        return '<td>' + String(v) + '</td>';
      }).join('') + '</tr>';
    });
    container.innerHTML = renderTable(headers, rows);
  }

  /* ─── Dashboard ───────────────────────────────────────────────────── */
  function renderDashboard(data) {
    var metrics = document.getElementById('dashboard-metrics');
    if (metrics) {
      var cots  = (data && data.cotizaciones)  || [];
      var cons  = (data && data.contratos && data.contratos.contratos) ? data.contratos.contratos : [];
      var trabs = (data && data.trabajadores) || [];
      metrics.innerHTML = [
        renderMetric('Cotizaciones activas', String(cots.length),  'Vista inicial'),
        renderMetric('Contratos activos',    String(cons.length),  'Respuesta unificada'),
        renderMetric('Trabajadores',         String(trabs.length), 'Resumen optimizado'),
        renderMetric('Caché', 'OK', 'Peticiones deduplicadas')
      ].join('');
    }
    var st = document.getElementById('dashboard-status-table');
    if (st) st.innerHTML = renderEmptyState('Conectar render del estado con datos reales.');
    var ct = document.getElementById('dashboard-contracts-table');
    if (ct) ct.innerHTML = renderEmptyState('Conectar ranking de contratos con el backend.');
  }

  /* ─── Exportación ─────────────────────────────────────────────────── */
  root.ui = {
    showView:             showView,
    setStatus:            setStatus,
    toast:                toast,
    syncTheme:            syncTheme,
    toggleSidebar:        toggleSidebar,
    showLoader:           showLoader,
    hideLoader:           hideLoader,
    renderEmptyState:     renderEmptyState,
    renderMetric:         renderMetric,
    renderTable:          renderTable,
    renderViewCollection: renderViewCollection,
    renderDashboard:      renderDashboard
  };
})(window);
