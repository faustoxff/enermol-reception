import { useState } from "react";
import { ESTADOS_TAREA, crearTarea } from "../lib/recepciones";

function TareasModal({ recepcion, onGuardarTareas, onCerrar }) {
  const [textoNuevaTarea, setTextoNuevaTarea] = useState("");
  const tareas = recepcion.tareas ?? [];

  const guardar = (nuevasTareas) => {
    onGuardarTareas(recepcion.id, nuevasTareas);
  };

  const agregarTarea = (e) => {
    e.preventDefault();

    if (!textoNuevaTarea.trim()) {
      return;
    }

    guardar([...tareas, crearTarea(textoNuevaTarea.trim())]);
    setTextoNuevaTarea("");
  };

  const cambiarEstadoTarea = (id, estado) => {
    guardar(tareas.map((t) => (t.id === id ? { ...t, estado } : t)));
  };

  const cambiarNotaTarea = (id, nota) => {
    guardar(tareas.map((t) => (t.id === id ? { ...t, nota } : t)));
  };

  const eliminarTarea = (id) => {
    guardar(tareas.filter((t) => t.id !== id));
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-kicker">#{recepcion.numero_formulario}</p>
            <h3>{recepcion.equipo || "Equipo sin nombre"}</h3>
          </div>
          <button type="button" className="modal-cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>

        <div className="modal-tareas-lista">
          {tareas.length === 0 ? (
            <p className="kanban-vacio">Todavía no hay tareas cargadas.</p>
          ) : (
            tareas.map((tarea) => (
              <div key={tarea.id} className={`tarea-item tarea-${tarea.estado}`}>
                <div className="tarea-item-top">
                  <span className="tarea-texto">{tarea.texto}</span>
                  <button
                    type="button"
                    className="tarea-eliminar"
                    onClick={() => eliminarTarea(tarea.id)}
                    aria-label="Eliminar tarea"
                  >
                    ✕
                  </button>
                </div>

                <div className="tarea-item-controles">
                  <select
                    value={tarea.estado}
                    onChange={(e) => cambiarEstadoTarea(tarea.id, e.target.value)}
                  >
                    {ESTADOS_TAREA.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nota..."
                    value={tarea.nota}
                    onChange={(e) => cambiarNotaTarea(tarea.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <form className="modal-tareas-nueva" onSubmit={agregarTarea}>
          <input
            type="text"
            placeholder="Agregar tarea (ej: Pedir repuesto)"
            value={textoNuevaTarea}
            onChange={(e) => setTextoNuevaTarea(e.target.value)}
          />
          <button type="submit" className="btn-imprimir">
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}

export default TareasModal;
