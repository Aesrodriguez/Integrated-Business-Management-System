(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var store = root.store;
  var api = root.api;
  var ui = root.ui;
  var config = root.config;
  var hasStarted = false;
  var bootLoaderTimer = null;
  var bootFailSafeTimer = null;
  var authStorageKey = 'triplea.auth';

  function cancelBootLoader() {
    if (bootLoaderTimer) {
      global.clearTimeout(bootLoaderTimer);
      bootLoaderTimer = null;
    }
    if (bootFailSafeTimer) {
      global.clearTimeout(bootFailSafeTimer);
      bootFailSafeTimer = null;
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
    document.addEventListener('click', function (event) {
      var folderTitle = event.target.closest('.folder__title');
      if (folderTitle) {
        var folder = folderTitle.closest('.folder');
        if (folder) folder.classList.toggle('is-collapsed');
        return;
      }

      var target = event.target.closest('[data-view]');
      if (!target) return;
      if (!target.closest('#nav-main') && !target.closest('#workspace-tabs')) return;
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
        ui.renderViewCollection('list-view', data, {
          preferredColumns: ['id', 'codigo', 'estado', 'cliente', 'fecha'],
          emptyMessage: 'No hay cotizaciones disponibles en este entorno.'
        });
      } else if (view === 'clientes') {
        ui.renderViewCollection('clients-view', data, {
          preferredColumns: ['id', 'codigo', 'nombre', 'telefono', 'email'],
          emptyMessage: 'No hay clientes disponibles en este entorno.'
        });
      } else if (view === 'items') {
        ui.renderViewCollection('catalog-view', data, {
          preferredColumns: ['id', 'codigo', 'nombre', 'categoria', 'precio'],
          emptyMessage: 'No hay items de catálogo disponibles en este entorno.'
        });
      } else if (view === 'trabajadores') {
        ui.renderViewCollection('workers-view', data, {
          preferredColumns: ['id', 'codigo', 'nombre', 'cargo', 'telefono', 'email'],
          emptyMessage: 'No hay trabajadores disponibles en este entorno.'
        });
      } else if (view === 'contratos') {
        ui.renderViewCollection('contracts-view', data, {
          preferredColumns: ['id', 'codigo', 'cliente', 'estado', 'saldo', 'fecha'],
          emptyMessage: 'No hay contratos disponibles en este entorno.'
        });
      }
      return data;
    }).catch(function (error) {
      ui.toast('Error', error.message, 'error');
      ui.setStatus('Error cargando ' + view, 'error');
    });
  }

  function bindActions() {
    var startForm = document.getElementById('start-login-form');
    if (startForm) {
      startForm.addEventListener('submit', function (event) {
        event.preventDefault();
        startApp();
      });
    }

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

  function showStartScreen() {
    var startScreen = document.getElementById('start-screen');
    var appShell = document.getElementById('app-shell');
    if (startScreen) startScreen.hidden = false;
    if (appShell) appShell.hidden = true;
    hasStarted = false;
  }

  function saveAuth(user, pass) {
    try {
      global.sessionStorage.setItem(authStorageKey, JSON.stringify({ user: user, pass: pass }));
    } catch (_error) { }
  }

  function loadSavedAuth() {
    try {
      var raw = global.sessionStorage.getItem(authStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function applyAuthFromInputs() {
    var userNode = document.getElementById('start-auth-user');
    var passNode = document.getElementById('start-auth-pass');
    var user = userNode ? userNode.value.trim() : '';
    var pass = passNode ? passNode.value : '';

    if (!user && !pass) {
      var saved = loadSavedAuth();
      if (saved && saved.user && saved.pass) {
        api.setBasicCredentials(saved.user, saved.pass);
        return true;
      }
      api.setBasicCredentials('', '');
      ui.toast('Credenciales requeridas', 'Debes ingresar usuario y contraseña para entrar al sistema.', 'warn');
      return false;
    }

    if (!user || !pass) {
      ui.toast('Faltan datos', 'Debes diligenciar usuario y contraseña.', 'warn');
      return false;
    }

    api.setBasicCredentials(user, pass);
    saveAuth(user, pass);
    return true;
  }

  function setStartButtonBusy(isBusy) {
    var startBtn = document.querySelector('[data-action="start-app"]');
    if (!startBtn) return;
    startBtn.disabled = !!isBusy;
    startBtn.textContent = isBusy ? 'Validando acceso...' : 'Entrar al sistema';
  }

  function validateCredentialsBeforeStart() {
    return api.request('getTrabajadores', [{ soloResumen: true }], { ttlMs: 0 }).then(function () {
      return true;
    }).catch(function (error) {
      var message = String(error && error.message ? error.message : 'No se pudo validar el acceso.');
      throw new Error(message);
    });
  }

  function startApp() {
    if (hasStarted) return;

    if (!applyAuthFromInputs()) {
      return;
    }

    hasStarted = true;
    setStartButtonBusy(true);
    ui.setStatus('Validando credenciales...', 'info');

    validateCredentialsBeforeStart().then(function () {
      var startScreen = document.getElementById('start-screen');
      var appShell = document.getElementById('app-shell');
      if (startScreen) startScreen.hidden = true;
      if (appShell) appShell.hidden = false;

      setStartButtonBusy(false);
      boot(false);
    }).catch(function (error) {
      hasStarted = false;
      setStartButtonBusy(false);
      ui.setStatus('Acceso denegado', 'error');
      ui.toast('Credenciales inválidas', error.message || 'Verifica usuario/contraseña y vuelve a intentar.', 'error');
    });
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

    bootFailSafeTimer = global.setTimeout(function () {
      cancelBootLoader();
      ui.setStatus('Tiempo de espera agotado. Puedes reintentar.', 'warn');
      ui.toast('Aviso', 'La carga tomó demasiado tiempo. Presiona Actualizar para reintentar.', 'warn');
    }, 12000);

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

      var msg = String(error && error.message ? error.message : '');
      if (msg.indexOf('401') >= 0 || /autentic|credencial/i.test(msg)) {
        showStartScreen();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindNavigation();
    bindActions();
    initTheme();
    restoreSidebar();
    ui.showView('dashboard');

    var saved = loadSavedAuth();
    if (saved) {
      var userNode = document.getElementById('start-auth-user');
      var passNode = document.getElementById('start-auth-pass');
      if (userNode && saved.user) userNode.value = saved.user;
      if (passNode && saved.pass) passNode.value = saved.pass;
      api.setBasicCredentials(saved.user || '', saved.pass || '');
    }

    var autoStart = false;
    try {
      autoStart = global.location && global.location.search.indexOf('autoStart=1') >= 0;
    } catch (_error) { }
    if (autoStart) startApp();
  });
})(window);
