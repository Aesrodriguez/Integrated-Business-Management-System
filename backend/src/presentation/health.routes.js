const express = require('express');

function buildHealthRouter() {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json({
      ok: true,
      service: 'cotizaciones-backend',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

module.exports = { buildHealthRouter };
