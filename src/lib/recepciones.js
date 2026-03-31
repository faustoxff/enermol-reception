const pad = (value) => String(value).padStart(2, "0");

export const generarNumeroFormulario = (date = new Date()) => {
  const dia = pad(date.getDate());
  const mes = pad(date.getMonth() + 1);
  const anio = date.getFullYear();
  const horas = pad(date.getHours());
  const minutos = pad(date.getMinutes());
  const segundos = pad(date.getSeconds());

  return `${dia}${mes}${anio}${horas}${minutos}${segundos}`;
};

export const generarTextoDiagnostico = (costo = "") =>
  `Si la reparación no está cubierta por la garantía de fábrica (por mal uso o vencimiento), el servicio de diagnóstico tendrá un costo de ${costo || "[X pesos]"}, que deberá abonarse para poder retirar la máquina. En caso de que el cliente acepte la reparación, el costo de los repuestos utilizados se cobrará por separado y como un gasto adicional.`;

export const crearFormularioRecepcionInicial = (overrides = {}) => ({
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
  ...overrides,
});

export const mapRecepcionToFormData = (recepcion) =>
  crearFormularioRecepcionInicial({
    numeroFormulario: recepcion.numero_formulario ?? "",
    fechaIngreso: recepcion.fecha_ingreso ?? "",
    cliente: recepcion.cliente ?? "",
    direccion: recepcion.direccion ?? "",
    cuit: recepcion.cuit ?? "",
    telefono: recepcion.telefono ?? "",
    email: recepcion.email ?? "",
    adjuntaFactura: recepcion.adjunta_factura ?? false,
    fechaFactura: recepcion.fecha_factura ?? "",
    numeroFactura: recepcion.numero_factura ?? "",
    garantia: recepcion.garantia ?? "NO",
    periodoGarantia: recepcion.periodo_garantia ?? "NO",
    costoDiagnostico: recepcion.diagnostico_costo ?? "",
    observaciones: recepcion.observaciones ?? "",
    segmento: recepcion.segmento ?? "",
    equipo: recepcion.equipo ?? "",
    accesorios: recepcion.accesorios ?? "",
    fallaDenunciada: recepcion.falla_denunciada ?? "",
    estadoGeneral: recepcion.estado_general ?? "",
  });

export const mapFormDataToRecepcionPayload = (formData) => ({
  numero_formulario: formData.numeroFormulario || generarNumeroFormulario(),
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
});
