import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ListadoRecepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const consultarRecepciones = async () => {
    const { data, error } = await supabase
      .from("recepciones")
      .select("*")
      .order("id", { ascending: false });

    return { data, error };
  };

  const cargarRecepciones = async ({ mostrarCarga = false } = {}) => {
    if (mostrarCarga) {
      setCargando(true);
    }

    setErrorCarga("");

    const { data, error } = await consultarRecepciones();

    if (error) {
      console.error("Error al cargar:", error);
      setErrorCarga("No se pudieron cargar las recepciones.");
      setCargando(false);
      return;
    }

    setRecepciones(data ?? []);
    setCargando(false);
  };

  useEffect(() => {
    let activo = true;

    const cargarInicial = async () => {
      const { data, error } = await consultarRecepciones();

      if (!activo) {
        return;
      }

      if (error) {
        console.error("Error al cargar:", error);
        setErrorCarga("No se pudieron cargar las recepciones.");
        setCargando(false);
        return;
      }

      setRecepciones(data ?? []);
      setCargando(false);
    };

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  const eliminarRecepcion = async (id) => {
    const confirmarEliminacion = window.confirm(
      "¿Estás seguro de que querés eliminar esta recepción?",
    );

    if (!confirmarEliminacion) {
      return;
    }

    setCargando(true);

    const { error } = await supabase.from("recepciones").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar");
      setCargando(false);
      return;
    }

    cargarRecepciones();
  };

  const terminoBusqueda = busqueda.trim().toLowerCase();
  const recepcionesFiltradas = recepciones.filter((recepcion) => {
    if (!terminoBusqueda) {
      return true;
    }

    const textoBusqueda = [
      recepcion.numero_formulario,
      recepcion.cliente,
      recepcion.equipo,
      recepcion.falla_denunciada,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return textoBusqueda.includes(terminoBusqueda);
  });

  return (
    <div>
      <h2>Listado de recepciones</h2>

      <div className="buscador-listado">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por formulario, cliente, equipo o falla"
        />
      </div>

      {cargando ? (
        <p>Cargando recepciones...</p>
      ) : errorCarga ? (
        <p>{errorCarga}</p>
      ) : recepciones.length === 0 ? (
        <p>No hay recepciones cargadas.</p>
      ) : recepcionesFiltradas.length === 0 ? (
        <p>No se encontraron recepciones con esa búsqueda.</p>
      ) : (
        <>
          <table className="tabla tabla-desktop">
            <thead>
              <tr>
                <th>N° Formulario</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Falla</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recepcionesFiltradas.map((r) => (
                <tr key={r.id}>
                  <td>{r.numero_formulario}</td>
                  <td className="celda-fecha">{r.fecha_ingreso}</td>
                  <td>{r.cliente}</td>
                  <td>{r.equipo}</td>
                  <td>{r.falla_denunciada}</td>
                  <td>
                    <div className="acciones-tabla">
                      <Link to={`/recepcion/${r.id}`} className="btn-secundario">
                        Imprimir
                      </Link>
                      <Link to={`/editar/${r.id}`} className="btn-editar">
                        Editar
                      </Link>
                      <button
                        onClick={() => eliminarRecepcion(r.id)}
                        className="btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="recepciones-mobile">
            {recepcionesFiltradas.map((r) => (
              <article key={r.id} className="recepcion-card">
                <div className="recepcion-card-top">
                  <span className="recepcion-chip">#{r.numero_formulario}</span>
                  <span className="recepcion-fecha">{r.fecha_ingreso || "-"}</span>
                </div>

                <div className="recepcion-card-body">
                  <div className="recepcion-campo">
                    <span>Cliente</span>
                    <strong>{r.cliente || "-"}</strong>
                  </div>
                  <div className="recepcion-campo">
                    <span>Equipo</span>
                    <strong>{r.equipo || "-"}</strong>
                  </div>
                  <div className="recepcion-campo">
                    <span>Falla</span>
                    <strong>{r.falla_denunciada || "-"}</strong>
                  </div>
                </div>

                <div className="acciones-tabla acciones-tabla-mobile">
                  <Link to={`/recepcion/${r.id}`} className="btn-secundario">
                    Imprimir
                  </Link>
                  <Link to={`/editar/${r.id}`} className="btn-editar">
                    Editar
                  </Link>
                  <button
                    onClick={() => eliminarRecepcion(r.id)}
                    className="btn-eliminar"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ListadoRecepciones;
