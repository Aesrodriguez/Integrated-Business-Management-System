const crypto = require('crypto');
const { AppError } = require('../errors/AppError');

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function basicAuth({ user, pass }) {
  return (req, _res, next) => {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Basic ')) return next(new AppError('UNAUTHORIZED', 'Autenticacion requerida', 401));

    let decoded = '';
    try {
      decoded = Buffer.from(auth.slice(6).trim(), 'base64').toString('utf8');
    } catch (_e) {
      return next(new AppError('UNAUTHORIZED', 'Credenciales invalidas', 401));
    }

    const idx = decoded.indexOf(':');
    if (idx < 0) return next(new AppError('UNAUTHORIZED', 'Credenciales invalidas', 401));

    const reqUser = decoded.slice(0, idx);
    const reqPass = decoded.slice(idx + 1);
    if (!safeCompare(reqUser, user) || !safeCompare(reqPass, pass)) {
      return next(new AppError('UNAUTHORIZED', 'Credenciales invalidas', 401));
    }

    return next();
  };
}

module.exports = { basicAuth };
