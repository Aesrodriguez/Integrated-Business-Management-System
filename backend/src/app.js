const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { basicAuth } = require('./shared/security/basicAuth');
const { buildCorsMiddleware } = require('./shared/security/cors');
const { createRateLimiter } = require('./shared/security/rateLimit');
const { requestIdMiddleware } = require('./shared/security/requestId');
const { enforceHttpsMiddleware } = require('./shared/security/https');
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
  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy ? 1 : false);

  app.use(requestIdMiddleware);
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  }));
  app.use(buildCorsMiddleware(env.corsAllowedOrigins));
  app.use(enforceHttpsMiddleware(env.forceHttps));
  app.use(express.json({ limit: '750kb' }));
  app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms req=:req[x-request-id]'));

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

  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 25,
    message: 'Demasiados intentos de autenticación'
  });
  const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: 'Demasiadas solicitudes a la API'
  });

  const auth = basicAuth({
    user: env.basicAuthUser,
    pass: env.basicAuthPass,
    passwordHash: env.basicAuthPasswordHash
  });

  app.use('/api/v1', apiLimiter);
  app.use('/api/v1', authLimiter);
  app.use('/api/v1', auth);
  app.use('/api/v1/trabajadores', buildTrabajadorRouter({ controller }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
