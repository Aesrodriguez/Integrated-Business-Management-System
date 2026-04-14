module.exports = function handler(_req, res) {
  var apiUrl = process.env.API_URL || process.env.TRIPLEA_API_BASE_URL || '';
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.status(200).send('window.API_URL=' + JSON.stringify(apiUrl) + ';');
};
