import { describe, it, expect, beforeEach } from "vitest";
import { agregarAlCarrito, actualizarCantidadCarrito, quitarDelCarrito, getCarrito, getItemsSinStock } from "./carrito.js";

const SUP = { codigo: "S1", nombre: "Whey", tipo: "Suplemento", precio: 1000, precioOferta: 800, stock: 3 };
const PLAN = { codigo: "P1", nombre: "Plan Mensual", tipo: "Plan", precio: 30000, precioOferta: null, stock: 99 };

beforeEach(() => localStorage.clear());

describe("carrito", () => {
  it("usa el precio de oferta y suma cantidades de suplementos", () => {
    agregarAlCarrito(SUP, 1);
    agregarAlCarrito(SUP, 2);
    expect(getCarrito()).toEqual([{ codigo: "S1", nombre: "Whey", tipo: "Suplemento", precio: 800, cantidad: 3 }]);
  });
  it("un plan nunca pasa de 1 unidad", () => {
    agregarAlCarrito(PLAN, 1);
    agregarAlCarrito(PLAN, 1);
    expect(getCarrito()[0].cantidad).toBe(1);
  });
  it("actualizar a 0 o quitar elimina el ítem", () => {
    agregarAlCarrito(SUP, 1);
    expect(actualizarCantidadCarrito("S1", 0)).toEqual([]);
    agregarAlCarrito(SUP, 1);
    expect(quitarDelCarrito("S1")).toEqual([]);
  });
  it("detecta ítems sin stock suficiente", () => {
    const carrito = agregarAlCarrito(SUP, 5);
    expect(getItemsSinStock(carrito, [SUP])).toEqual([{ codigo: "S1", nombre: "Whey", pedido: 5, disponible: 3 }]);
  });
});
