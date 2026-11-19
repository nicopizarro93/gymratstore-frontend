/**
 * Pruebas de componente para ProductoCard (React Testing Library + Vitest):
 * renderizado, renderizado condicional, props y eventos.
 * El catálogo (que en la app viene de la API) se simula con un mock del contexto.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductoCard from "./ProductoCard.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";
import { getCarrito } from "../data/carrito.js";

const CREATINA = { codigo: "SUP-CREA01", tipo: "Suplemento", categoria: "Creatina", nombre: "Creatina Monohidratada 300g", precio: 19990, precioOferta: null, stock: 10 };
const PRE = { codigo: "SUP-PRE01", tipo: "Suplemento", categoria: "Pre-entreno", nombre: "Pre-entreno Explosivo", precio: 24990, precioOferta: 19990, stock: 5 };
const catalogo = [CREATINA, PRE];

vi.mock("../context/CatalogoContext.jsx", () => ({
  useCatalogo: () => ({ getProductoPorCodigo: (c) => catalogo.find((p) => p.codigo === c) || null }),
}));

function renderCard(producto) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <CarritoProvider>
          <ProductoCard producto={producto} />
        </CarritoProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

describe("ProductoCard - renderizado y props", () => {
  it("muestra el nombre y la categoría del producto recibido", () => {
    renderCard(CREATINA);
    expect(screen.getByText(CREATINA.nombre)).toBeTruthy();
    expect(screen.getByText(CREATINA.categoria)).toBeTruthy();
  });
});

describe("ProductoCard - renderizado condicional (oferta)", () => {
  it("muestra el badge 'Oferta' si hay precioOferta menor al precio", () => {
    renderCard(PRE);
    expect(screen.getByText(/oferta/i)).toBeTruthy();
  });
  it("no muestra el badge 'Oferta' sin descuento", () => {
    renderCard(CREATINA);
    expect(screen.queryByText(/oferta/i)).toBeNull();
  });
});

describe("ProductoCard - evento: agregar al carrito", () => {
  it("al hacer click agrega el producto al carrito", () => {
    renderCard(CREATINA);
    fireEvent.click(screen.getByRole("button", { name: /agregar al carrito/i }));
    const item = getCarrito().find((i) => i.codigo === CREATINA.codigo);
    expect(item).toBeTruthy();
    expect(item.cantidad).toBe(1);
  });
  it("el botón queda deshabilitado sin stock", () => {
    renderCard({ ...CREATINA, stock: 0 });
    expect(screen.getByRole("button", { name: /agregar al carrito/i }).disabled).toBe(true);
  });
});
