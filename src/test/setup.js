// Setup global de Vitest: agrega los matchers de jest-dom (toBeInTheDocument,
// toHaveTextContent, etc.) a `expect`, y limpia localStorage y sessionStorage entre cada test
// para que las pruebas de carrito/sesión no se contaminen entre sí (varias
// usan las mismas llaves de almacenamiento que el sitio real).
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
