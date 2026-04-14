const dotenv = require('dotenv');

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  basicAuthUser: required('BASIC_AUTH_USER'),
  basicAuthPass: process.env.BASIC_AUTH_PASS || '',
  basicAuthPasswordHash: process.env.BASIC_AUTH_PASSWORD_HASH || '',
  googleClientEmail: required('GOOGLE_CLIENT_EMAIL'),
  googlePrivateKey: required('GOOGLE_PRIVATE_KEY').replace(/\n/g, '\n'),
  spreadsheetId: required('GOOGLE_SHEETS_SPREADSHEET_ID'),
  workersRange: process.env.GOOGLE_SHEETS_WORKERS_RANGE || 'Trabajadores!A:Z',
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 15000),
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map(function (origin) { return origin.trim(); })
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY !== 'false',
  forceHttps: process.env.FORCE_HTTPS === 'true' || process.env.NODE_ENV === 'production'
};

if (!module.exports.basicAuthPass && !module.exports.basicAuthPasswordHash) {
  throw new Error('Missing environment variable: BASIC_AUTH_PASS or BASIC_AUTH_PASSWORD_HASH');
}
