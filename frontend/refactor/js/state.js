(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var listeners = [];
  var state = {
    view: 'dashboard',
    theme: 'dark',
    sidebarCollapsed: false,
    loading: false,
    message: 'Listo para cargar datos',
    initialData: null,
    caches: {
      initial: null,
      workers: null,
      contracts: null,
      items: null,
      cotizaciones: null
    },
    inflight: Object.create(null)
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function notify() {
    var snapshot = getState();
    listeners.slice().forEach(function (listener) {
      listener(snapshot);
    });
  }

  function getState() {
    return clone(state);
  }

  function patchState(patch) {
    state = Object.assign({}, state, patch || {});
    notify();
    return getState();
  }

  function mergeCache(name, value) {
    state.caches = Object.assign({}, state.caches, (function () {
      var next = {};
      next[name] = value;
      return next;
    })());
    notify();
    return getState();
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      listeners = listeners.filter(function (item) { return item !== listener; });
    };
  }

  function reset() {
    state = {
      view: 'dashboard',
      theme: 'dark',
      sidebarCollapsed: false,
      loading: false,
      message: 'Listo para cargar datos',
      initialData: null,
      caches: {
        initial: null,
        workers: null,
        contracts: null,
        items: null,
        cotizaciones: null
      },
      inflight: Object.create(null)
    };
    notify();
    return getState();
  }

  root.store = {
    getState: getState,
    patchState: patchState,
    mergeCache: mergeCache,
    subscribe: subscribe,
    reset: reset
  };
})(window);
(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var listeners = [];
  var state = {
    view: 'dashboard',
    theme: 'dark',
    sidebarCollapsed: false,
    loading: false,
    message: 'Listo para cargar datos',
    initialData: null,
    caches: {
      initial: null,
      workers: null,
      contracts: null,
      items: null,
      cotizaciones: null
    },
    inflight: Object.create(null)
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function notify() {
    var snapshot = getState();
    listeners.slice().forEach(function (listener) {
      listener(snapshot);
    });
  }

  function getState() {
    return clone(state);
  }

  function patchState(patch) {
    state = Object.assign({}, state, patch || {});
    notify();
    return getState();
  }

  function mergeCache(name, value) {
    state.caches = Object.assign({}, state.caches, (function () {
      var next = {};
      next[name] = value;
      return next;
    })());
    notify();
    return getState();
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function reset() {
    state = {
      view: 'dashboard',
      theme: 'dark',
      sidebarCollapsed: false,
      loading: false,
      message: 'Listo para cargar datos',
      initialData: null,
      caches: {
        initial: null,
        workers: null,
        contracts: null,
        items: null,
        cotizaciones: null
      },
      inflight: Object.create(null)
    };
    notify();
    return getState();
  }

  root.store = {
    getState: getState,
    patchState: patchState,
    mergeCache: mergeCache,
    subscribe: subscribe,
    reset: reset
  };
})(window);
