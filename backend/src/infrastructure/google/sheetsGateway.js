const { AppError } = require('../../shared/errors/AppError');

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

class SheetsGateway {
  constructor({ sheetsClient, spreadsheetId, workersRange }) {
    this.sheetsClient = sheetsClient;
    this.spreadsheetId = spreadsheetId;
    this.workersRange = workersRange;
  }

  async readWorkersTable() {
    const response = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.workersRange,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return { headers: [], records: [] };
    }

    const headers = rows[0].map(normalizeHeader);
    const records = rows.slice(1).map((row, index) => {
      const data = {};
      headers.forEach((header, colIndex) => {
        data[header] = row[colIndex] ?? '';
      });

      return {
        rowNumber: index + 2,
        data
      };
    });

    return { headers, records };
  }

  async appendWorkerRow(values) {
    await this.sheetsClient.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.workersRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] }
    });
  }

  async updateWorkerRow(rowNumber, values) {
    if (!rowNumber || rowNumber < 2) {
      throw new AppError('INTERNAL_ERROR', 'Fila invalida para actualizar', 500);
    }

    const rangePrefix = this.workersRange.split('!')[0];
    const range = `${rangePrefix}!A${rowNumber}:Z${rowNumber}`;

    await this.sheetsClient.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] }
    });
  }
}

module.exports = { SheetsGateway, normalizeHeader };
