/**
 * Gymratstore - carrito de compras. El carrito es estado del navegador (no se guarda
 * en el backend hasta que se paga): vive en localStorage y se envía a POST /boletas
 * al confirmar. Las funciones reciben el producto real del catálogo (que viene de la API).
 */
import { getPrecioEfectivo } from "../utils/catalogo.js";

const KEY_CARRITO = "gr_carrito";

export function getCarrito() {
  try {
    const raw = localStorage.getItem(KEY_CARRITO);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function guardarCarrito(carrito) {
  try {
    localStorage.setItem(KEY_CARRITO, JSON.stringify(carrito));
  } catch (e) {
    /* sigue funcionando en memoria */
  }
}

// Agrega "cantidad" unidades de un producto. Un Plan nunca se suma: queda siempre en 1.
export function agregarAlCarrito(producto, cantidad = 1) {
  const carrito = getCarrito();
  const item = carrito.find((i) => i.codigo === producto.codigo);
  if (item) {
    if (producto.tipo !== "Plan") item.cantidad += cantidad;
  } else {
    carrito.push({
      codigo: producto.codigo,
      nombre: producto.nombre,
      tipo: producto.tipo,
      precio: getPrecioEfectivo(producto), // solo para mostrar: el backend recalcula el precio real
      cantidad: producto.tipo === "Plan" ? 1 : cantidad,
    });
  }
  guardarCarrito(carrito);
  return carrito;
}

export function actualizarCantidadCarrito(codigo, cantidad) {
  const carrito = getCarrito()
    .map((item) => (item.codigo === codigo ? { ...item, cantidad } : item))
    .filter((item) => item.cantidad > 0);
  guardarCarrito(carrito);
  return carrito;
}

export function quitarDelCarrito(codigo) {
  const carrito = getCarrito().filter((item) => item.codigo !== codigo);
  guardarCarrito(carrito);
  return carrito;
}

export function limpiarCarrito() {
  guardarCarrito([]);
}

// Ítems del carrito que ya no alcanzan según el stock actual del catálogo.
export function getItemsSinStock(carrito, productos) {
  return carrito
    .map((item) => {
      const producto = productos.find((p) => p.codigo === item.codigo);
      return { codigo: item.codigo, nombre: item.nombre, pedido: item.cantidad, disponible: producto ? producto.stock : 0 };
    })
    .filter((it) => it.pedido > it.disponible);
}
