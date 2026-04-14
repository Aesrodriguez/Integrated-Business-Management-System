module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  var baseUrl = process.env.API_URL || process.env.TRIPLEA_API_BASE_URL || '';
  if (!baseUrl) {
    return res.status(500).json({
      ok: false,
      error: 'API_URL no configurada en Vercel'
    });
  }

  var body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      return res.status(400).json({ ok: false, error: 'Body JSON inválido' });
    }
  }

  var method = body && body.method;
  var payload = (body && body.payload) || {};
  if (!method || !/^[a-zA-Z0-9_]+$/.test(method)) {
    return res.status(400).json({ ok: false, error: 'Método inválido' });
  }

  var url = baseUrl.replace(/\/$/, '') + '/api/v1/' + method;
  var headers = { 'Content-Type': 'application/json' };

  var clientBasicAuth = String(req.headers['x-basic-auth'] || '').trim();
  if (clientBasicAuth && /^Basic\s+/i.test(clientBasicAuth)) {
    headers.Authorization = clientBasicAuth;
  } else {
    var user = process.env.BASIC_AUTH_USER || '';
    var pass = process.env.BASIC_AUTH_PASS || '';
    if (user && pass) {
      headers.Authorization = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
    }
  }

  try {
    var upstream = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    var raw = await upstream.text();
    var data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_parseError) {
      data = raw;
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        ok: false,
        error: (data && data.message) || ('HTTP ' + upstream.status),
        details: data
      });
    }

    return res.status(200).json({ ok: true, data: data });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message || 'Error de conexión al backend' });
  }
};
