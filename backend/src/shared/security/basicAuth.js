const crypto = require('crypto');
const { AppError } = require('../errors/AppError');

function normalizeHashInput(value) {
  return String(value || '').trim();
}

function decodeStoredPasswordHash(storedHash) {
  var value = normalizeHashInput(storedHash);
  var parts = value.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return null;

  var iterations = Number(parts[1]);
  var salt = parts[2];
  var hash = parts[3];
  if (!iterations || !salt || !hash) return null;

  return {
    iterations: iterations,
    salt: salt,
    hash: hash
  };
}

function verifyPasswordHash(password, storedHash) {
  var parsed = decodeStoredPasswordHash(storedHash);
  if (!parsed) return false;

  var derived = crypto.pbkdf2Sync(String(password), parsed.salt, parsed.iterations, 32, 'sha256').toString('base64');
  return safeCompare(derived, parsed.hash);
}

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function basicAuth({ user, pass, passwordHash }) {
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
    const userOk = safeCompare(reqUser, user);
    const passOk = passwordHash ? verifyPasswordHash(reqPass, passwordHash) : safeCompare(reqPass, pass);

    if (!userOk || !passOk) {
      return next(new AppError('UNAUTHORIZED', 'Credenciales invalidas', 401));
    }

    return next();
  };
}

function createPasswordHash(password, iterations) {
  const salt = crypto.randomBytes(16).toString('base64');
  const iter = Number(iterations || 210000);
  const hash = crypto.pbkdf2Sync(String(password), salt, iter, 32, 'sha256').toString('base64');
  return 'pbkdf2$' + iter + '$' + salt + '$' + hash;
}

module.exports = { basicAuth, createPasswordHash, verifyPasswordHash };
