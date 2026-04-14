# Frontend refactor

Esta carpeta contiene:

- `refactor/`: nueva estructura modular para la interfaz.

## Guía de migración

La descripción completa del proceso de traslado de vistas, validación local, seguridad y escalabilidad está en la [guía de migración y refactorización](../MIGRACION-REFACTORIZACION.md).

## Configuración en Vercel

- Define `API_URL` con la URL pública de Render.
- `TRIPLEA_API_BASE_URL` sigue soportada como alias, pero `API_URL` es el nombre recomendado.
- El frontend carga `/api/runtime-config.js` para exponer `API_URL` al navegador en tiempo de ejecución.

## Objetivos

- separación por capas de UI, estado y acceso a datos
- estilos con variables CSS y componentes reutilizables
- carga diferida de datos para reducir peticiones innecesarias
- soporte responsive desde el inicio
- migración incremental para convivir con la versión anterior mientras se valida cada pantalla

## Nueva estructura

- `frontend/refactor/index.html`: shell principal
- `frontend/refactor/styles.css`: sistema visual unificado
- `frontend/refactor/js/config.js`: configuración y constantes
- `frontend/refactor/js/state.js`: estado global observable
- `frontend/refactor/js/api.js`: capa de acceso a Apps Script / backend
- `frontend/refactor/js/ui.js`: helpers de interfaz y componentes
- `frontend/refactor/js/app.js`: arranque y composición de vistas
