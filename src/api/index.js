/**
 * Gymratstore - funciones de la API REST (una por endpoint del backend, v1).
 * Las pantallas nunca llaman a fetch directamente: usan estas funciones.
 */
import { request } from "./client.js";

export const authApi = {
  login: (correo, clave) => request("/auth/login", { method: "POST", body: { correo, clave }, auth: false }),
  registro: (datos) => request("/auth/registro", { method: "POST", body: datos, auth: false }),
  me: () => request("/auth/me"),
};

export const productosApi = {
  listar: () => request("/productos"),
  ofertas: () => request("/productos/ofertas"),
  obtener: (codigo) => request(`/productos/${encodeURIComponent(codigo)}`),
  crear: (producto) => request("/productos", { method: "POST", body: producto }),
  actualizar: (codigo, producto) => request(`/productos/${encodeURIComponent(codigo)}`, { method: "PUT", body: producto }),
  eliminar: (codigo) => request(`/productos/${encodeURIComponent(codigo)}`, { method: "DELETE" }),
};

export const categoriasApi = {
  listar: () => request("/categorias"),
};

export const usuariosApi = {
  listar: (tipo) => request(tipo ? `/usuarios?tipo=${encodeURIComponent(tipo)}` : "/usuarios"),
  obtener: (run) => request(`/usuarios/${encodeURIComponent(run)}`),
  crear: (usuario) => request("/usuarios", { method: "POST", body: usuario }),
  actualizar: (run, usuario) => request(`/usuarios/${encodeURIComponent(run)}`, { method: "PUT", body: usuario }),
  eliminar: (run) => request(`/usuarios/${encodeURIComponent(run)}`, { method: "DELETE" }),
};

export const boletasApi = {
  // body: { items:[{codigo,cantidad}], invitado?:{nombre,correo,direccion}, direccionEnvio? }
  crear: (body) => request("/boletas", { method: "POST", body }),
  listar: () => request("/boletas"),
  misCompras: () => request("/boletas/mis-compras"),
  obtener: (id) => request(`/boletas/${encodeURIComponent(id)}`),
};
