/**
 * Gymratstore - catálogo de productos cargado desde la API (GET /productos).
 * Se carga una vez al abrir la app y se vuelve a pedir (recargar) cuando cambia:
 * tras una compra (baja el stock) o tras crear/editar/eliminar un producto en el admin.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { productosApi } from "../api/index.js";
import { estaEnOferta } from "../utils/catalogo.js";

const CatalogoContext = createContext(null);

export function CatalogoProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(async () => {
    try {
      setProductos(await productosApi.listar());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const value = useMemo(
    () => ({
      productos,
      cargando,
      error,
      recargar,
      getProductoPorCodigo: (codigo) => productos.find((p) => p.codigo === codigo) || null,
      getProductosPorTipo: (tipo) => productos.filter((p) => p.tipo === tipo),
      productosEnOferta: productos.filter(estaEnOferta),
    }),
    [productos, cargando, error, recargar]
  );

  return <CatalogoContext.Provider value={value}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo() {
  const ctx = useContext(CatalogoContext);
  if (!ctx) throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  return ctx;
}
