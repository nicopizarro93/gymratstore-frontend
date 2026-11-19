import { describe, it, expect, afterEach } from "vitest";
import { guardarSesion, getSesion, cerrarSesion, puedeAcceder } from "./sesion.js";
import { setTokens, getTokens } from "../api/client.js";

describe("sesión", () => {
  afterEach(() => cerrarSesion());

  it("guarda y recupera el usuario de la sesión", () => {
    guardarSesion({ run: "1", nombre: "Ana", tipoUsuario: "Cliente" });
    expect(getSesion().nombre).toBe("Ana");
  });
  it("getSesion() devuelve null si no hay sesión", () => {
    expect(getSesion()).toBeNull();
  });
  it("cerrarSesion() borra usuario y tokens", () => {
    setTokens({ accessToken: "a", refreshToken: "r" });
    guardarSesion({ run: "1", tipoUsuario: "Cliente" });
    cerrarSesion();
    expect(getSesion()).toBeNull();
    expect(getTokens()).toBeNull();
  });
});

describe("puedeAcceder() - control de acceso por rol", () => {
  it("sin sesión no entra", () => expect(puedeAcceder(null, ["Administrador"])).toBe(false));
  it("con sesión y sin restricción de rol entra", () => expect(puedeAcceder({ tipoUsuario: "Cliente" }, null)).toBe(true));
  it("solo entra si el rol está permitido", () => {
    expect(puedeAcceder({ tipoUsuario: "Vendedor" }, ["Administrador", "Vendedor"])).toBe(true);
    expect(puedeAcceder({ tipoUsuario: "Cliente" }, ["Administrador", "Vendedor"])).toBe(false);
  });
});
