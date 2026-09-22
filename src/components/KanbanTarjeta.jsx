import { Link } from "react-router-dom";
import { useDraggable } from "@dnd-kit/core";

function KanbanTarjeta({ recepcion, onAbrirTareas }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(recepcion.id),
  });

  const tareas = recepcion.tareas ?? [];
  const tareasHechas = tareas.filter((t) => t.estado === "HECHO").length;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 10 : undefined,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-tarjeta${isDragging ? " kanban-tarjeta-arrastrando" : ""}`}
    >
      <div className="kanban-tarjeta-top" {...listeners} {...attributes}>
        <span className="recepcion-chip">#{recepcion.numero_formulario}</span>
        <span className="kanban-arrastrar" title="Arrastrar para cambiar de estado">
          ⠿
        </span>
      </div>

      <strong className="kanban-equipo">{recepcion.equipo || "Equipo sin nombre"}</strong>
      <p className="kanban-cliente">{recepcion.cliente || "-"}</p>
      {recepcion.falla_denunciada && (
        <p className="kanban-falla">Falla: {recepcion.falla_denunciada}</p>
      )}

      <div className="kanban-acciones">
        <Link to={`/recepcion/${recepcion.id}`} className="btn-secundario kanban-ver">
          Ver
        </Link>
      </div>

      <button type="button" className="btn-tareas" onClick={() => onAbrirTareas(recepcion.id)}>
        Tareas {tareas.length > 0 ? `(${tareasHechas}/${tareas.length})` : ""}
      </button>
    </article>
  );
}

export default KanbanTarjeta;
