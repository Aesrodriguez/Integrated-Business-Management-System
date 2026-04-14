/**
 * router.js — Triple A | Sistema de cotizaciones
 *
 * Enrutador SPA basado en History API (pushState / popstate).
 * Mapea rutas URL → vistas internas, sincroniza la URL con el estado
 * de la UI y maneja la navegación con botones Atrás/Adelante del navegador.
 *
 * Dependencias: ninguna (vanilla JS, ES5 compatible).
 * Expone: window.TripleAFrontend.router
 */
(function (global) {
  "use strict";

  var root = (global.TripleAFrontend = global.TripleAFrontend || {});

  /**
   * Tabla de rutas: pathname → id de vista interna.
   * Orden importa: rutas más específicas primero.
   */
  var ROUTES = [
    { path: "/cotizaciones/nueva", view: "nueva" },
    { path: "/cotizaciones",       view: "lista" },
    { path: "/clientes",           view: "clientes" },
    { path: "/catalogo",           view: "items" },
    { path: "/trabajadores",       view: "trabajadores" },
    { path: "/contratos",          view: "contratos" },
    { path: "/configuracion/tema", view: "tema" },
    { path: "/dashboard",          view: "dashboard" },
  ];

  /** Vista que se muestra cuando ninguna ruta coincide (404). */
  var NOT_FOUND_VIEW = "not-found";

  /** Vista por defecto cuando se accede a la raíz del SPA. */
  var DEFAULT_VIEW = "dashboard";
  var DEFAULT_PATH = "/dashboard";

  /**
   * Detecta el prefijo de ruta según dónde esté alojado el HTML.
   * Si index.html está en /refactor/, el prefijo es "/refactor".
   * Si está en la raíz, el prefijo es "".
   */
  function detectBasePath() {
    var scripts = global.document.querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      // Busca "…/js/router.js" para inferir la base
      var match = src.match(/^(.*?)\/js\/router\.js$/);
      if (match) return match[1]; // e.g. "/refactor" o ""
    }
    // Fallback: usar el directorio del pathname actual
    var pathname = global.location.pathname;
    // Quita cualquier segmento de "vista" conocido al final
    var allPaths = ROUTES.map(function (r) { return r.path; });
    for (var j = 0; j < allPaths.length; j++) {
      if (pathname.indexOf(allPaths[j]) >= 0) {
        return pathname.slice(0, pathname.indexOf(allPaths[j]));
      }
    }
    // Si termina en "/" o en un nombre de archivo HTML, tomar el directorio
    var lastSlash = pathname.lastIndexOf("/");
    return lastSlash > 0 ? pathname.slice(0, lastSlash) : "";
  }

  var BASE_PATH = null; // Se inicializa en init()

  /**
   * Resuelve el pathname actual → id de vista interna.
   * Normaliza quitando el BASE_PATH y el trailing slash.
   */
  function resolveView(pathname) {
    // Quitar base path
    var relative = pathname;
    if (BASE_PATH && relative.indexOf(BASE_PATH) === 0) {
      relative = relative.slice(BASE_PATH.length) || "/";
    }

    // Normalizar trailing slash (excepto raíz sola "/")
    if (relative.length > 1 && relative[relative.length - 1] === "/") {
      relative = relative.slice(0, -1);
    }

    // Raíz → vista por defecto
    if (relative === "" || relative === "/") {
      return DEFAULT_VIEW;
    }

    // Buscar coincidencia exacta en tabla de rutas
    for (var i = 0; i < ROUTES.length; i++) {
      if (relative === ROUTES[i].path) {
        return ROUTES[i].view;
      }
    }

    return NOT_FOUND_VIEW;
  }

  /**
   * Convierte un id de vista → pathname canónico completo (con BASE_PATH).
   */
  function viewToPath(view) {
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].view === view) {
        return BASE_PATH + ROUTES[i].path;
      }
    }
    // Si no se conoce la vista, usar la raíz
    return BASE_PATH + DEFAULT_PATH;
  }

  /**
   * Callback que será asignado externamente (desde app.js).
   * Se llama con el id de vista cada vez que la ruta cambia.
   */
  var _onNavigate = null;

  /**
   * Navega programáticamente a una vista.
   * - Actualiza la URL con pushState (no recarga la página).
   * - Llama al callback _onNavigate con el id de vista.
   *
   * @param {string} viewOrPath  Id de vista ("dashboard") o ruta ("/cotizaciones").
   * @param {boolean} [replace]  Si true, usa replaceState en lugar de pushState.
   */
  function navigateTo(viewOrPath, replace) {
    var view;
    var path;

    // ¿Es una ruta absoluta?
    if (viewOrPath && viewOrPath[0] === "/") {
      view = resolveView(viewOrPath);
      // Reconstruir path canonico desde la vista resuelta para normalización
      path = view !== NOT_FOUND_VIEW ? viewToPath(view) : (BASE_PATH + viewOrPath);
    } else {
      view = viewOrPath || DEFAULT_VIEW;
      path = viewToPath(view);
    }

    var currentPath = global.location.pathname;
    var targetPath = path;

    if (currentPath !== targetPath) {
      if (replace) {
        global.history.replaceState({ view: view }, "", targetPath);
      } else {
        global.history.pushState({ view: view }, "", targetPath);
      }
    }

    if (typeof _onNavigate === "function") {
      _onNavigate(view);
    }
  }

  /**
   * Lee la URL actual y dispara la navegación correspondiente
   * sin añadir entrada al historial (usa replaceState).
   */
  function handleCurrentUrl() {
    var pathname = global.location.pathname;
    var view = resolveView(pathname);

    // Canonicalizar URL si es raíz o no coincide exactamente
    var canonicalPath = view !== NOT_FOUND_VIEW ? viewToPath(view) : pathname;
    if (pathname !== canonicalPath) {
      global.history.replaceState({ view: view }, "", canonicalPath);
    }

    if (typeof _onNavigate === "function") {
      _onNavigate(view);
    }
  }

  /**
   * Inicializa el router.
   * Debe llamarse una vez el DOM esté listo.
   *
   * @param {function} onNavigate  Función (view) => void que renderiza la vista.
   */
  function init(onNavigate) {
    BASE_PATH = detectBasePath();
    _onNavigate = onNavigate;

    // Escuchar botones Atrás / Adelante del navegador
    global.addEventListener("popstate", function (event) {
      var view;
      if (event.state && event.state.view) {
        view = event.state.view;
      } else {
        view = resolveView(global.location.pathname);
      }
      if (typeof _onNavigate === "function") {
        _onNavigate(view);
      }
    });

    // Procesar la URL con la que el usuario llegó
    handleCurrentUrl();
  }

  /**
   * Devuelve la vista activa según la URL actual (sin disparar callbacks).
   */
  function getCurrentView() {
    return resolveView(global.location.pathname);
  }

  // API pública
  root.router = {
    init: init,
    navigateTo: navigateTo,
    getCurrentView: getCurrentView,
    viewToPath: viewToPath,
    resolveView: resolveView,
  };
})(window);
