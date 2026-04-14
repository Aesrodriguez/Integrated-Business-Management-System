function enforceHttpsMiddleware(shouldEnforce) {
  return function (req, res, next) {
    if (!shouldEnforce) return next();

    const proto = req.headers['x-forwarded-proto'];
    const secure = req.secure || proto === 'https';
    if (secure) return next();

    res.status(426).json({ ok: false, error: 'HTTPS_REQUIRED', message: 'Conexión segura requerida' });
  };
}

module.exports = { enforceHttpsMiddleware };