import { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ESTADOS_RECEPCION, ESTADO_BADGE_CLASS } from "../lib/recepciones";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 20;

const FILTROS_INICIAL = {
  busqueda: "",
  busquedaAplicada: "",
  estado: "",
  fechaDesde: "",
  fechaHasta: "",
  pagina: 0,
  refreshKey: 0,
};

const filtrosReducer = (state, action) => {
  switch (action.type) {
    case "SET_BUSQUEDA":
      return { ...state, busqueda: action.value };
    case "APLICAR_BUSQUEDA":
      return { ...state, busquedaAplicada: action.value, pagina: 0 };
    case "SET_ESTADO":
      return { ...state, estado: action.value, pagina: 0 };
    case "SET_FECHA_DESDE":
      return { ...state, fechaDesde: action.value, pagina: 0 };
    case "SET_FECHA_HASTA":
      return { ...state, fechaHasta: action.value, pagina: 0 };
    case "SET_PAGINA":
      return { ...state, pagina: action.value };
    case "LIMPIAR":
      return { ...FILTROS_INICIAL, refreshKey: state.refreshKey + 1 };
    case "REFRESH":
      return { ...state, pagina: 0, refreshKey: state.refreshKey + 1 };
    default:
      return state;
  }
};

const fetchRecepciones = ({ pagina, busquedaAplicada, estado, fechaDesde, fechaHasta }) => {
  let query = supabase
    .from("recepciones")
    .select("id, numero_formulario, fecha_ingreso, cliente, equipo, falla_denunciada, estado", { count: "exact" })
    .order("id", { ascending: false })
    .range(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE - 1);

  if (busquedaAplicada)
    query = query.or(
      `numero_formulario.ilike.%${busquedaAplicada}%,cliente.ilike.%${busquedaAplicada}%,equipo.ilike.%${busquedaAplicada}%,falla_denunciada.ilike.%${busquedaAplicada}%`
    );
  if (estado)     query = query.eq("estado", estado);
  if (fechaDesde) query = query.gte("fecha_ingreso", fechaDesde);
  if (fechaHasta) query = query.lte("fecha_ingreso", fechaHasta);

  return query;
};

function ListadoRecepciones() {
  const [filtros, dispatch] = useReducer(filtrosReducer, FILTROS_INICIAL);
  const [recepciones, setRecepciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const { busqueda, busquedaAplicada, estado, fechaDesde, fechaHasta, pagina, refreshKey } = filtros;

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "APLICAR_BUSQUEDA", value: busqueda.trim() });
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Fetch principal — sin setCargando(true) en el body del efecto
  useEffect(() => {
    let activo = true;

    fetchRecepciones({ pagina, busquedaAplicada, estado, fechaDesde, fechaHasta })
      .then(({ data, error, count }) => {
        if (!activo) return;
        if (error) {
          console.error("Error al cargar:", error);
          setErrorCarga("No se pudieron cargar las recepciones.");
        } else {
          setErrorCarga("");
          setRecepciones(data ?? []);
          setTotal(count ?? 0);
        }
        setCargando(false);
      });

    return () => { activo = false; };
  }, [pagina, busquedaAplicada, estado, fechaDesde, fechaHasta, refreshKey]);

  const eliminarRecepcion = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar esta recepción?")) return;

    const { error } = await supabase.from("recepciones").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar la recepción");
      return;
    }

    toast.success("Recepción eliminada");
    dispatch({ type: "REFRESH" });
  };

  const hayFiltros = busquedaAplicada || estado || fechaDesde || fechaHasta;
  const totalPaginas = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div>
      <h2>Listado de recepciones</h2>

      <div className="filtros-listado">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => dispatch({ type: "SET_BUSQUEDA", value: e.target.value })}
          placeholder="Buscar por formulario, cliente, equipo o falla"
          className="filtro-busqueda"
        />

        <select
          value={estado}
          onChange={(e) => dispatch({ type: "SET_ESTADO", value: e.target.value })}
          className="filtro-select"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_RECEPCION.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <div className="filtro-fechas">
          <input
            type="date"
            value={fechaDesde}
            title="Desde"
            onChange={(e) => dispatch({ type: "SET_FECHA_DESDE", value: e.target.value })}
          />
          <span>—</span>
          <input
            type="date"
            value={fechaHasta}
            title="Hasta"
            onChange={(e) => dispatch({ type: "SET_FECHA_HASTA", value: e.target.value })}
          />
        </div>

        {hayFiltros && (
          <button type="button" className="btn-limpiar-filtros" onClick={() => dispatch({ type: "LIMPIAR" })}>
            Limpiar filtros
          </button>
        )}
      </div>

      {cargando ? (
        <p>Cargando recepciones...</p>
      ) : errorCarga ? (
        <p>{errorCarga}</p>
      ) : recepciones.length === 0 ? (
        <p>
          {hayFiltros
            ? "No se encontraron recepciones con esa búsqueda."
            : "No hay recepciones cargadas."}
        </p>
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recepciones.map((r) => (
                <tr key={r.id}>
                  <td>{r.numero_formulario}</td>
                  <td className="celda-fecha">{r.fecha_ingreso}</td>
                  <td>{r.cliente}</td>
                  <td>{r.equipo}</td>
                  <td>{r.falla_denunciada}</td>
                  <td>
                    <span className={`estado-badge ${ESTADO_BADGE_CLASS[r.estado] ?? ""}`}>
                      {r.estado || "-"}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <Link to={`/recepcion/${r.id}`} className="btn-secundario">Imprimir</Link>
                      <Link to={`/editar/${r.id}`} className="btn-editar">Editar</Link>
                      <button onClick={() => eliminarRecepcion(r.id)} className="btn-eliminar">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="recepciones-mobile">
            {recepciones.map((r) => (
              <article key={r.id} className="recepcion-card">
                <div className="recepcion-card-top">
                  <span className="recepcion-chip">#{r.numero_formulario}</span>
                  <span className={`estado-badge ${ESTADO_BADGE_CLASS[r.estado] ?? ""}`}>
                    {r.estado || "-"}
                  </span>
                </div>

                <div className="recepcion-card-body">
                  <div className="recepcion-campo">
                    <span>Fecha</span>
                    <strong>{r.fecha_ingreso || "-"}</strong>
                  </div>
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
                  <Link to={`/recepcion/${r.id}`} className="btn-secundario">Imprimir</Link>
                  <Link to={`/editar/${r.id}`} className="btn-editar">Editar</Link>
                  <button onClick={() => eliminarRecepcion(r.id)} className="btn-eliminar">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="paginacion">
            <button
              className="btn-secundario"
              onClick={() => dispatch({ type: "SET_PAGINA", value: pagina - 1 })}
              disabled={pagina === 0}
            >
              ← Anterior
            </button>
            <span className="paginacion-info">
              Página {pagina + 1} de {totalPaginas} · {total} resultado{total !== 1 ? "s" : ""}
            </span>
            <button
              className="btn-secundario"
              onClick={() => dispatch({ type: "SET_PAGINA", value: pagina + 1 })}
              disabled={(pagina + 1) * PAGE_SIZE >= total}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ListadoRecepciones;
