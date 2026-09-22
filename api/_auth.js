import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks;

const getJwks = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));
  }
  return jwks;
};

export async function requireAuth(req, res) {
  const encabezado = req.headers.authorization || "";
  const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "No autenticado" });
    return null;
  }

  try {
    const issuer = new URL(process.env.NEON_AUTH_BASE_URL).origin;
    const { payload } = await jwtVerify(token, getJwks(), { issuer });
    return payload;
  } catch {
    res.status(401).json({ message: "Sesión inválida o expirada" });
    return null;
  }
}
