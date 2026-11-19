/**
 * Gymratstore - muestra un aviso de carga o de error mientras el catálogo viene de la API,
 * y solo renderiza las pantallas cuando ya hay datos reales.
 */
import Alert from "react-bootstrap/Alert";
import { useCatalogo } from "../context/CatalogoContext.jsx";

export default function CatalogoGate({ children }) {
  const { cargando, error, recargar } = useCatalogo();

  if (cargando) {
    return (
      <div className="container py-5 text-center text-muted-gr">
        <div className="spinner-border" role="status" aria-hidden="true" />
        <p className="mt-3 mb-0">Cargando catálogo…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          <strong>No se pudo cargar la tienda.</strong> {error}
          <div className="mt-2">
            <button type="button" className="btn btn-sm btn-brand-outline" onClick={recargar}>Reintentar</button>
          </div>
        </Alert>
      </div>
    );
  }
  return children;
}
