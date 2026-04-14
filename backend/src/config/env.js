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
  basicAuthPass: required('BASIC_AUTH_PASS'),
  googleClientEmail: required('GOOGLE_CLIENT_EMAIL'),
  googlePrivateKey: required('GOOGLE_PRIVATE_KEY').replace(/\n/g, '\n'),
  spreadsheetId: required('GOOGLE_SHEETS_SPREADSHEET_ID'),
  workersRange: process.env.GOOGLE_SHEETS_WORKERS_RANGE || 'Trabajadores!A:Z',
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 15000)
};
