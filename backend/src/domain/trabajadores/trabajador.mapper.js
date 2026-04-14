function normalizeValue(value) {
  return value == null ? '' : String(value).trim();
}

const requiredWorkerHeaders = [
  'id_trabajador',
  'nombre',
  'documento',
  'telefono',
  'correo',
  'cargo',
  'especialidad',
  'salario_base',
  'fecha_ingreso',
  'estado',
  'tipo_cuenta'
];

function normalizeEstado(value) {
  const normalized = normalizeValue(value).toLowerCase();
  if (!normalized) return 'activo';
  return normalized;
}

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function fromSheet(row) {
  if (!row) return {};
  return {
    id: normalizeValue(row.id_trabajador || row.id || row.ID || row.Id),
    nombre: normalizeValue(row.nombre || row.Nombre || row.nombre_completo),
    documento: normalizeValue(row.documento || row.Documento),
    telefono: normalizeValue(row.telefono || row.Telefono),
    correo: normalizeValue(row.correo || row.Correo || row.email),
    cargo: normalizeValue(row.cargo || row.Cargo),
    especialidad: normalizeValue(row.especialidad || row.Especialidad),
    salarioBase: normalizeNumber(row.salario_base || row.salarioBase),
    fechaIngreso: normalizeValue(row.fecha_ingreso || row.fechaIngreso),
    tipoCuenta: normalizeValue(row.tipo_cuenta || row.tipoCuenta),
    estado: normalizeEstado(row.estado || row.Estado),
    tarifaDiaria: normalizeNumber(row.tarifa_diaria || row.tarifaDiaria),
    createdAt: normalizeValue(row.created_at || row.createdAt),
    updatedAt: normalizeValue(row.updated_at || row.updatedAt)
  };
}

function toSheet(entity, timestamp) {
  return [
    entity.id || '',
    entity.nombre || '',
    entity.documento || '',
    entity.telefono || '',
    entity.correo || '',
    entity.cargo || '',
    entity.especialidad || '',
    entity.salarioBase || 0,
    entity.fechaIngreso || '',
    entity.estado || 'activo',
    entity.tipoCuenta || ''
  ];
}

module.exports = { fromSheet, toSheet, requiredWorkerHeaders };
