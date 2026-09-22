import QRCode from "qrcode";
import { getPool } from "./_db.js";
import { requireAuth } from "./_auth.js";

const URL_INFO_ENERMOL = "https://enermol.com.ar/";

const CAMPOS = [
  ["Número de formulario", "numero_formulario"],
  ["Fecha de ingreso", "fecha_ingreso"],
  ["Cliente", "cliente"],
  ["Dirección", "direccion"],
  ["CUIT / DNI", "cuit"],
  ["Teléfono", "telefono"],
  ["Email", "email"],
  ["Número de factura", "numero_factura"],
  ["En garantía", "garantia"],
  ["Segmento", "segmento"],
  ["Equipo", "equipo"],
  ["Modelo / Código de equipo", "modelo_codigo"],
  ["N° de serie", "numero_serie"],
  ["Accesorios", "accesorios"],
  ["Falla denunciada", "falla_denunciada"],
  ["Estado general", "estado_general"],
  ["Observaciones", "observaciones"],
];

const PUNTOS_PROTOCOLO = [
  "Procedimiento de Ingreso y Diagnóstico",
  "Costo del Diagnóstico",
  "Qué cubre",
  "Política de No Reembolso",
  "Pedido de Repuestos",
  "Políticas de Retiro y Abandono",
];

const formatearFecha = (valor) => {
  if (!valor) {
    return "-";
  }
  return new Date(valor).toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const construirHtml = async (recepcion) => {
  const filas = CAMPOS.map(([etiqueta, clave]) => {
    let valor = recepcion[clave];
    if (clave.includes("fecha")) {
      valor = formatearFecha(valor);
    }
    return `<tr><td style="padding:6px 10px;color:#6b7280;font-size:13px;">${etiqueta}</td><td style="padding:6px 10px;font-weight:600;">${valor || "-"}</td></tr>`;
  }).join("");

  const qrDataUrl = await QRCode.toDataURL(URL_INFO_ENERMOL, {
    width: 120,
    margin: 1,
  });

  const puntosProtocolo = PUNTOS_PROTOCOLO.map(
    (punto) => `<li style="font-size:11px;color:#6b7280;line-height:1.5;">${punto}</li>`,
  ).join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
      <table style="width:100%;margin-bottom:10px;">
        <tr>
          <td>
            <p style="color:#d7262e;font-weight:800;letter-spacing:1px;margin:0 0 4px 0;">ENERMOL</p>
            <h2 style="margin:0;">Recepción de equipo #${recepcion.numero_formulario ?? "-"}</h2>
          </td>
          <td style="width:220px;padding:10px 14px;background:#fafafa;border:1px solid #e3e6ea;border-radius:12px;vertical-align:top;">
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:800;">🛠️ Protocolo de Servicio Técnico - Enermol®</p>
            <ul style="margin:0;padding-left:16px;">${puntosProtocolo}</ul>
          </td>
          <td style="text-align:center;width:120px;">
            <img src="${qrDataUrl}" width="90" height="90" alt="Más información de ENERMOL" />
            <div style="font-size:10px;color:#6b7280;">Más info de ENERMOL</div>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;">${filas}</table>
    </div>
  `;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Método no permitido" });
    return;
  }

  const usuario = await requireAuth(req, res);
  if (!usuario) {
    return;
  }

  const { recepcionId, destinatario } = req.body ?? {};
  const id = Number(recepcionId);

  if (!Number.isInteger(id) || !destinatario) {
    res.status(400).json({ message: "Faltan datos (recepcionId, destinatario)" });
    return;
  }

  const pool = getPool();
  const { rows } = await pool.query("select * from recepciones where id = $1", [id]);
  const recepcion = rows[0];

  if (!recepcion) {
    res.status(404).json({ message: "Recepción no encontrada" });
    return;
  }

  const respuestaResend = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ENERMOL <onboarding@resend.dev>",
      to: [destinatario],
      subject: `Recepción de equipo #${recepcion.numero_formulario ?? id}`,
      html: await construirHtml(recepcion),
    }),
  });

  if (!respuestaResend.ok) {
    const detalle = await respuestaResend.text();
    res.status(502).json({ message: `No se pudo enviar el mail: ${detalle}` });
    return;
  }

  res.status(200).json({ enviado: true });
}
