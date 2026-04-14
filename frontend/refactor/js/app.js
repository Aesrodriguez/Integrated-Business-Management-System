(function (w) {
  'use strict';
  var root = w.TripleAFrontend = w.TripleAFrontend || {};
  var ui = root.ui;

  /* ─── Tabla de rutas SPA ──────────────────────────────────────────── */
  var routes = {
    '/app-shell':          'dashboard',
    '/dashboard':          'dashboard',
    '/trabajadores':       'trabajadores',
    '/cotizaciones':       'lista',
    '/cotizaciones/nueva': 'nueva',
    '/clientes':           'clientes',
    '/catalogo':           'items',
    '/contratos':          'contratos',
    '/configuracion/tema': 'tema'
  };

  function normalize(path) {
    var p = String(path || '/').replace(/^\/frontend\/refactor/, '').replace(/\/+$/, '');
    if (!p || p === '/' || p === '/index.html') return '/dashboard';
    return p;
  }

  function render(path, replace) {
    var p = normalize(path);
    var view = routes[p] || 'not-found';
    if (replace) history.replaceState({}, '', p);
    ui.showView(view, p);
    ui.setStatus(view === 'not-found' ? 'Ruta invalida' : ('Vista ' + view + ' activa'));
    if (view === 'not-found') {
      var n = document.getElementById('not-found-view');
      if (n) n.innerHTML = ui.renderEmptyState('Ruta no encontrada: ' + p);
    }
  }

  /* ─── Navegación SPA ──────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var n = e.target.closest('[data-route]');
    if (!n) return;
    e.preventDefault();
    var p = normalize(n.getAttribute('data-route'));
    history.pushState({}, '', p);
    render(p, false);
  });
  w.addEventListener('popstate', function () { render(location.pathname, true); });

  /* ─── Auth storage ────────────────────────────────────────────────── */
  var AUTH_KEY = 'triplea.auth';

  function saveAuth(user, pass) {
    try { w.sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: user, pass: pass })); } catch (_) {}
  }

  function loadSavedAuth() {
    try { var r = w.sessionStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; } catch (_) { return null; }
  }

  /* ─── Feedback visual de campos ───────────────────────────────────── */
  function setFieldState(fieldId, state, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('is-invalid', 'is-valid');
    if (state) field.classList.add(state);
    var errEl = field.querySelector('.start-screen__field-error');
    if (errEl) errEl.textContent = message || '';
  }

  function clearFieldStates() {
    setFieldState('field-user', null, '');
    setFieldState('field-pass', null, '');
    hideFormError();
  }

  function showFormError(message) {
    var box = document.getElementById('form-error');
    var txt = document.getElementById('form-error-text');
    if (box) {
      box.hidden = false;
      box.style.animation = 'none';
      void box.offsetWidth;
      box.style.animation = '';
    }
    if (txt) txt.textContent = message || '';
  }

  function hideFormError() {
    var box = document.getElementById('form-error');
    if (box) box.hidden = true;
  }

  /* ─── Toggle ver/ocultar contraseña ──────────────────────────────── */
  function bindTogglePass() {
    var btn   = document.getElementById('btn-toggle-pass');
    var input = document.getElementById('start-auth-pass');
    if (!btn || !input) return;
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      var eyeOn  = btn.querySelector('.icon-eye');
      var eyeOff = btn.querySelector('.icon-eye-off');
      if (eyeOn)  eyeOn.style.display  = show ? 'none' : '';
      if (eyeOff) eyeOff.style.display = show ? ''     : 'none';
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  }

  /* ─── Validación en tiempo real (blur/input) ──────────────────────── */
  function bindInlineValidation() {
    var userInput = document.getElementById('start-auth-user');
    var passInput = document.getElementById('start-auth-pass');

    if (userInput) {
      userInput.addEventListener('blur', function () {
        var v = userInput.value.trim();
        if (!v)         setFieldState('field-user', 'is-invalid', 'El usuario es obligatorio.');
        else if (v.length < 2) setFieldState('field-user', 'is-invalid', 'Mínimo 2 caracteres.');
        else            setFieldState('field-user', 'is-valid', '');
      });
      userInput.addEventListener('input', function () {
        var f = document.getElementById('field-user');
        if (f && f.classList.contains('is-invalid') && userInput.value.trim())
          setFieldState('field-user', null, '');
      });
    }

    if (passInput) {
      passInput.addEventListener('blur', function () {
        if (!passInput.value) setFieldState('field-pass', 'is-invalid', 'La contraseña es obligatoria.');
        else                  setFieldState('field-pass', 'is-valid', '');
      });
      passInput.addEventListener('input', function () {
        var f = document.getElementById('field-pass');
        if (f && f.classList.contains('is-invalid') && passInput.value)
          setFieldState('field-pass', null, '');
      });
    }
  }

  /* ─── Botón submit: estado ocupado ───────────────────────────────── */
  function setSubmitBusy(isBusy) {
    var btn     = document.getElementById('start-submit-btn');
    if (!btn) return;
    btn.disabled = !!isBusy;
    var label   = btn.querySelector('.start-screen__submit-label');
    var spinner = btn.querySelector('.start-screen__submit-spinner');
    var arrow   = btn.querySelector('.start-screen__submit-arrow');
    if (label)   label.textContent   = isBusy ? 'Validando acceso...' : 'Entrar al sistema';
    if (spinner) spinner.hidden      = !isBusy;
    if (arrow)   arrow.style.display = isBusy ? 'none' : '';
  }

  /* ─── Validar campos y retornar credenciales ──────────────────────── */
  function getValidatedCredentials() {
    var userNode = document.getElementById('start-auth-user');
    var passNode = document.getElementById('start-auth-pass');
    var user = userNode ? userNode.value.trim() : '';
    var pass = passNode ? passNode.value        : '';

    // Si vacíos, intentar credenciales guardadas
    if (!user && !pass) {
      var saved = loadSavedAuth();
      if (saved && saved.user && saved.pass) return { user: saved.user, pass: saved.pass };
    }

    // Validación visual
    var ok = true;
    hideFormError();

    if (!user) {
      setFieldState('field-user', 'is-invalid', 'El usuario es obligatorio.');
      if (userNode) userNode.focus();
      ok = false;
    } else if (user.length < 2) {
      setFieldState('field-user', 'is-invalid', 'Mínimo 2 caracteres.');
      if (userNode) userNode.focus();
      ok = false;
    } else {
      setFieldState('field-user', 'is-valid', '');
    }

    if (!pass) {
      setFieldState('field-pass', 'is-invalid', 'La contraseña es obligatoria.');
      if (ok && passNode) passNode.focus();
      ok = false;
    } else {
      setFieldState('field-pass', 'is-valid', '');
    }

    if (!ok) return null;
    return { user: user, pass: pass };
  }

  /* ─── Llamada de validación de credenciales contra API ───────────── */
  function validateCredentials(user, pass) {
    var api = root.api;
    if (!api || typeof api.setBasicCredentials !== 'function') {
      // Sin API disponible: aceptar cualquier credencial (modo dev)
      return Promise.resolve(true);
    }
    api.setBasicCredentials(user, pass);
    return api.request('getTrabajadores', [{ soloResumen: true }], { ttlMs: 0 })
      .then(function () { return true; })
      .catch(function (err) {
        throw new Error(String(err && err.message ? err.message : 'No se pudo validar el acceso.'));
      });
  }

  /* ─── Login ───────────────────────────────────────────────────────── */
  var isLoggingIn = false;

  function startApp() {
    if (isLoggingIn) return;

    var creds = getValidatedCredentials();
    if (!creds) return;         // campos inválidos → ya tiene feedback

    isLoggingIn = true;
    setSubmitBusy(true);
    ui.setStatus('Validando credenciales...');

    validateCredentials(creds.user, creds.pass)
      .then(function () {
        saveAuth(creds.user, creds.pass);
        clearFieldStates();

        var startScreen = document.getElementById('start-screen');
        var appShell    = document.getElementById('app-shell');
        if (startScreen) startScreen.hidden = true;
        if (appShell)    appShell.hidden    = false;

        setSubmitBusy(false);
        isLoggingIn = false;

        // Navegar a la ruta que el usuario tenía en la URL (o dashboard)
        render(location.pathname, true);
      })
      .catch(function (err) {
        isLoggingIn = false;
        setSubmitBusy(false);
        setFieldState('field-user', 'is-invalid', '');
        setFieldState('field-pass', 'is-invalid', '');
        showFormError(err.message || 'Credenciales incorrectas. Verifica usuario y contraseña.');
        ui.setStatus('Acceso denegado');
      });
  }

  /* ─── DOMContentLoaded ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Año en el footer del login
    var yearEl = document.getElementById('start-screen-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Bindings del formulario de login
    var form = document.getElementById('start-login-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); startApp(); });
    bindTogglePass();
    bindInlineValidation();

    // Rellenar credenciales guardadas en sesión
    var saved = loadSavedAuth();
    if (saved) {
      var u = document.getElementById('start-auth-user');
      var p = document.getElementById('start-auth-pass');
      if (u && saved.user) u.value = saved.user;
      if (p && saved.pass) p.value = saved.pass;
    }

    // Routing inicial
    render(location.pathname, true);
  });

})(window);
