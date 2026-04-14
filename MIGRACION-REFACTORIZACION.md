# Guía de migración y refactorización

Esta guía documenta el proceso para transferir la base actual del proyecto hacia la nueva estructura modular, manteniendo seguridad, trazabilidad y capacidad de crecimiento.

## 1. Línea base y alcance

- Congelar una referencia estable en Git antes de iniciar cambios, idealmente con una etiqueta o commit identificable.
- Registrar qué vistas del frontend, rutas del backend, archivos de configuración y flujos de negocio entran en la migración.
- Separar explícitamente lo que no se tocará para evitar desviaciones durante la refactorización.
- Guardar evidencias previas: capturas de pantalla, ejemplos de respuestas HTTP y comportamiento esperado de cada flujo crítico.

## 2. Medidas de seguridad

- Mantener autenticación Basic solo como compatibilidad temporal durante la transición y eliminar `BASIC_AUTH_PASS` cuando la migración esté validada.
- Usar siempre `BASIC_AUTH_PASSWORD_HASH` en formato `pbkdf2$ITERACIONES$SALT$HASH` y no almacenar credenciales en el código.
- Validar y sanitizar entradas con esquemas explícitos antes de llegar a la lógica de negocio.
- Limitar peticiones por IP, forzar HTTPS en producción y restringir CORS al origen del frontend desplegado.
- Propagar `X-Request-Id` en cada respuesta para auditoría, trazabilidad y soporte operativo.
- Revisar dependencias y variables de entorno antes de cada despliegue o entrega de rama.

## 3. Arquitectura modular y escalable

- Mantener la separación por capas: presentación, aplicación, dominio, infraestructura y shared.
- Definir responsabilidades claras: controladores para entrada y salida, servicios para reglas de negocio, repositorios para acceso a datos y adaptadores para integraciones externas.
- Evitar dependencias cruzadas entre módulos de dominio y detalles de infraestructura.
- En frontend, centralizar configuración, estado, acceso a datos y helpers de UI en módulos independientes para facilitar pruebas y reemplazos.
- Reutilizar contratos estables entre capas para que futuras pantallas o integraciones no obliguen a reescribir la base.

## 4. Migración paso a paso de las vistas del frontend

1. Inventariar cada vista existente y su equivalente en `frontend/refactor`.
2. Definir el flujo de datos que consume la vista, qué estados maneja y qué validaciones necesita.
3. Migrar primero las vistas menos acopladas para reducir el riesgo y validar el patrón de integración.
4. Reutilizar componentes, estilos y utilidades comunes en vez de duplicar lógica entre versiones.
5. Mantener coexistencia temporal entre la vista anterior y la nueva hasta confirmar paridad funcional.
6. Validar accesibilidad, responsive design y manejo de errores en la nueva versión antes de retirar la anterior.
7. Retirar la vista antigua solo cuando la nueva tenga cobertura de pruebas suficiente y aprobación funcional.

### Herramientas recomendadas para la migración

- Git para ramas, diffs y rollback.
- Navegador con DevTools para revisar renderizado, red y errores de consola.
- Postman o Insomnia para validar consumo de endpoints durante la transición.
- npm y los scripts del proyecto para levantar backend y frontend localmente.

## 5. Estrategia de pruebas local

- Levantar el backend con `npm run dev` en `backend` y validar que el entorno local use las variables correctas.
- Comparar la versión previa y la refactorizada con pruebas manuales sobre los mismos casos de uso.
- Ejecutar pruebas de humo sobre autenticación, lectura, creación, actualización y borrado de trabajadores.
- Validar respuestas HTTP, tiempos de carga, manejo de errores y consistencia visual entre ambas versiones.
- Registrar los resultados de cada corrida, incluyendo fallos conocidos y correcciones aplicadas.
- Mantener un checklist de validación antes de mover una vista a producción o retirar la implementación antigua.

## 6. Escalabilidad futura

- Mantener el backend preparado para más módulos siguiendo el mismo patrón de capas.
- Introducir nuevos servicios o adaptadores sin romper los contratos existentes.
- Consolidar observabilidad con logs estructurados, identificadores de solicitud y métricas operativas.
- Preparar el frontend para dividir vistas, componentes y estados por dominio si el volumen funcional crece.
- Revisar periódicamente caché, límites de tasa, validación y tiempos de respuesta para anticipar cuellos de botella.
- Documentar cualquier cambio de contrato entre frontend y backend antes de implementarlo.

## 7. Criterios de aceptación para dar por terminada la migración

- La nueva vista reproduce el comportamiento esperado de la anterior.
- El backend responde con las mismas reglas funcionales y controles de seguridad.
- Las pruebas locales pasan sin regresiones en los flujos críticos.
- La documentación refleja la arquitectura final y los pasos de operación.
- Existe un plan claro de rollback y de mantenimiento posterior.

## 8. Recomendaciones operativas

- Revisar esta guía en cada cambio relevante de arquitectura.
- Mantener los README enlazados a esta documentación para que el punto de entrada sea único.
- Añadir notas de versión o bitácora de cambios cuando se complete una vista o módulo.
- Evitar migraciones masivas sin validación incremental.
