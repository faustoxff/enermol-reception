import { useState } from "react";
import { authClient } from "../lib/authClient";

function Login({ onSesionIniciada }) {
  const [modo, setModo] = useState("ingresar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    const { data, error: errorAuth } =
      modo === "ingresar"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: nombre });

    setCargando(false);

    if (errorAuth) {
      setError(errorAuth.message || "No se pudo completar la operación.");
      return;
    }

    onSesionIniciada(data);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-kicker">ENERMOL</p>
        <h1>{modo === "ingresar" ? "Ingreso al panel" : "Crear cuenta"}</h1>
        <p className="auth-copy">
          {modo === "ingresar"
            ? "Iniciá sesión con tu usuario administrador para acceder al sistema de recepciones."
            : "Creá el usuario administrador del panel."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {modo === "crear" && (
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={cargando}>
            {cargando
              ? "Procesando..."
              : modo === "ingresar"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          className="auth-alternar"
          onClick={() => {
            setError("");
            setModo(modo === "ingresar" ? "crear" : "ingresar");
          }}
        >
          {modo === "ingresar"
            ? "¿Primera vez? Crear el usuario administrador"
            : "Ya tengo cuenta, ingresar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
