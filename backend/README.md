# Backend Node.js + Google Sheets

API REST con arquitectura limpia para operar sobre Google Sheets.

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

## Generar hash de contraseña

El backend incluye un helper para generar hashes PBKDF2-SHA256. Puedes usar una cadena segura y guardarla en tus variables de entorno.
