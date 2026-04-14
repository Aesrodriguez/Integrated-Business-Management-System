#!/bin/sh
set -eu

if [ "$#" -lt 1 ]; then
  echo "Uso: ./scripts/safe-commit.sh \"tipo(scope): mensaje descriptivo\""
  exit 1
fi

message="$1"
repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [ -n "$(git status --porcelain)" ]; then
  :
else
  echo "No hay cambios para commitear."
  exit 1
fi

# Staging de archivos modificados y nuevos
# El pre-commit validara sintaxis y formato.
git add -A

if ! git commit -m "$message"; then
  echo "Commit cancelado por validacion."
  echo "Se conserva el estado de archivos para que puedas corregir."
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if git push origin "$branch"; then
  echo "Commit y push completados en $branch"
  exit 0
fi

echo "Push fallido. Revirtiendo commit local para volver al estado previo..."
git reset --soft HEAD~1
exit 1
