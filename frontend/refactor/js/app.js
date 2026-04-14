(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var store = root.store;
  var api = root.api;
  var ui = root.ui;
  var config = root.config;
  var hasStarted = false;
  var bootLoaderTimer = null;

  function cancelBootLoader() {
    if (bootLoaderTimer) {
      global.clearTimeout(bootLoaderTimer);
      bootLoaderTimer = null;
    }
    ui.hideLoader();
  }

  function readTheme() {
    try {
      return localStorage.getItem(config.storageKeys.theme) || 'dark';
    } catch (_error) {
      return 'dark';
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(config.storageKeys.theme, theme);
    } catch (_error) { }
  }

  function initTheme() {
    var theme = readTheme();
    store.patchState({ theme: theme });
    ui.syncTheme(theme);
  }

  function toggleTheme() {
    var state = store.getState();
    var next = state.theme === 'light' ? 'dark' : 'light';
    store.patchState({ theme: next });
    writeTheme(next);
    ui.syncTheme(next);
  }

  function bindNavigation() {
    document.getElementById('nav-main').addEventListener('click', function (event) {
      var target = event.target.closest('[data-view]');
      if (!target) return;
      navigate(target.getAttribute('data-view'));
    });
  }

  function navigate(view) {
    store.patchState({ view: view });
    ui.showView(view);
    ui.setStatus('Vista ' + view + ' activa', 'info');
    api.loadViewData(view).then(function (data) {
      if (view === 'dashboard') {
        ui.renderDashboard(data || {});
      } else if (view === 'lista') {
        var listView = document.getElementById('list-view');
        if (listView) listView.innerHTML = ui.renderEmptyState('Vista de cotizaciones lista para enlazar.');
      } else if (view === 'clientes') {
        var clientsView = document.getElementById('clients-view');
        if (clientsView) clientsView.innerHTML = ui.renderEmptyState('Vista de clientes lista para enlazar.');
      } else if (view === 'items') {
        var catalogView = document.getElementById('catalog-view');
        if (catalogView) catalogView.innerHTML = ui.renderEmptyState('Vista de catálogo lista para enlazar.');
      } else if (view === 'trabajadores') {
        var workersView = document.getElementById('workers-view');
        if (workersView) workersView.innerHTML = ui.renderEmptyState('Vista de trabajadores lista para enlazar.');
      } else if (view === 'contratos') {
        var contractsView = document.getElementById('contracts-view');
        if (contractsView) contractsView.innerHTML = ui.renderEmptyState('Vista de contratos lista para enlazar.');
      }
      return data;
    }).catch(function (error) {
      ui.toast('Error', error.message, 'error');
      ui.setStatus('Error cargando ' + view, 'error');
    });
  }

  function bindActions() {
    document.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (!action) return;

      if (action === 'start-app') {
        startApp();
      } else if (action === 'toggle-sidebar') {
        ui.toggleSidebar();
      } else if (action === 'toggle-theme') {
        toggleTheme();
      } else if (action === 'refresh') {
        boot(true);
      }
    });
  }

  function startApp() {
    if (hasStarted) return;
    hasStarted = true;

    var startScreen = document.getElementById('start-screen');
    var appShell = document.getElementById('app-shell');
    if (startScreen) startScreen.hidden = true;
    if (appShell) appShell.hidden = false;

    boot(false);
  }

  function restoreSidebar() {
    try {
      ui.toggleSidebar(localStorage.getItem(config.storageKeys.sidebar) === '1');
    } catch (_error) { }
  }

  function boot(force) {
    bootLoaderTimer = global.setTimeout(function () {
      ui.showLoader('Preparando interfaz...');
    }, 450);

    if (!api || typeof api.loadInitialData !== 'function') {
      cancelBootLoader();
      ui.setStatus('Inicialización incompleta del cliente', 'error');
      ui.toast('Error inicial', 'No se pudo inicializar la capa de API del frontend.', 'error');
      return;
    }

    api.loadInitialData(force).then(function (initial) {
      cancelBootLoader();
      ui.setStatus('Datos iniciales cargados', 'ok');
      if (initial && initial.ok === false) {
        ui.toast('Aviso', 'La respuesta inicial reportó una condición no óptima.', 'warn');
      }
      navigate(store.getState().view || 'dashboard');
    }).catch(function (error) {
      cancelBootLoader();
      ui.setStatus('Arranque incompleto', 'error');
      ui.toast('Error inicial', error.message, 'error');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindNavigation();
    bindActions();
    initTheme();
    restoreSidebar();
    ui.showView('dashboard');

    var autoStart = false;
    try {
      autoStart = global.location && global.location.search.indexOf('autoStart=1') >= 0;
    } catch (_error) { }
    if (autoStart) startApp();
  });
})(window);
