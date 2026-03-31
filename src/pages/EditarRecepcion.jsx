import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generarTextoDiagnostico } from "../lib/recepciones";

const estadoInicial = {
  numeroFormulario: "",
  fechaIngreso: "",
  cliente: "",
  direccion: "",
  cuit: "",
  telefono: "",
  email: "",
  adjuntaFactura: false,
  fechaFactura: "",
  numeroFactura: "",
  garantia: "NO",
  periodoGarantia: "NO",
  costoDiagnostico: "",
  condicionesDiagnostico: generarTextoDiagnostico(),
  observaciones: "",
  segmento: "",
  equipo: "",
  accesorios: "",
  fallaDenunciada: "",
  estadoGeneral: "",
};

function EditarRecepcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    const cargarRecepcion = async () => {
      setCargando(true);
      setNoEncontrada(false);

      const { data, error } = await supabase
        .from("recepciones")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        console.error("Error al cargar la recepción:", error);
        setNoEncontrada(true);
        setCargando(false);
        return;
      }

      if (!data) {
        setNoEncontrada(true);
        setCargando(false);
        return;
      }

      setFormData({
        numeroFormulario: data.numero_formulario ?? "",
        fechaIngreso: data.fecha_ingreso ?? "",
        cliente: data.cliente ?? "",
        direccion: data.direccion ?? "",
        cuit: data.cuit ?? "",
        telefono: data.telefono ?? "",
        email: data.email ?? "",
        adjuntaFactura: data.adjunta_factura ?? false,
        fechaFactura: data.fecha_factura ?? "",
        numeroFactura: data.numero_factura ?? "",
        garantia: data.garantia ?? "NO",
        periodoGarantia: data.periodo_garantia ?? "NO",
        costoDiagnostico: data.diagnostico_costo ?? "",
        observaciones: data.observaciones ?? "",
        segmento: data.segmento ?? "",
        equipo: data.equipo ?? "",
        accesorios: data.accesorios ?? "",
        fallaDenunciada: data.falla_denunciada ?? "",
        estadoGeneral: data.estado_general ?? "",
      });
      setCargando(false);
    };

    cargarRecepcion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("recepciones")
      .update({
        numero_formulario: formData.numeroFormulario,
        fecha_ingreso: formData.fechaIngreso,
        cliente: formData.cliente,
        direccion: formData.direccion,
        cuit: formData.cuit,
        telefono: formData.telefono,
        email: formData.email,
        adjunta_factura: formData.adjuntaFactura,
        fecha_factura: formData.fechaFactura || null,
        numero_factura: formData.numeroFactura,
        garantia: formData.garantia,
        periodo_garantia: formData.periodoGarantia,
        diagnostico_costo: formData.costoDiagnostico || null,
        condiciones_diagnostico: generarTextoDiagnostico(formData.costoDiagnostico),
        observaciones: formData.observaciones,
        segmento: formData.segmento,
        equipo: formData.equipo,
        accesorios: formData.accesorios,
        falla_denunciada: formData.fallaDenunciada,
        estado_general: formData.estadoGeneral,
      })
      .eq("id", Number(id));

    if (error) {
      console.error("Error al actualizar:", error);
      alert(`Error al actualizar: ${error.message}`);
      return;
    }

    alert("Recepción actualizada correctamente");
    navigate("/");
  };

  if (cargando) {
    return <p>Cargando recepción...</p>;
  }

  if (noEncontrada) {
    return <p>Recepción no encontrada.</p>;
  }

  return (
    <div>
      <h2>Editar recepción</h2>
      {(() => {
        const textoDiagnostico = generarTextoDiagnostico(formData.costoDiagnostico);

        return (

      <form onSubmit={handleSubmit} className="formulario">
        <input name="numeroFormulario" value={formData.numeroFormulario} readOnly />
        <input name="fechaIngreso" type="date" value={formData.fechaIngreso} onChange={handleChange} />

        <input name="cliente" value={formData.cliente} onChange={handleChange} />
        <input name="direccion" value={formData.direccion} onChange={handleChange} />
        <input name="cuit" value={formData.cuit} onChange={handleChange} />
        <input name="telefono" value={formData.telefono} onChange={handleChange} />
        <input name="email" value={formData.email} onChange={handleChange} />

        <label className="checkbox">
          <input
            name="adjuntaFactura"
            type="checkbox"
            checked={formData.adjuntaFactura}
            onChange={handleChange}
          />
          Adjunta factura
        </label>

        <input name="fechaFactura" type="date" value={formData.fechaFactura} onChange={handleChange} />
        <input name="numeroFactura" value={formData.numeroFactura} onChange={handleChange} />

        <label className="campo-etiquetado">
          <span>¿En garantía?</span>
          <select name="garantia" value={formData.garantia} onChange={handleChange}>
            <option value="SI">Sí</option>
            <option value="NO">No</option>
            <option value="A CONFIRMAR">A confirmar</option>
          </select>
        </label>

        <label className="campo-etiquetado">
          <span>¿En período de garantía?</span>
          <select
            name="periodoGarantia"
            value={formData.periodoGarantia}
            onChange={handleChange}
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </label>

        <input name="segmento" value={formData.segmento} onChange={handleChange} />
        <input name="equipo" value={formData.equipo} onChange={handleChange} />
        <input name="accesorios" value={formData.accesorios} onChange={handleChange} />
        <input name="fallaDenunciada" value={formData.fallaDenunciada} onChange={handleChange} />
        <input name="estadoGeneral" value={formData.estadoGeneral} onChange={handleChange} />
        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange}></textarea>

        <input
          name="costoDiagnostico"
          placeholder="Costo de diagnóstico (ej: 15000 pesos)"
          value={formData.costoDiagnostico}
          onChange={handleChange}
        />

        <label className="campo-etiquetado campo-etiquetado-full">
          <span>Condiciones del diagnóstico</span>
          <div className="texto-estatico-diagnostico">{textoDiagnostico}</div>
        </label>

        <button type="submit">Guardar cambios</button>
      </form>
        );
      })()}
    </div>
  );
}

export default EditarRecepcion;
