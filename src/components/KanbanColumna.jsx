import { Link } from "react-router-dom";
import { useDroppable } from "@dnd-kit/core";

function KanbanColumna({ estado, cantidad, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado.value });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-columna${isOver ? ` kanban-columna-activa-${estado.value}` : ""}`}
    >
      <div className={`kanban-columna-header kanban-${estado.value}`}>
        <span>{estado.label}</span>
        <div className="kanban-columna-header-acciones">
          <span className="kanban-contador">{cantidad}</span>
          {estado.value === "INGRESO" && (
            <Link
              to="/nueva"
              className="kanban-boton-nueva"
              title="Nueva recepción"
              aria-label="Nueva recepción"
            >
              +
            </Link>
          )}
        </div>
      </div>

      <div className="kanban-tarjetas">{children}</div>
    </div>
  );
}

export default KanbanColumna;
