import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import NuevaRecepcion from "./pages/NuevaRecepcion";
import ListadoRecepciones from "./pages/ListadoRecepciones";
import EditarRecepcion from "./pages/EditarRecepcion";
import DetalleRecepcion from "./pages/DetalleRecepcion";
import Login from "./pages/Login";
import { supabase } from "./lib/supabase";

function App() {
  const [session, setSession] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const cargarSesion = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setCargandoSesion(false);
    };

    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCargandoSesion(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`No se pudo cerrar la sesión: ${error.message}`);
    }
  };

  if (cargandoSesion) {
    return <p className="auth-status">Verificando sesión...</p>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Layout userEmail={session.user?.email} onSignOut={cerrarSesion}>
      <Routes>
        <Route path="/" element={<ListadoRecepciones />} />
        <Route path="/nueva" element={<NuevaRecepcion />} />
        <Route path="/editar/:id" element={<EditarRecepcion />} />
        <Route path="/recepcion/:id" element={<DetalleRecepcion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
