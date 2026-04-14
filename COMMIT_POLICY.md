# Commit policy

Este repo usa hooks locales para mejorar la calidad de commits.

## Reglas automáticas

- `pre-commit`: valida sintaxis en archivos JS y formato JSON de los archivos en staging.
- `commit-msg`: exige mensajes relevantes en formato:
  - `tipo(scope): descripcion clara`
  - Ejemplo: `fix(frontend): avoid 401 by proxying api calls`

Tipos permitidos:

- `feat`
- `fix`
- `docs`
- `refactor`
- `chore`
- `test`
- `perf`
- `build`
- `ci`
- `revert`

## Flujo recomendado

1. Editar cambios.
2. Ejecutar `./scripts/safe-commit.sh "tipo(scope): mensaje descriptivo"`.
3. Si la validacion falla, no se hace commit ni push.
4. Si push falla, el script revierte el commit local (`git reset --soft HEAD~1`) y deja archivos staged para reintentar.
