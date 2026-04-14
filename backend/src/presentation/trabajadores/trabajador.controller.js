function buildTrabajadorController({ service }) {
  return {
    list: async (req, res, next) => {
      try {
        const result = await service.list({ estado: req.query.estado });
        res.json({ ok: true, data: result.data, meta: result.meta });
      } catch (err) {
        next(err);
      }
    },

    getById: async (req, res, next) => {
      try {
        const data = await service.getById(req.params.id);
        res.json({ ok: true, data });
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const data = await service.create(req.validatedBody);
        res.status(201).json({ ok: true, data });
      } catch (err) {
        next(err);
      }
    },

    update: async (req, res, next) => {
      try {
        const data = await service.update(req.params.id, req.validatedBody);
        res.json({ ok: true, data });
      } catch (err) {
        next(err);
      }
    },

    remove: async (req, res, next) => {
      try {
        const data = await service.remove(req.params.id);
        res.json({ ok: true, data });
      } catch (err) {
        next(err);
      }
    }
  };
}

module.exports = { buildTrabajadorController };
