import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const formatearFecha = (valor) => {
  if (!valor) {
    return valor;
  }
  return new Date(valor).toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const camposRecepcion = [
  { label: "Número de formulario", key: "numero_formulario" },
  { label: "Fecha de ingreso", key: "fecha_ingreso", format: formatearFecha },
  { label: "Cliente", key: "cliente" },
  { label: "Dirección", key: "direccion" },
  { label: "CUIT / DNI", key: "cuit" },
  { label: "Teléfono", key: "telefono" },
  { label: "Email", key: "email" },
  {
    label: "Adjunta factura",
    key: "adjunta_factura",
    format: (value) => (value ? "Sí" : "No"),
  },
  { label: "Fecha de factura", key: "fecha_factura", format: formatearFecha },
  { label: "Número de factura", key: "numero_factura" },
  {
    label: "En garantía",
    key: "garantia",
    format: (value) =>
      value === "SI" ? "Sí" : value === "A CONFIRMAR" ? "A confirmar" : "No",
  },
  {
    label: "En período de garantía",
    key: "periodo_garantia",
    format: (value) => (value === "SI" ? "Sí" : "No"),
  },
  {
    label: "Costo de diagnóstico",
    key: "diagnostico_costo",
    format: (value) => (value ? `$${value}` : value),
  },
  {
    label: "Condiciones del diagnóstico",
    key: "condiciones_diagnostico",
    fullWidth: true,
  },
  { label: "Segmento", key: "segmento" },
  { label: "Equipo", key: "equipo", fullWidth: true },
  { label: "Modelo / Código de equipo", key: "modelo_codigo" },
  { label: "N° de serie", key: "numero_serie" },
  { label: "Accesorios", key: "accesorios" },
  { label: "Falla denunciada", key: "falla_denunciada", fullWidth: true },
  { label: "Estado general", key: "estado_general" },
  { label: "Observaciones", key: "observaciones", fullWidth: true },
];

function DetalleRecepcion() {
  const { id } = useParams();
  const [recepcion, setRecepcion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarRecepcion = async () => {
      const { data, error } = await supabase
        .from("recepciones")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (!activo) {
        return;
      }

      if (error) {
        console.error("Error al cargar la recepción:", error);
        setErrorCarga("No se pudo cargar la recepción.");
        setCargando(false);
        return;
      }

      if (!data) {
        setErrorCarga("La recepción no existe o fue eliminada.");
        setCargando(false);
        return;
      }

      setRecepcion(data);
      setDestinatario(data.email ?? "");
      setCargando(false);
    };

    cargarRecepcion();

    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return <p>Cargando recepción...</p>;
  }

  if (errorCarga) {
    return <p>{errorCarga}</p>;
  }

  const enviarPorMail = async (e) => {
    e.preventDefault();

    if (!destinatario.trim()) {
      alert("Ingresá un email de destino.");
      return;
    }

    setEnviandoEmail(true);

    const { data, error } = await supabase.functions.invoke("send-recepcion-email", {
      body: {
        recepcionId: Number(id),
        destinatario: destinatario.trim(),
      },
    });

    setEnviandoEmail(false);

    if (error) {
      console.error("Error al enviar email:", error);
      alert("No se pudo enviar el mail. Revisá que la Edge Function esté desplegada y configurada.");
      return;
    }

    if (data?.error) {
      alert(data.error);
      return;
    }

    alert("Recepción enviada por mail correctamente.");
  };

  return (
    <div className="print-sheet">
      <div className="print-toolbar no-print">
        <Link to="/" className="btn-secundario">
          Volver
        </Link>
        <button type="button" className="btn-imprimir" onClick={() => window.print()}>
          Imprimir recepción
        </button>
      </div>

      <form className="email-panel no-print" onSubmit={enviarPorMail}>
        <div className="email-panel-copy">
          <h3>Enviar por mail</h3>
          <p>Mandá esta recepción a un cliente, proveedor o contacto interno.</p>
        </div>
        <div className="email-panel-actions">
          <input
            type="email"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="email-input"
            required
          />
          <button type="submit" className="btn-imprimir" disabled={enviandoEmail}>
            {enviandoEmail ? "Enviando..." : "Enviar por mail"}
          </button>
        </div>
      </form>

      <div className="vista-pantalla">
        <div className="print-header">
          <div>
            <p className="print-kicker">ENERMOL</p>
            <h2>Recepción de equipo</h2>
          </div>

          <div className="print-badge">
            <span>Formulario</span>
            <strong>{recepcion.numero_formulario || "-"}</strong>
          </div>

          <div className="print-protocolo">
            <p className="print-protocolo-titulo">🛠️ Protocolo de Servicio Técnico - Enermol®</p>
            <ul>
              <li>Procedimiento de Ingreso y Diagnóstico</li>
              <li>Costo del Diagnóstico</li>
              <li>Qué cubre</li>
              <li>Política de No Reembolso</li>
              <li>Pedido de Repuestos</li>
              <li>Políticas de Retiro y Abandono</li>
            </ul>
          </div>

          <div className="print-qr">
            <img src="/qr-enermol.png" alt="Más información de ENERMOL" />
            <span>Más info de ENERMOL</span>
          </div>
        </div>

        <div className="print-grid">
          {camposRecepcion.map((campo) => {
            const value = campo.format
              ? campo.format(recepcion[campo.key])
              : recepcion[campo.key];

            return (
              <section
                key={campo.key}
                className={`print-field${campo.fullWidth ? " print-field-full" : ""}`}
              >
                <span>{campo.label}</span>
                <strong>{value || "-"}</strong>
              </section>
            );
          })}
        </div>
      </div>

      <div className="recibo-impresion">
        <Recibo recepcion={recepcion} copia="Copia cliente" />
        <p className="recibo-corte">✂- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -✂</p>
        <Recibo recepcion={recepcion} copia="Copia taller" />
      </div>
    </div>
  );
}

function Recibo({ recepcion, copia }) {
  return (
    <div className="recibo-copia">
      <div className="recibo-header">
        <div>
          <strong>ENERMOL</strong> · Recepción de equipo
          <div className="recibo-formulario">N° {recepcion.numero_formulario || "-"}</div>
        </div>
        <img src="/qr-enermol.png" alt="Más información de ENERMOL" className="recibo-qr" />
      </div>

      <div className="recibo-lineas">
        {camposRecepcion.map((campo) => {
          const value = campo.format
            ? campo.format(recepcion[campo.key])
            : recepcion[campo.key];

          return (
            <p key={campo.key}>
              <span>{campo.label}:</span> {value || "-"}
            </p>
          );
        })}
      </div>

      <p className="recibo-protocolo">
        🛠️ Protocolo: Ingreso y Diagnóstico · Costo del Diagnóstico · Qué cubre · No Reembolso ·
        Pedido de Repuestos · Retiro y Abandono — más info en enermol.com.ar
      </p>

      <p className="recibo-pie">{copia}</p>
    </div>
  );
}

export default DetalleRecepcion;
