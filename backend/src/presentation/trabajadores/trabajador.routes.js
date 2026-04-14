const express = require('express');
const { validateBody } = require('../../shared/validation/validate');
const { createTrabajadorSchema, updateTrabajadorSchema } = require('../../domain/trabajadores/trabajador.schema');

function buildTrabajadorRouter({ controller }) {
  const router = express.Router();

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', validateBody(createTrabajadorSchema), controller.create);
  router.put('/:id', validateBody(updateTrabajadorSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

module.exports = { buildTrabajadorRouter };
