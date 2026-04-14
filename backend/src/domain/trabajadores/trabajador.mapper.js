function normalizeValue(value) {
  return value == null ? '' : String(value).trim();
}

function fromSheet(row) {
  if (!row) return {};
  return {
    id: normalizeValue(row.id || row.ID || row.Id),
    nombre: normalizeValue(row.nombre || row.Nombre || row.nombre_completo),
    telefono: normalizeValue(row.telefono || row.Telefono),
    especialidad: normalizeValue(row.especialidad || row.Especialidad),
    estado: normalizeValue(row.estado || row.Estado || 'activo') || 'activo',
    tarifaDiaria: Number(row.tarifa_diaria || row.tarifaDiaria || row.Tarifa_Diaria || 0),
    createdAt: normalizeValue(row.created_at || row.createdAt),
    updatedAt: normalizeValue(row.updated_at || row.updatedAt)
  };
}

function toSheet(entity, timestamp) {
  const now = timestamp || new Date().toISOString();
  return [
    entity.id || '',
    entity.nombre || '',
    entity.telefono || '',
    entity.especialidad || '',
    entity.estado || 'activo',
    entity.tarifaDiaria || 0,
    entity.createdAt || now,
    entity.updatedAt || now
  ];
}

module.exports = { fromSheet, toSheet };
