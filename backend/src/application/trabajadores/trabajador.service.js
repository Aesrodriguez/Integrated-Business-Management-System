const { AppError } = require('../../shared/errors/AppError');

class TrabajadorService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async list({ estado }) {
    const { records, cached } = await this.repository.findAll();
    const filtered = estado ? records.filter((item) => item.estado === estado) : records;
    return {
      data: filtered.map(({ rowNumber, ...rest }) => rest),
      meta: {
        total: filtered.length,
        cached
      }
    };
  }

  async getById(id) {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new AppError('NOT_FOUND', 'Trabajador no encontrado', 404);
    }

    const { rowNumber, ...clean } = entity;
    return clean;
  }

  async create(payload) {
    return this.repository.create(payload);
  }

  async update(id, payload) {
    const updated = await this.repository.update(id, payload);
    const { rowNumber, ...clean } = updated;
    return clean;
  }

  async remove(id) {
    return this.update(id, { estado: 'inactivo' });
  }
}

module.exports = { TrabajadorService };
