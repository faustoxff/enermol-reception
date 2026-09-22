import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { supabase } from "../lib/supabase";
import { ESTADOS_TALLER } from "../lib/recepciones";
import TareasModal from "../components/TareasModal";
import KanbanColumna from "../components/KanbanColumna";
import KanbanTarjeta from "../components/KanbanTarjeta";

function SeguimientoRecepciones() {
  const [recepciones, setRecepciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [vista, setVista] = useState("tablero");
  const [busqueda, setBusqueda] = useState("");
  const [recepcionTareasId, setRecepcionTareasId] = useState(null);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const consultarRecepciones = async () => {
    const { data, error } = await supabase
      .from("recepciones")
      .select("*")
      .order("id", { ascending: false });

    return { data, error };
  };

  const cargarRecepciones = async () => {
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

  const cambiarEstado = async (id, nuevoEstado) => {
    setRecepciones((actuales) =>
      actuales.map((r) => (r.id === id ? { ...r, estado_taller: nuevoEstado } : r)),
    );

    const { error } = await supabase
      .from("recepciones")
      .update({ estado_taller: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const manejarFinDeArrastre = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const id = Number(active.id);
    const nuevoEstado = over.id;
    const recepcion = recepciones.find((r) => r.id === id);

    if (!recepcion || (recepcion.estado_taller ?? "INGRESO") === nuevoEstado) {
      return;
    }

    cambiarEstado(id, nuevoEstado);
  };

  const guardarTareas = async (id, nuevasTareas) => {
    setRecepciones((actuales) =>
      actuales.map((r) => (r.id === id ? { ...r, tareas: nuevasTareas } : r)),
    );

    const { error } = await supabase
      .from("recepciones")
      .update({ tareas: nuevasTareas })
      .eq("id", id);

    if (error) {
      console.error("Error al guardar tareas:", error);
      alert("No se pudieron guardar las tareas.");
    }
  };

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

  if (cargando) {
    return <p>Cargando seguimiento...</p>;
  }

  if (errorCarga) {
    return <p>{errorCarga}</p>;
  }

  if (vista === "listado") {
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
        <div className="seguimiento-toolbar">
          <h2>Listado de recepciones</h2>
          <button
            type="button"
            className="btn-secundario"
            onClick={() => setVista("tablero")}
          >
            Volver al tablero
          </button>
        </div>

        <div className="buscador-listado">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por formulario, cliente, equipo o falla"
          />
        </div>

        {recepciones.length === 0 ? (
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

  return (
    <div>
      <div className="seguimiento-toolbar">
        <h2>Seguimiento de máquinas</h2>
        <button
          type="button"
          className="btn-secundario"
          onClick={() => setVista("listado")}
        >
          Ver listado completo
        </button>
      </div>

      {recepciones.length === 0 ? (
        <p>No hay recepciones cargadas.</p>
      ) : (
        <DndContext sensors={sensores} onDragEnd={manejarFinDeArrastre}>
          <div className="kanban-board">
            {ESTADOS_TALLER.map((estado) => {
              const recepcionesDelEstado = recepciones.filter(
                (r) => (r.estado_taller ?? "INGRESO") === estado.value,
              );

              return (
                <KanbanColumna
                  key={estado.value}
                  estado={estado}
                  cantidad={recepcionesDelEstado.length}
                >
                  {recepcionesDelEstado.length === 0 ? (
                    <p className="kanban-vacio">Sin máquinas</p>
                  ) : (
                    recepcionesDelEstado.map((r) => (
                      <KanbanTarjeta
                        key={r.id}
                        recepcion={r}
                        onAbrirTareas={setRecepcionTareasId}
                      />
                    ))
                  )}
                </KanbanColumna>
              );
            })}
          </div>
        </DndContext>
      )}

      {recepcionTareasId !== null && (
        <TareasModal
          recepcion={recepciones.find((r) => r.id === recepcionTareasId)}
          onGuardarTareas={guardarTareas}
          onCerrar={() => setRecepcionTareasId(null)}
        />
      )}
    </div>
  );
}

export default SeguimientoRecepciones;
