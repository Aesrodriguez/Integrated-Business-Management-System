(function (w) {
  'use strict';
  var root = w.TripleAFrontend = w.TripleAFrontend || {};
  function showView(view, path) {
    document.querySelectorAll('[data-view-panel]').forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-view-panel') === view); });
    document.querySelectorAll('[data-view]').forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-view') === view); });
    if (path) document.querySelectorAll('[data-route]').forEach(function (n) { n.classList.toggle('is-active', n.getAttribute('data-route') === path); });
  }
  function setStatus(msg) { var s = document.getElementById('status-bar'); if (s) s.textContent = msg; }
  function renderEmptyState(msg) { return '<div class="empty-state">' + String(msg || '') + '</div>'; }
  function renderViewCollection() {}
  function renderDashboard() {}
  root.ui = { showView: showView, setStatus: setStatus, renderEmptyState: renderEmptyState, renderViewCollection: renderViewCollection, renderDashboard: renderDashboard, syncTheme: function () {}, toggleSidebar: function () {}, toast: function () {}, showLoader: function () {}, hideLoader: function () {} };
})(window);
