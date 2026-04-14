(function (w) {
  'use strict';
  var root = w.TripleAFrontend = w.TripleAFrontend || {};
  var ui = root.ui;
  var routes = {
    '/app-shell': 'dashboard',
    '/dashboard': 'dashboard',
    '/trabajadores': 'trabajadores',
    '/cotizaciones': 'lista',
    '/cotizaciones/nueva': 'nueva',
    '/clientes': 'clientes',
    '/catalogo': 'items',
    '/contratos': 'contratos',
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
  document.addEventListener('click', function (e) { var n = e.target.closest('[data-route]'); if (!n) return; e.preventDefault(); var p = normalize(n.getAttribute('data-route')); history.pushState({}, '', p); render(p, false); });
  w.addEventListener('popstate', function () { render(location.pathname, true); });
  document.addEventListener('DOMContentLoaded', function () { render(location.pathname, true); });
})(window);
