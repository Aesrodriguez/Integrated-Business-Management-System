(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var config = root.config;

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setText(selector, value, parent) {
    var node = qs(selector, parent);
    if (node) node.textContent = value;
  }

  function renderMetric(label, value, meta) {
    return '<article class="metric">' +
      '<span class="metric__label">' + label + '</span>' +
      '<strong class="metric__value">' + value + '</strong>' +
      (meta ? '<span class="metric__meta">' + meta + '</span>' : '') +
      '</article>';
  }

  function renderEmptyState(message) {
    return '<div class="empty-state">' + message + '</div>';
  }

  function renderSkeletonRows(count) {
    var rows = [];
    for (var index = 0; index < count; index += 1) {
      rows.push('<tr><td colspan="4"><div class="skeleton" style="min-height:52px"></div></td></tr>');
    }
    return '<table class="table"><tbody>' + rows.join('') + '</tbody></table>';
  }

  function renderTable(headers, rows) {
    var thead = '<thead><tr>' + headers.map(function (header) { return '<th>' + header + '</th>'; }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + (rows.length ? rows.join('') : '<tr><td colspan="' + headers.length + '"><div class="empty-state">Sin datos</div></td></tr>') + '</tbody>';
    return '<table class="table">' + thead + tbody + '</table>';
  }

  function toast(title, text, type) {
    var stack = document.getElementById('toast-stack');
    if (!stack) return;
    var node = document.createElement('div');
    node.className = 'toast toast--' + (type || 'ok');
    node.innerHTML = '<p class="toast__title">' + title + '</p><p class="toast__text">' + text + '</p>';
    stack.appendChild(node);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 2800);
  }

  function showLoader(message) {
    var loader = document.getElementById('loader');
    var text = document.getElementById('loader-text');
    if (text) text.textContent = message || 'Cargando...';
    if (loader) loader.hidden = false;
  }

  function hideLoader() {
    var loader = document.getElementById('loader');
    if (loader) loader.hidden = true;
  }

  function showView(view) {
    qsa('[data-view-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-view-panel') === view);
    });

    qsa('[data-view]').forEach(function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-view') === view);
    });

    setText('#view-title', config.viewTitles[view] || view);
  }

  function syncTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
  }

  function toggleSidebar(forceCollapsed) {
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    var collapsed = typeof forceCollapsed === 'boolean' ? forceCollapsed : !shell.classList.contains('is-collapsed');
    shell.classList.toggle('is-collapsed', collapsed);
    try {
      localStorage.setItem(config.storageKeys.sidebar, collapsed ? '1' : '0');
    } catch (_error) { }
  }

  function setStatus(message, tone) {
    var bar = document.getElementById('status-bar');
    if (!bar) return;
    bar.innerHTML = '<span class="status-pill">' + message + '</span>';
    if (tone) bar.dataset.tone = tone;
  }

  function renderDashboard(data) {
    var metrics = document.getElementById('dashboard-metrics');
    if (metrics) {
      var cotizaciones = data.cotizaciones || [];
      var contratos = (data.contratos && data.contratos.contratos) ? data.contratos.contratos : [];
      var trabajadores = data.trabajadores || [];
      metrics.innerHTML = [
        renderMetric('Cotizaciones activas', String(cotizaciones.length), 'Vista inicial'),
        renderMetric('Contratos activos', String(contratos.length), 'Respuesta unificada'),
        renderMetric('Trabajadores', String(trabajadores.length), 'Resumen optimizado'),
        renderMetric('Caché', 'OK', 'Peticiones deduplicadas')
      ].join('');
    }

    var statusTable = document.getElementById('dashboard-status-table');
    if (statusTable) {
      statusTable.innerHTML = renderEmptyState('Conectar el render del estado con los datos reales de cotizaciones.');
    }

    var contractsTable = document.getElementById('dashboard-contracts-table');
    if (contractsTable) {
      contractsTable.innerHTML = renderEmptyState('Conectar el ranking de contratos con el backend.');
    }
  }

  root.ui = {
    qs: qs,
    qsa: qsa,
    setText: setText,
    renderMetric: renderMetric,
    renderEmptyState: renderEmptyState,
    renderSkeletonRows: renderSkeletonRows,
    renderTable: renderTable,
    toast: toast,
    showLoader: showLoader,
    hideLoader: hideLoader,
    showView: showView,
    syncTheme: syncTheme,
    toggleSidebar: toggleSidebar,
    setStatus: setStatus,
    renderDashboard: renderDashboard
  };
})(window);
(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var config = root.config;

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setText(selector, value, parent) {
    var node = qs(selector, parent);
    if (node) node.textContent = value;
  }

  function renderMetric(label, value, meta) {
    return '<article class="metric">' +
      '<span class="metric__label">' + label + '</span>' +
      '<strong class="metric__value">' + value + '</strong>' +
      (meta ? '<span class="metric__meta">' + meta + '</span>' : '') +
      '</article>';
  }

  function renderEmptyState(message) {
    return '<div class="empty-state">' + message + '</div>';
  }

  function renderSkeletonRows(count) {
    var rows = [];
    for (var index = 0; index < count; index += 1) {
      rows.push('<tr><td colspan="4"><div class="skeleton" style="min-height:52px"></div></td></tr>');
    }
    return '<table class="table"><tbody>' + rows.join('') + '</tbody></table>';
  }

  function renderTable(headers, rows) {
    var thead = '<thead><tr>' + headers.map(function (header) {
      return '<th>' + header + '</th>';
    }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + (rows.length ? rows.join('') : '<tr><td colspan="' + headers.length + '"><div class="empty-state">Sin datos</div></td></tr>') + '</tbody>';
    return '<table class="table">' + thead + tbody + '</table>';
  }

  function toast(title, text, type) {
    var stack = document.getElementById('toast-stack');
    if (!stack) return;
    var node = document.createElement('div');
    node.className = 'toast toast--' + (type || 'ok');
    node.innerHTML = '<p class="toast__title">' + title + '</p><p class="toast__text">' + text + '</p>';
    stack.appendChild(node);
    setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 2800);
  }

  function showLoader(message) {
    var loader = document.getElementById('loader');
    var text = document.getElementById('loader-text');
    if (text) text.textContent = message || 'Cargando...';
    if (loader) loader.hidden = false;
  }

  function hideLoader() {
    var loader = document.getElementById('loader');
    if (loader) loader.hidden = true;
  }

  function showView(view) {
    qsa('[data-view-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-view-panel') === view);
    });

    qsa('[data-view]').forEach(function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-view') === view);
    });

    setText('#view-title', config.viewTitles[view] || view);
  }

  function syncTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
  }

  function toggleSidebar(forceCollapsed) {
    var shell = document.getElementById('app-shell');
    if (!shell) return;
    var collapsed = typeof forceCollapsed === 'boolean' ? forceCollapsed : !shell.classList.contains('is-collapsed');
    shell.classList.toggle('is-collapsed', collapsed);
    try {
      localStorage.setItem(config.storageKeys.sidebar, collapsed ? '1' : '0');
    } catch (_error) { }
  }

  function setStatus(message, tone) {
    var bar = document.getElementById('status-bar');
    if (!bar) return;
    bar.innerHTML = '<span class="status-pill">' + message + '</span>';
    if (tone) bar.dataset.tone = tone;
  }

  function renderDashboard(data) {
    var metrics = document.getElementById('dashboard-metrics');
    if (metrics) {
      var cotizaciones = data.cotizaciones || [];
      var contratos = (data.contratos && data.contratos.contratos) ? data.contratos.contratos : [];
      var trabajadores = data.trabajadores || [];
      metrics.innerHTML = [
        renderMetric('Cotizaciones activas', String(cotizaciones.length), 'Vista inicial'),
        renderMetric('Contratos activos', String(contratos.length), 'Respuesta unificada'),
        renderMetric('Trabajadores', String(trabajadores.length), 'Resumen optimizado'),
        renderMetric('Caché', 'OK', 'Peticiones deduplicadas')
      ].join('');
    }

    var statusTable = document.getElementById('dashboard-status-table');
    if (statusTable) {
      statusTable.innerHTML = renderEmptyState('Conectar el render del estado con los datos reales de cotizaciones.');
    }

    var contractsTable = document.getElementById('dashboard-contracts-table');
    if (contractsTable) {
      contractsTable.innerHTML = renderEmptyState('Conectar el ranking de contratos con el backend.');
    }
  }

  root.ui = {
    qs: qs,
    qsa: qsa,
    setText: setText,
    renderMetric: renderMetric,
    renderEmptyState: renderEmptyState,
    renderSkeletonRows: renderSkeletonRows,
    renderTable: renderTable,
    toast: toast,
    showLoader: showLoader,
    hideLoader: hideLoader,
    showView: showView,
    syncTheme: syncTheme,
    toggleSidebar: toggleSidebar,
    setStatus: setStatus,
    renderDashboard: renderDashboard
  };
})(window);
