(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var config = root.config;
  var store = root.store;
  var cache = Object.create(null);
  var inflight = Object.create(null);

  function canUseAppsScript() {
    return config.useAppsScriptRuntime();
  }

  function callAppsScript(method, args) {
    return new Promise(function (resolve, reject) {
      if (!canUseAppsScript()) {
        reject(new Error('Apps Script runtime no disponible'));
        return;
      }

      var runner = global.google.script.run;
      if (!runner || typeof runner[method] !== 'function') {
        reject(new Error('Método no disponible: ' + method));
        return;
      }

      var request = runner
        .withSuccessHandler(function (result) { resolve(result); })
        .withFailureHandler(function (error) {
          reject(error instanceof Error ? error : new Error(String(error && error.message ? error.message : error)));
        });

      try {
        request[method].apply(request, args || []);
      } catch (error) {
        reject(error);
      }
    });
  }

  function callRest(method, payload) {
    var baseUrl = config.getApiBaseUrl();
    if (!baseUrl) {
      return Promise.reject(new Error('API REST no configurada. Define API_URL o TRIPLEA_API_BASE_URL.'));
    }

    var url = baseUrl.replace(/\/$/, '') + '/api/v1/' + method;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  function request(method, args, options) {
    var key = method + ':' + JSON.stringify(args || []);
    var ttl = (options && options.ttlMs) || config.requestTtlMs;
    var now = Date.now();

    if (cache[key] && cache[key].expiresAt > now) {
      return Promise.resolve(cache[key].value);
    }

    if (inflight[key]) {
      return inflight[key];
    }

    var promise = (canUseAppsScript() ? callAppsScript(method, args) : callRest(method, (args || [])[0]))
      .then(function (result) {
        cache[key] = { value: result, expiresAt: now + ttl };
        return result;
      })
      .finally(function () {
        delete inflight[key];
      });

    inflight[key] = promise;
    return promise;
  }

  function invalidate(pattern) {
    var matcher = pattern instanceof RegExp ? pattern : null;
    Object.keys(cache).forEach(function (key) {
      if (!pattern) {
        delete cache[key];
        return;
      }
      if (matcher && matcher.test(key)) {
        delete cache[key];
      }
    });
  }

  function loadInitialData(force) {
    if (!force && store.getState().caches.initial) {
      return Promise.resolve(store.getState().caches.initial);
    }

    var fast = request('getDatosInicialesRapido', []);
    var fallback = function () { return request('getDatosIniciales', []); };

    return fast.catch(fallback).then(function (payload) {
      store.patchState({ initialData: payload });
      store.mergeCache('initial', payload);
      return payload;
    });
  }

  function loadDashboardData() {
    return Promise.allSettled([
      request('getCotizaciones', [{}]),
      request('getDashboardContratos', []),
      request('getTrabajadores', [{ soloResumen: true }])
    ]).then(function (results) {
      return {
        cotizaciones: results[0].status === 'fulfilled' ? results[0].value : [],
        contratos: results[1].status === 'fulfilled' ? results[1].value : { ok: false, contratos: [] },
        trabajadores: results[2].status === 'fulfilled' ? results[2].value : []
      };
    });
  }

  function loadViewData(view) {
    if (view === 'items') return request('getItems', []).then(function (value) { store.mergeCache('items', value); return value; });
    if (view === 'trabajadores') return request('getTrabajadores', [{ soloResumen: false }]).then(function (value) { store.mergeCache('workers', value); return value; });
    if (view === 'contratos') return request('getDashboardContratos', []).then(function (value) { store.mergeCache('contracts', value); return value; });
    if (view === 'lista') return request('getCotizaciones', [{}]).then(function (value) { store.mergeCache('cotizaciones', value); return value; });
    return Promise.resolve(null);
  }

  root.api = {
    request: request,
    invalidate: invalidate,
    loadInitialData: loadInitialData,
    loadDashboardData: loadDashboardData,
    loadViewData: loadViewData
  };
})(window);
(function (global) {
  'use strict';

  var root = global.TripleAFrontend = global.TripleAFrontend || {};
  var config = root.config;
  var store = root.store;
  var cache = Object.create(null);
  var inflight = Object.create(null);

  function canUseAppsScript() {
    return config.useAppsScriptRuntime();
  }

  function callAppsScript(method, args) {
    return new Promise(function (resolve, reject) {
      if (!canUseAppsScript()) {
        reject(new Error('Apps Script runtime no disponible'));
        return;
      }

      var runner = global.google.script.run;
      if (!runner || typeof runner[method] !== 'function') {
        reject(new Error('Método no disponible: ' + method));
        return;
      }

      var request = runner
        .withSuccessHandler(function (result) {
          resolve(result);
        })
        .withFailureHandler(function (error) {
          reject(error instanceof Error ? error : new Error(String(error && error.message ? error.message : error)));
        });

      try {
        request[method].apply(request, args || []);
      } catch (error) {
        reject(error);
      }
    });
  }

  function callRest(method, payload) {
    if (!global.TRIPLEA_API_BASE_URL) {
      return Promise.reject(new Error('API REST no configurada'));
    }

    var url = global.TRIPLEA_API_BASE_URL.replace(/\/$/, '') + '/api/v1/' + method;
    var request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {})
    };

    return fetch(url, request).then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.json();
    });
  }

  function request(method, args, options) {
    var key = method + ':' + JSON.stringify(args || []);
    var ttl = (options && options.ttlMs) || config.requestTtlMs;
    var now = Date.now();

    if (cache[key] && cache[key].expiresAt > now) {
      return Promise.resolve(cache[key].value);
    }

    if (inflight[key]) {
      return inflight[key];
    }

    var promise = (canUseAppsScript() ? callAppsScript(method, args) : callRest(method, (args || [])[0]))
      .then(function (result) {
        cache[key] = {
          value: result,
          expiresAt: now + ttl
        };
        return result;
      })
      .finally(function () {
        delete inflight[key];
      });

    inflight[key] = promise;
    return promise;
  }

  function invalidate(pattern) {
    var matcher = pattern instanceof RegExp ? pattern : null;
    Object.keys(cache).forEach(function (key) {
      if (!pattern) {
        delete cache[key];
        return;
      }
      if (matcher && matcher.test(key)) {
        delete cache[key];
      }
    });
  }

  function loadInitialData(force) {
    if (!force && store.getState().caches.initial) {
      return Promise.resolve(store.getState().caches.initial);
    }

    var fast = request('getDatosInicialesRapido', []);
    var fallback = function () {
      return request('getDatosIniciales', []);
    };

    return fast.catch(fallback).then(function (payload) {
      store.patchState({ initialData: payload });
      store.mergeCache('initial', payload);
      return payload;
    });
  }

  function loadDashboardData() {
    return Promise.allSettled([
      request('getCotizaciones', [{}]),
      request('getDashboardContratos', []),
      request('getTrabajadores', [{ soloResumen: true }])
    ]).then(function (results) {
      return {
        cotizaciones: results[0].status === 'fulfilled' ? results[0].value : [],
        contratos: results[1].status === 'fulfilled' ? results[1].value : { ok: false, contratos: [] },
        trabajadores: results[2].status === 'fulfilled' ? results[2].value : []
      };
    });
  }

  function loadViewData(view) {
    if (view === 'items') return request('getItems', []).then(function (value) { store.mergeCache('items', value); return value; });
    if (view === 'trabajadores') return request('getTrabajadores', [{ soloResumen: false }]).then(function (value) { store.mergeCache('workers', value); return value; });
    if (view === 'contratos') return request('getDashboardContratos', []).then(function (value) { store.mergeCache('contracts', value); return value; });
    if (view === 'lista') return request('getCotizaciones', [{}]).then(function (value) { store.mergeCache('cotizaciones', value); return value; });
    return Promise.resolve(null);
  }

  root.api = {
    request: request,
    invalidate: invalidate,
    loadInitialData: loadInitialData,
    loadDashboardData: loadDashboardData,
    loadViewData: loadViewData
  };
})(window);
