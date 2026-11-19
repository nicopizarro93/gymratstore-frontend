/**
 * Gymratstore - sesión del usuario en el navegador.
 *
 * Qué se guarda y dónde (localStorage, así sobrevive a recargas de página):
 *   - gr_tokens : { accessToken, refreshToken }  -> los administra api/client.js
 *   - gr_sesion : datos públicos del usuario (run, nombre, tipoUsuario, membresía...)
 *                 usados para pintar la interfaz. NUNCA se guarda la contraseña.
 *
 * La interfaz solo OCULTA opciones según el rol; la seguridad real la aplica el backend
 * (cada endpoint valida el token y el rol), así que modificar gr_sesion a mano no da acceso.
 */
import { clearTokens } from "../api/client.js";

const KEY_SESION = "gr_sesion";

export function guardarSesion(usuario) {
  try {
    localStorage.setItem(KEY_SESION, JSON.stringify(usuario));
  } catch (e) {
    /* noop */
  }
  return usuario;
}

export function getSesion() {
  try {
    const raw = localStorage.getItem(KEY_SESION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(KEY_SESION);
  } catch (e) {
    /* noop */
  }
  clearTokens();
}

// Regla pura de control de acceso: sin sesión no entra; con sesión, solo si el
// rol está en la lista (o la lista es null = cualquier sesión activa).
export function puedeAcceder(sesion, rolesPermitidos) {
  if (!sesion) return false;
  if (!rolesPermitidos) return true;
  return rolesPermitidos.indexOf(sesion.tipoUsuario) !== -1;
}
