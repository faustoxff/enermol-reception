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
