# Gymratstore – Frontend (React + Vite)

Tienda online de planes de gimnasio y suplementos. Consume el backend Spring Boot
(`gymratstore-backend`) mediante una API REST protegida con JWT.
DSY1104 Desarrollo Fullstack II – Evaluación Parcial 3 (Duoc UC).

Integrantes: Humberto, Alexis Acuña, Nicolás Pizarro.

## Cómo funciona la integración
- `src/api/client.js`: cliente `fetch` con `Authorization: Bearer <token>`, renovación automática con refresh token y manejo de errores (`ApiError`).
- `src/api/index.js`: una función por endpoint (`authApi`, `productosApi`, `categoriasApi`, `usuariosApi`, `boletasApi`).
- `SesionContext`: login/registro, tokens y datos del usuario en `sessionStorage`; al recargar la página la sesión se restaura y se valida con `GET /auth/me` (al cerrar la pestaña se borra).
- `CatalogoContext`: catálogo cargado desde `GET /productos`.
- Carrito en el navegador; al pagar se envía a `POST /boletas` (el servidor recalcula precios, valida stock y crea la membresía si hay un plan).
- Rutas protegidas por rol (`ProtectedRoute`): `/admin` (Administrador, Vendedor), `/admin/alumnos` (solo Administrador). La seguridad real la aplica el backend (401/403).

## Ejecutar
```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8080/api/v1
npm install
npm run dev              # http://localhost:5173
npm test
```

## Docker
Se levanta junto al backend y MySQL con el `docker-compose.yml` del repo `gymratstore-backend`
(`docker compose up --build`, frontend en http://localhost:3000).
Imagen propia: `docker build --build-arg VITE_API_URL=http://localhost:8080/api/v1 -t gymratstore-frontend .`

## Usuarios de prueba
Los crea el backend al iniciar (ver README del backend).

## Nota de seguridad
El JWT se guarda en `sessionStorage` (se borra al cerrar la pestaña, más seguro que `localStorage`, aunque sigue expuesto a XSS; en producción convendría una cookie HttpOnly). El carrito y el tema se guardan en `localStorage`.
