/**
 * Gymratstore - contexto del carrito (estado local en localStorage; se envía al
 * backend recién al pagar). Usa el catálogo de la API para conocer los productos.
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as Carrito from "../data/carrito.js";
import { useCatalogo } from "./CatalogoContext.jsx";
import { useToast } from "./ToastContext.jsx";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => Carrito.getCarrito());
  const { getProductoPorCodigo } = useCatalogo();
  const { mostrarToast } = useToast();

  const sync = useCallback((nuevoCarrito) => setCarrito(nuevoCarrito), []);

  const value = useMemo(
    () => ({
      carrito,
      totalCarrito: carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
      cantidadItems: carrito.reduce((acc, i) => acc + i.cantidad, 0),

      agregar(codigo, cantidad = 1) {
        const producto = getProductoPorCodigo(codigo);
        if (!producto) return;
        sync(Carrito.agregarAlCarrito(producto, cantidad));
        mostrarToast(`"${producto.nombre}" se agregó al carrito.`);
      },
      actualizarCantidad(codigo, cantidad) {
        sync(Carrito.actualizarCantidadCarrito(codigo, cantidad));
      },
      quitar(codigo) {
        sync(Carrito.quitarDelCarrito(codigo));
      },
      limpiar() {
        Carrito.limpiarCarrito();
        sync([]);
      },
    }),
    [carrito, getProductoPorCodigo, mostrarToast, sync]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
