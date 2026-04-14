const { AppError } = require('../errors/AppError');

function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError('VALIDATION_ERROR', 'Datos invalidos', 422, result.error.flatten()));
    }
    req.validatedBody = result.data;
    return next();
  };
}

module.exports = { validateBody };
