# Frontend refactor

Esta carpeta contiene:

- `refactor/`: nueva estructura modular para la interfaz.

## Objetivos

- separación por capas de UI, estado y acceso a datos
- estilos con variables CSS y componentes reutilizables
- carga diferida de datos para reducir peticiones innecesarias
- soporte responsive desde el inicio

## Nueva estructura

- `frontend/refactor/index.html`: shell principal
- `frontend/refactor/styles.css`: sistema visual unificado
- `frontend/refactor/js/config.js`: configuración y constantes
- `frontend/refactor/js/state.js`: estado global observable
- `frontend/refactor/js/api.js`: capa de acceso a Apps Script / backend
- `frontend/refactor/js/ui.js`: helpers de interfaz y componentes
- `frontend/refactor/js/app.js`: arranque y composición de vistas
