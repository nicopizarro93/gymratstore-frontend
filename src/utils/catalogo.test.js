import { describe, it, expect } from "vitest";
import { getPrecioEfectivo, estaEnOferta, getEstadoMembresia, getComunas, nombreClienteOrden } from "./catalogo.js";

describe("catálogo - helpers", () => {
  it("precio efectivo usa la oferta solo si es menor", () => {
    expect(getPrecioEfectivo({ precio: 100, precioOferta: 80 })).toBe(80);
    expect(getPrecioEfectivo({ precio: 100, precioOferta: 120 })).toBe(100);
    expect(getPrecioEfectivo({ precio: 100, precioOferta: null })).toBe(100);
    expect(estaEnOferta({ precio: 100, precioOferta: 80 })).toBe(true);
  });
  it("estado de membresía", () => {
    const fmt = (d) => d.toISOString().slice(0, 10);
    const futuro = new Date(Date.now() + 864e5 * 10);
    const pasado = new Date(Date.now() - 864e5 * 10);
    expect(getEstadoMembresia({ membresia: { fechaFin: fmt(futuro) } })).toBe("Activa");
    expect(getEstadoMembresia({ membresia: { fechaFin: fmt(pasado) } })).toBe("Vencida");
    expect(getEstadoMembresia({ membresia: null })).toBe("Sin plan");
  });
  it("comunas por región y nombre de cliente de la orden", () => {
    expect(getComunas("Región Metropolitana")).toContain("Santiago");
    expect(getComunas("X")).toEqual([]);
    expect(nombreClienteOrden({ run: null, invitado: { nombre: "Ana" } })).toBe("Ana (invitado)");
    expect(nombreClienteOrden({ run: "1-9", cliente: "Luis Soto" })).toBe("Luis Soto");
  });
});
