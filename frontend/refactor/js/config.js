(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};

  root.config = {
    storageKeys: {
      theme: 'triplea.theme',
      sidebar: 'triplea.sidebarCollapsed'
    },
    requestTtlMs: 15000,
    viewTitles: {
      dashboard: 'Dashboard',
      nueva: 'Nueva cotización',
      lista: 'Cotizaciones',
      clientes: 'Clientes',
      items: 'Catálogo',
      trabajadores: 'Trabajadores',
      contratos: 'Contratos'
    },
    useAppsScriptRuntime: function () {
      return !!(global.google && google.script && google.script.run);
    },
    getBackendMode: function () {
      return global.TRIPLEA_API_BASE_URL ? 'rest' : 'apps-script';
    }
  };
})(window);
