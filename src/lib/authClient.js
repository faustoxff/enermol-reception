import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
});

// authClient.getJWTToken() apunta a un endpoint que no existe en este
// despliegue (404); pedimos el JWT directo al endpoint documentado.
export const obtenerToken = async () => {
  const respuesta = await fetch(`${import.meta.env.VITE_NEON_AUTH_URL}/token`, {
    credentials: "include",
  });

  if (!respuesta.ok) {
    return null;
  }

  const { token } = await respuesta.json();
  return token ?? null;
};
