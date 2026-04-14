function createRateLimiter(options) {
  var windowMs = Number(options && options.windowMs) || 15 * 60 * 1000;
  var max = Number(options && options.max) || 100;
  var message = (options && options.message) || 'Demasiadas solicitudes';
  var store = new Map();

  return function rateLimitMiddleware(req, res, next) {
    var key = req.ip + ':' + req.path;
    var now = Date.now();
    var entry = store.get(key);

    if (!entry || entry.expiresAt <= now) {
      entry = { count: 0, expiresAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('X-RateLimit-Reset', String(entry.expiresAt));

    if (entry.count > max) {
      res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED', message: message });
      return;
    }

    next();
  };
}

module.exports = { createRateLimiter };