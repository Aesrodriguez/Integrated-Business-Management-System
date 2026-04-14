const { google } = require('googleapis');

function createGoogleSheetsClient({ clientEmail, privateKey }) {
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

module.exports = { createGoogleSheetsClient };
