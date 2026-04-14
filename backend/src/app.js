const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { basicAuth } = require('./shared/security/basicAuth');
const { notFoundHandler, errorHandler } = require('./shared/errors/errorHandler');
const { createGoogleSheetsClient } = require('./infrastructure/google/googleClient');
const { SheetsGateway } = require('./infrastructure/google/sheetsGateway');
const { MemoryCache } = require('./infrastructure/cache/memoryCache');
const { TrabajadorRepository } = require('./domain/trabajadores/trabajador.repository');
const { TrabajadorService } = require('./application/trabajadores/trabajador.service');
const { buildTrabajadorController } = require('./presentation/trabajadores/trabajador.controller');
const { buildTrabajadorRouter } = require('./presentation/trabajadores/trabajador.routes');
const { buildHealthRouter } = require('./presentation/health.routes');
const { buildDocsRouter } = require('./presentation/docs.routes');

function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  const sheetsClient = createGoogleSheetsClient({
    clientEmail: env.googleClientEmail,
    privateKey: env.googlePrivateKey
  });

  const cache = new MemoryCache(env.cacheTtlMs);
  const gateway = new SheetsGateway({
    sheetsClient,
    spreadsheetId: env.spreadsheetId,
    workersRange: env.workersRange
  });

  const repository = new TrabajadorRepository({ sheetsGateway: gateway, cache });
  const service = new TrabajadorService({ repository });
  const controller = buildTrabajadorController({ service });

  app.use('/health', buildHealthRouter());
  app.use('/docs', buildDocsRouter());

  const auth = basicAuth({ user: env.basicAuthUser, pass: env.basicAuthPass });
  app.use('/api/v1', auth);
  app.use('/api/v1/trabajadores', buildTrabajadorRouter({ controller }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
