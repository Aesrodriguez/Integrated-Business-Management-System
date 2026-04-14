const express = require('express');

function buildDocsRouter() {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json({
      ok: true,
      docs: {
        version: 'v1',
        auth: {
          type: 'Basic',
          header: 'Authorization: Basic <base64(user:pass)>',
          transport: 'HTTPS obligatorio',
          storage: 'Se recomienda BASIC_AUTH_PASSWORD_HASH con PBKDF2-SHA256'
        },
        security: {
          cors: 'Allowlist configurable por CORS_ALLOWED_ORIGINS',
          rateLimit: 'Límites por IP en /api/v1 y autenticación',
          headers: 'Helmet + X-Request-Id'
        },
        endpoints: [
          { method: 'GET', path: '/health', description: 'Estado del servicio', authRequired: false },
          { method: 'GET', path: '/api/v1/trabajadores', description: 'Lista trabajadores normalizados', authRequired: true },
          { method: 'GET', path: '/api/v1/trabajadores/:id', description: 'Obtiene trabajador por id', authRequired: true },
          { method: 'POST', path: '/api/v1/trabajadores', description: 'Crea trabajador', authRequired: true },
          { method: 'PUT', path: '/api/v1/trabajadores/:id', description: 'Actualiza trabajador', authRequired: true },
          { method: 'DELETE', path: '/api/v1/trabajadores/:id', description: 'Eliminacion logica', authRequired: true }
        ],
        engineeringNotes: {
          normalization: 'Encabezados de Sheets se normalizan para desacoplar el orden de columnas.',
          cleanArchitecture: 'Separacion estricta de rutas, controladores, negocio y repositorios.',
          scalability: 'Cache TTL e invalidacion tras escrituras para optimizar cuotas y latencia.',
          dataValidation: 'Zod en capa de presentacion para validar contratos de entrada.',
          authHardening: 'Credenciales con hash PBKDF2 y verificación en tiempo constante.'
        }
      }
    });
  });

  return router;
}

module.exports = { buildDocsRouter };
