/**
 * Gymratstore - cliente HTTP hacia el backend Spring Boot (fetch).
 *
 * - Todas las rutas cuelgan de VITE_API_URL (por defecto http://localhost:8080/api/v1).
 * - Si hay sesión, agrega "Authorization: Bearer <accessToken>" a cada petición.
 * - Si el backend responde 401 (access token vencido) intenta UNA vez renovar los
 *   tokens con el refresh token y repite la petición; si la renovación falla, borra
 *   la sesión y avisa con el evento "gr:sesion-expirada" (lo escucha SesionContext).
 * - Los errores del backend se transforman en ApiError(status, message, detalles).
 */
export const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

const KEY_TOKENS = "gr_tokens";

export class ApiError extends Error {
  constructor(status, message, detalles = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalles = detalles;
  }
}

// ---- almacenamiento de tokens (sessionStorage: sobrevive a recargas de página, pero se borra al cerrar la pestaña) ----
export function getTokens() {
  try {
    const raw = sessionStorage.getItem(KEY_TOKENS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setTokens(tokens) {
  try {
    sessionStorage.setItem(KEY_TOKENS, JSON.stringify({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));
  } catch (e) {
    /* sin sessionStorage la sesión dura solo mientras no se recargue */
  }
}

export function clearTokens() {
  try {
    sessionStorage.removeItem(KEY_TOKENS);
  } catch (e) {
    /* noop */
  }
}

// ---- renovación de tokens (una sola a la vez aunque fallen varias peticiones juntas) ----
let renovando = null;

function renovarTokens() {
  const tokens = getTokens();
  if (!tokens || !tokens.refreshToken) return Promise.reject(new Error("sin refresh token"));
  if (!renovando) {
    renovando = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("refresh rechazado");
        const datos = await res.json();
        setTokens(datos);
        return datos;
      })
      .finally(() => {
        renovando = null;
      });
  }
  return renovando;
}

/**
 * request("/productos")                       -> GET publico
 * request("/productos", {method:"POST", body}) -> con body JSON
 * request("/auth/login", {body, auth:false})  -> sin enviar token
 */
export async function request(ruta, { method, body, auth = true } = {}) {
  const verbo = method || (body !== undefined ? "POST" : "GET");

  const enviar = () => {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const tokens = auth ? getTokens() : null;
    if (tokens && tokens.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
    return fetch(`${BASE_URL}${ruta}`, {
      method: verbo,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res;
  try {
    res = await enviar();
  } catch (e) {
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa que el backend esté en ejecución.");
  }

  if (res.status === 401 && auth && getTokens() && getTokens().refreshToken) {
    try {
      await renovarTokens();
      res = await enviar();
    } catch (e) {
      clearTokens();
      window.dispatchEvent(new Event("gr:sesion-expirada"));
    }
  }

  if (res.status === 204) return null;

  let datos = null;
  try {
    datos = await res.json();
  } catch (e) {
    /* respuesta sin cuerpo JSON */
  }
  if (!res.ok) {
    throw new ApiError(res.status, (datos && datos.message) || `Error ${res.status}`, (datos && datos.detalles) || []);
  }
  return datos;
}
