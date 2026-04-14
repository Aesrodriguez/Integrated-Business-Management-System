const { z } = require('zod');

const estadoSchema = z.enum(['activo', 'inactivo']);

const createTrabajadorSchema = z.object({
  id: z.string().trim().min(1).max(50),
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().min(7).max(20).optional().default(''),
  especialidad: z.string().trim().min(2).max(80).optional().default(''),
  estado: estadoSchema.optional().default('activo'),
  tarifaDiaria: z.coerce.number().nonnegative().default(0)
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
