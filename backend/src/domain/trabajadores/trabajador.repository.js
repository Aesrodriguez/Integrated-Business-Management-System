const { AppError } = require('../../shared/errors/AppError');
const { fromSheet, toSheet } = require('./trabajador.mapper');

const CACHE_KEY = 'workers:list';

class TrabajadorRepository {
  constructor({ sheetsGateway, cache }) {
    this.sheetsGateway = sheetsGateway;
    this.cache = cache;
  }

  async findAll({ useCache = true } = {}) {
    if (useCache) {
      const cached = this.cache.get(CACHE_KEY);
      if (cached) {
        return { records: cached, cached: true };
      }
    }

    const { records } = await this.sheetsGateway.readWorkersTable();
    const normalized = records
      .map((row) => ({
        rowNumber: row.rowNumber,
        ...fromSheet(row.data)
      }))
      .filter((item) => item.id && item.nombre);

    this.cache.set(CACHE_KEY, normalized);
    return { records: normalized, cached: false };
  }

  async findById(id) {
    const { records } = await this.findAll();
    return records.find((item) => item.id === id) || null;
  }

  async create(payload) {
    const now = new Date().toISOString();
    const existing = await this.findById(payload.id);
    if (existing) {
      throw new AppError('CONFLICT', 'Ya existe un trabajador con ese id', 409);
    }

    const entity = {
      ...payload,
      createdAt: now,
      updatedAt: now
    };

    await this.sheetsGateway.appendWorkerRow(toSheet(entity, now));
    this.cache.del(CACHE_KEY);
    return entity;
  }

  async update(id, payload) {
    const current = await this.findById(id);
    if (!current) {
      throw new AppError('NOT_FOUND', 'Trabajador no encontrado', 404);
    }

    const next = {
      ...current,
      ...payload,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };

    await this.sheetsGateway.updateWorkerRow(current.rowNumber, toSheet(next, next.updatedAt));
    this.cache.del(CACHE_KEY);
    return next;
  }
}

module.exports = { TrabajadorRepository };
