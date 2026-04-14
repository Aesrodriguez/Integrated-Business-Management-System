(function (global) {
  "use strict";

  var root = (global.TripleAFrontend = global.TripleAFrontend || {});

  root.config = {
    storageKeys: {
      theme: "triplea.theme",
      sidebar: "triplea.sidebarCollapsed",
    },
    requestTtlMs: 15000,
    viewTitles: {
      dashboard: "Dashboard",
      nueva: "Nueva cotización",
      lista: "Cotizaciones",
      clientes: "Clientes",
      items: "Catálogo",
      trabajadores: "Trabajadores",
      contratos: "Contratos",
      tema: "Configuración de tema",
      "not-found": "Página no encontrada",
    },
    useAppsScriptRuntime: function () {
      return !!(global.google && google.script && google.script.run);
    },
    getApiBaseUrl: function () {
      return global.API_URL || global.TRIPLEA_API_BASE_URL || "";
    },
    getBackendMode: function () {
      return root.config.getApiBaseUrl() ? "rest" : "apps-script";
    },
  };
})(window);
