function buildCorsMiddleware(allowedOrigins) {
  var normalized = (allowedOrigins || []).map(function (origin) { return String(origin || '').trim(); }).filter(Boolean);

  return function corsMiddleware(req, res, next) {
    var origin = req.headers.origin;
    if (!origin || normalized.indexOf('*') >= 0 || normalized.indexOf(origin) >= 0) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
      res.setHeader('Access-Control-Allow-Credentials', 'false');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Request-Id, X-Client-Version');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }

      next();
      return;
    }

    res.status(403).json({ ok: false, error: 'CORS_DENIED', message: 'Origen no permitido' });
  };
}

module.exports = { buildCorsMiddleware };