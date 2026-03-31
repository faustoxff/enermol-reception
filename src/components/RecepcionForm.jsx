import { generarTextoDiagnostico } from "../lib/recepciones";

function RecepcionForm({
  formData,
  onChange,
  onSubmit,
  submitLabel,
}) {
  const textoDiagnostico = generarTextoDiagnostico(formData.costoDiagnostico);

  return (
    <form onSubmit={onSubmit} className="formulario">
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
        value={formData.fechaIngreso}
        onChange={onChange}
        required
      />

      <input
        name="cliente"
        placeholder="Cliente"
        value={formData.cliente}
        onChange={onChange}
        required
      />
      <input
        name="direccion"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={onChange}
      />
      <input
        name="cuit"
        placeholder="CUIT / DNI"
        value={formData.cuit}
        onChange={onChange}
      />
      <input
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={onChange}
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={onChange}
      />

      <label className="checkbox">
        <input
          name="adjuntaFactura"
          type="checkbox"
          checked={formData.adjuntaFactura}
          onChange={onChange}
        />
        Adjunta factura
      </label>

      <input
        name="fechaFactura"
        type="date"
        value={formData.fechaFactura}
        onChange={onChange}
      />
      <input
        name="numeroFactura"
        placeholder="Número de factura"
        value={formData.numeroFactura}
        onChange={onChange}
      />

      <label className="campo-etiquetado">
        <span>¿En garantía?</span>
        <select name="garantia" value={formData.garantia} onChange={onChange}>
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
          onChange={onChange}
        >
          <option value="SI">Sí</option>
          <option value="NO">No</option>
        </select>
      </label>

      <input
        name="segmento"
        placeholder="Segmento"
        value={formData.segmento}
        onChange={onChange}
      />
      <input
        name="equipo"
        placeholder="Equipo"
        value={formData.equipo}
        onChange={onChange}
      />
      <input
        name="accesorios"
        placeholder="Accesorios"
        value={formData.accesorios}
        onChange={onChange}
      />
      <input
        name="fallaDenunciada"
        placeholder="Falla denunciada"
        value={formData.fallaDenunciada}
        onChange={onChange}
      />
      <input
        name="estadoGeneral"
        placeholder="Estado general"
        value={formData.estadoGeneral}
        onChange={onChange}
      />
      <textarea
        name="observaciones"
        placeholder="Observaciones"
        value={formData.observaciones}
        onChange={onChange}
      ></textarea>

      <input
        name="costoDiagnostico"
        placeholder="Costo de diagnóstico (ej: 15000 pesos)"
        value={formData.costoDiagnostico}
        onChange={onChange}
      />

      <label className="campo-etiquetado campo-etiquetado-full">
        <span>Condiciones del diagnóstico</span>
        <div className="texto-estatico-diagnostico">{textoDiagnostico}</div>
      </label>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default RecepcionForm;
