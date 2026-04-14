const { z } = require('zod');

const estadoSchema = z.enum(['activo', 'inactivo']);

const createTrabajadorSchema = z.object({
  id: z.string().trim().min(1).max(50),
  nombre: z.string().trim().min(2).max(120),
  documento: z.string().trim().max(40).optional().default(''),
  telefono: z.string().trim().min(7).max(20).optional().default(''),
  correo: z.string().trim().email().optional().or(z.literal('')).default(''),
  cargo: z.string().trim().max(80).optional().default(''),
  especialidad: z.string().trim().min(2).max(80).optional().default(''),
  salarioBase: z.coerce.number().nonnegative().optional().default(0),
  fechaIngreso: z.string().trim().max(40).optional().default(''),
  estado: estadoSchema.optional().default('activo'),
  tipoCuenta: z.string().trim().max(60).optional().default(''),
  tarifaDiaria: z.coerce.number().nonnegative().optional().default(0)
});

const updateTrabajadorSchema = createTrabajadorSchema
  .omit({ id: true })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar'
  });

module.exports = {
  createTrabajadorSchema,
  updateTrabajadorSchema
};
