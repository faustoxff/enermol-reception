import { generarTextoDiagnostico, ESTADOS_RECEPCION } from "../lib/recepciones";

function RecepcionForm({
  formData,
  onChange,
  onSubmit,
  submitLabel,
}) {
  const textoDiagnostico = generarTextoDiagnostico(formData.costoDiagnostico);

  return (
    <form onSubmit={onSubmit} className="formulario">
      <label className="campo-etiquetado">
        <span>N° de formulario</span>
        <input
          name="numeroFormulario"
          value={formData.numeroFormulario}
          readOnly
          required
        />
      </label>

      <label className="campo-etiquetado">
        <span>Fecha de ingreso</span>
        <input
          name="fechaIngreso"
          type="date"
          value={formData.fechaIngreso}
          onChange={onChange}
          required
        />
      </label>

      <label className="campo-etiquetado">
        <span>Estado</span>
        <select name="estado" value={formData.estado} onChange={onChange}>
          {ESTADOS_RECEPCION.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </label>

      <label className="campo-etiquetado">
        <span>Cliente</span>
        <input
          name="cliente"
          placeholder="Cliente"
          value={formData.cliente}
          onChange={onChange}
          required
        />
      </label>

      <label className="campo-etiquetado">
        <span>Dirección</span>
        <input
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>CUIT / DNI</span>
        <input
          name="cuit"
          placeholder="CUIT / DNI"
          value={formData.cuit}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Teléfono</span>
        <input
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={onChange}
        />
      </label>

      <label className="checkbox">
        <input
          name="adjuntaFactura"
          type="checkbox"
          checked={formData.adjuntaFactura}
          onChange={onChange}
        />
        Adjunta factura
      </label>

      {formData.adjuntaFactura && (
        <>
          <label className="campo-etiquetado">
            <span>Fecha de factura</span>
            <input
              name="fechaFactura"
              type="date"
              value={formData.fechaFactura}
              onChange={onChange}
            />
          </label>

          <label className="campo-etiquetado">
            <span>Número de factura</span>
            <input
              name="numeroFactura"
              placeholder="Número de factura"
              value={formData.numeroFactura}
              onChange={onChange}
            />
          </label>
        </>
      )}

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

      <label className="campo-etiquetado">
        <span>Segmento</span>
        <input
          name="segmento"
          placeholder="Segmento"
          value={formData.segmento}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Equipo</span>
        <input
          name="equipo"
          placeholder="Equipo"
          value={formData.equipo}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Accesorios</span>
        <input
          name="accesorios"
          placeholder="Accesorios"
          value={formData.accesorios}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Falla denunciada</span>
        <input
          name="fallaDenunciada"
          placeholder="Falla denunciada"
          value={formData.fallaDenunciada}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Estado general</span>
        <input
          name="estadoGeneral"
          placeholder="Estado general"
          value={formData.estadoGeneral}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado campo-etiquetado-full">
        <span>Observaciones</span>
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={formData.observaciones}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado">
        <span>Costo de diagnóstico</span>
        <input
          name="costoDiagnostico"
          placeholder="Ej: 15000 pesos"
          value={formData.costoDiagnostico}
          onChange={onChange}
        />
      </label>

      <label className="campo-etiquetado campo-etiquetado-full">
        <span>Condiciones del diagnóstico</span>
        <div className="texto-estatico-diagnostico">{textoDiagnostico}</div>
      </label>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default RecepcionForm;
