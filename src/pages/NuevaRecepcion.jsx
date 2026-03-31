import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  generarNumeroFormulario,
  generarTextoDiagnostico,
} from "../lib/recepciones";

function NuevaRecepcion() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numeroFormulario: generarNumeroFormulario(),
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
    observaciones: "",
    segmento: "",
    equipo: "",
    accesorios: "",
    fallaDenunciada: "",
    estadoGeneral: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numeroFormulario = formData.numeroFormulario || generarNumeroFormulario();

    const { error } = await supabase.from("recepciones").insert([
      {
        numero_formulario: numeroFormulario,
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
      },
    ]);

    if (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
      return;
    }

    alert("Recepción guardada correctamente");
    navigate("/");
  };

  return (
    <div>
      <h2>Nueva recepción</h2>
      {(() => {
        const textoDiagnostico = generarTextoDiagnostico(formData.costoDiagnostico);

        return (

      <form onSubmit={handleSubmit} className="formulario">
        <input
          name="numeroFormulario"
          value={formData.numeroFormulario}
          readOnly
          aria-label="Número de formulario"
          required
        />
        <input
          name="fechaIngreso"
          type="date"
          onChange={handleChange}
          required
        />

        <input
          name="cliente"
          placeholder="Cliente"
          onChange={handleChange}
          required
        />
        <input
          name="direccion"
          placeholder="Dirección"
          onChange={handleChange}
        />
        <input name="cuit" placeholder="CUIT / DNI" onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />

        <label className="checkbox">
          <input
            name="adjuntaFactura"
            type="checkbox"
            onChange={handleChange}
          />
          Adjunta factura
        </label>

        <input name="fechaFactura" type="date" onChange={handleChange} />
        <input
          name="numeroFactura"
          placeholder="Número de factura"
          onChange={handleChange}
        />

        <label className="campo-etiquetado">
          <span>¿En garantía?</span>
          <select name="garantia" onChange={handleChange} value={formData.garantia}>
            <option value="SI">Sí</option>
            <option value="NO">No</option>
            <option value="A CONFIRMAR">A confirmar</option>
          </select>
        </label>

        <label className="campo-etiquetado">
          <span>¿En período de garantía?</span>
          <select
            name="periodoGarantia"
            onChange={handleChange}
            value={formData.periodoGarantia}
          >
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </label>

        <input name="segmento" placeholder="Segmento" onChange={handleChange} />
        <input name="equipo" placeholder="Equipo" onChange={handleChange} />
        <input name="accesorios" placeholder="Accesorios" onChange={handleChange} />
        <input
          name="fallaDenunciada"
          placeholder="Falla denunciada"
          onChange={handleChange}
        />
        <input
          name="estadoGeneral"
          placeholder="Estado general"
          onChange={handleChange}
        />
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          onChange={handleChange}
        ></textarea>

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

        <button type="submit">Guardar recepción</button>
      </form>
        );
      })()}
    </div>
  );
}

export default NuevaRecepcion;
