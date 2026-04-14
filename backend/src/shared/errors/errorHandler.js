const { AppError } = require('./AppError');

function notFoundHandler(_req, _res, next) {
  next(new AppError('NOT_FOUND', 'Ruta no encontrada', 404));
}

function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    ok: false,
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Error interno'
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
