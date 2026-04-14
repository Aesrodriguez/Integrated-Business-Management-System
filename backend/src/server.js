const env = require('./config/env');
const { buildApp } = require('./app');

const app = buildApp();

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});
