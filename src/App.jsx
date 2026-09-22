import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import NuevaRecepcion from "./pages/NuevaRecepcion";
import SeguimientoRecepciones from "./pages/SeguimientoRecepciones";
import EditarRecepcion from "./pages/EditarRecepcion";
import DetalleRecepcion from "./pages/DetalleRecepcion";
import Login from "./pages/Login";
import { authClient } from "./lib/authClient";

function App() {
  const [session, setSession] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const refrescarSesion = async () => {
    const { data } = await authClient.getSession();
    setSession(data ?? null);
    setCargandoSesion(false);
  };

  useEffect(() => {
    let activo = true;

    authClient.getSession().then(({ data }) => {
      if (!activo) {
        return;
      }
      setSession(data ?? null);
      setCargandoSesion(false);
    });

    return () => {
      activo = false;
    };
  }, []);

  const cerrarSesion = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      alert(`No se pudo cerrar la sesión: ${error.message}`);
      return;
    }

    setSession(null);
  };

  if (cargandoSesion) {
    return <p className="auth-status">Verificando sesión...</p>;
  }

  if (!session?.user) {
    return <Login onSesionIniciada={refrescarSesion} />;
  }

  return (
    <Layout userEmail={session.user?.email} onSignOut={cerrarSesion}>
      <Routes>
        <Route path="/" element={<SeguimientoRecepciones />} />
        <Route path="/nueva" element={<NuevaRecepcion />} />
        <Route path="/editar/:id" element={<EditarRecepcion />} />
        <Route path="/recepcion/:id" element={<DetalleRecepcion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
