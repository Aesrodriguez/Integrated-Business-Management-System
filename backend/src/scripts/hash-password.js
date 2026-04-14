const { createPasswordHash } = require('../shared/security/basicAuth');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node src/scripts/hash-password.js <password>');
  process.exit(1);
}

const iterations = Number(process.argv[3] || 210000);
console.log(createPasswordHash(password, iterations));