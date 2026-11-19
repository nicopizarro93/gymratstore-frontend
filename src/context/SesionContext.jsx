/**
 * Gymratstore - contexto de sesión conectado al backend (JWT).
 *
 *  - login/registrar llaman a la API, guardan los tokens y el usuario.
 *  - Al cargar la app (también tras recargar la página) la sesión se restaura desde
 *    localStorage y se VERIFICA contra el backend con GET /auth/me: si el token ya no
 *    sirve (y no se pudo renovar), la sesión se cierra sola.
 *  - Si el cliente HTTP no logra renovar el token, emite "gr:sesion-expirada".
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Sesion from "../data/sesion.js";
import { authApi } from "../api/index.js";
import { getTokens, setTokens } from "../api/client.js";

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(() => (getTokens() ? Sesion.getSesion() : null));

  const abrirSesion = useCallback((respuesta) => {
    setTokens(respuesta);
    setSesion(Sesion.guardarSesion(respuesta.usuario));
    return respuesta.usuario;
  }, []);

  const logout = useCallback(() => {
    Sesion.cerrarSesion();
    setSesion(null);
  }, []);

  // Vuelve a pedir los datos del usuario (ej. tras comprar un plan cambia su membresía).
  const refrescar = useCallback(async () => {
    const usuario = await authApi.me();
    setSesion(Sesion.guardarSesion(usuario));
    return usuario;
  }, []);

  // Al montar: validar la sesión restaurada contra el backend.
  useEffect(() => {
    if (!getTokens() || !Sesion.getSesion()) return;
    authApi.me().then(
      (usuario) => setSesion(Sesion.guardarSesion(usuario)),
      (error) => {
        if (error.status === 401 || error.status === 403) logout();
      }
    );
  }, [logout]);

  // Si el cliente HTTP no pudo renovar el token, cerrar sesión.
  useEffect(() => {
    window.addEventListener("gr:sesion-expirada", logout);
    return () => window.removeEventListener("gr:sesion-expirada", logout);
  }, [logout]);

  const value = useMemo(
    () => ({
      sesion,
      // Lanza ApiError (401 = credenciales incorrectas).
      async login(correo, clave) {
        return abrirSesion(await authApi.login(correo, clave));
      },
      // Crea la cuenta (siempre rol Cliente) y deja la sesión abierta.
      async registrar(datos) {
        return abrirSesion(await authApi.registro(datos));
      },
      refrescar,
      logout,
      puedeAcceder(rolesPermitidos) {
        return Sesion.puedeAcceder(sesion, rolesPermitidos);
      },
    }),
    [sesion, abrirSesion, refrescar, logout]
  );

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  return ctx;
}
