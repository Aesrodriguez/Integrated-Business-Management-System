# Backend Node.js + Google Sheets

API REST con arquitectura limpia para operar sobre Google Sheets.

## Guía de migración

Para documentar el proceso de refactorización y transferencia del sistema, revisa la [guía de migración y refactorización](../MIGRACION-REFACTORIZACION.md).

## Capas

- `src/presentation`: rutas y controladores
- `src/application`: lógica de negocio
- `src/domain`: esquemas, mapeadores y repositorios
- `src/infrastructure`: Google Sheets, cache y adaptadores
- `src/shared`: errores, validación y seguridad

## Instalación

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Endpoints

- `GET /health`
- `GET /docs`
- `GET /api/v1/trabajadores`
- `GET /api/v1/trabajadores/:id`
- `POST /api/v1/trabajadores`
- `PUT /api/v1/trabajadores/:id`
- `DELETE /api/v1/trabajadores/:id`

Todos los endpoints de `/api/v1/*` usan autenticación Basic.

## Seguridad

- Usa `BASIC_AUTH_PASSWORD_HASH` con formato `pbkdf2$ITERACIONES$SALT$HASH`.
- Solo habilita `BASIC_AUTH_PASS` como respaldo temporal durante la migración.
- Define `CORS_ALLOWED_ORIGINS` con la URL del frontend desplegado en Vercel.
- En producción se fuerza HTTPS y se limita el número de peticiones por IP.
- Cada respuesta lleva `X-Request-Id` para auditoría y trazabilidad.

## Despliegue en Render

Para el backend desplegado en Render, conviene definir estas variables:

- `NODE_ENV=production`
- `FORCE_HTTPS=true`
- `TRUST_PROXY=true`
- `CORS_ALLOWED_ORIGINS=<url-del-frontend>`
- `BASIC_AUTH_PASSWORD_HASH=<hash-pbkdf2>`
- `GOOGLE_PRIVATE_KEY` con saltos de línea escapados como `\n`

Si usas `BASIC_AUTH_PASS` solo debe ser temporal durante la migración.

No subas archivos `.env` al repositorio. Mantén secretos solo en Environment Variables de Render y usa `.env` únicamente para desarrollo local.

## Pruebas locales

- Levanta el backend con `npm run dev`.
- Valida la API con herramientas como Postman o Insomnia antes de tocar producción.
- Compara respuestas entre la versión previa y la refactorizada en los mismos casos de uso.

## Generar hash de contraseña

El backend incluye un helper para generar hashes PBKDF2-SHA256. Puedes usar una cadena segura y guardarla en tus variables de entorno.
