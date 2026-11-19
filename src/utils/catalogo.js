/**
 * Gymratstore - datos de referencia y helpers puros (sin acceso a red ni a
 * localStorage). Antes vivían dentro de data/mockData.js; los datos reales
 * (productos, usuarios, boletas) ahora llegan desde la API del backend.
 */

// Regiones y comunas disponibles en los formularios (lista acotada de ejemplo).
export const REGIONES = {
  "Región Metropolitana": ["Santiago", "Providencia", "Las Condes", "Maipú", "Puente Alto", "La Florida"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Quillota"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Chillán"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
};

export const CATEGORIAS_PLAN = ["Plan Mensual", "Plan Trimestral", "Plan Semestral", "Plan Anual"];
export const CATEGORIAS_SUPLEMENTO = ["Proteínas", "Creatina", "Pre-entreno", "Vitaminas", "Accesorios", "Snacks"];

const ICONO_POR_CATEGORIA = {
  "Plan Mensual": "bi-calendar-week",
  "Plan Trimestral": "bi-calendar3",
  "Plan Semestral": "bi-calendar3-range",
  "Plan Anual": "bi-calendar-heart",
  "Proteínas": "bi-cup-straw",
  "Creatina": "bi-capsule",
  "Pre-entreno": "bi-lightning-charge",
  "Vitaminas": "bi-capsule-pill",
  "Accesorios": "bi-bag",
  "Snacks": "bi-egg-fried",
};

export function getComunas(region) {
  return REGIONES[region] || [];
}

export function getIconoCategoria(categoria) {
  return ICONO_POR_CATEGORIA[categoria] || "bi-box-seam";
}

// Formatea un número como moneda chilena (32990 -> "$32.990").
export function formatoCLP(valor) {
  try {
    return valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  } catch (e) {
    return "$" + valor;
  }
}

// Precio a cobrar: el de oferta si existe y es menor al normal (mismo criterio que el backend).
export function getPrecioEfectivo(producto) {
  if (producto && producto.precioOferta != null && producto.precioOferta < producto.precio) {
    return producto.precioOferta;
  }
  return producto ? producto.precio : 0;
}

export function estaEnOferta(producto) {
  return producto.precioOferta != null && producto.precioOferta < producto.precio;
}

// "Activa" | "Vencida" | "Sin plan", recalculado contra la fecha de hoy.
export function getEstadoMembresia(usuario) {
  if (!usuario || !usuario.membresia || !usuario.membresia.fechaFin) return "Sin plan";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(usuario.membresia.fechaFin + "T00:00:00");
  return fin >= hoy ? "Activa" : "Vencida";
}

// Nombre a mostrar de una boleta: el alumno registrado o "Nombre (invitado)".
export function nombreClienteOrden(orden) {
  if (orden.run) return orden.cliente || orden.run;
  if (orden.invitado && orden.invitado.nombre) return `${orden.invitado.nombre} (invitado)`;
  return "Invitado";
}
