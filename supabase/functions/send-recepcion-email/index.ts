import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  return String(value);
};

const buildRecepcionHtml = (recepcion: Record<string, unknown>) => {
  const fields = [
    ["Numero de formulario", recepcion.numero_formulario],
    ["Fecha de ingreso", recepcion.fecha_ingreso],
    ["Cliente", recepcion.cliente],
    ["Direccion", recepcion.direccion],
    ["CUIT / DNI", recepcion.cuit],
    ["Telefono", recepcion.telefono],
    ["Email", recepcion.email],
    ["Adjunta factura", recepcion.adjunta_factura],
    ["Fecha de factura", recepcion.fecha_factura],
    ["Numero de factura", recepcion.numero_factura],
    ["Garantia", recepcion.garantia],
    ["Segmento", recepcion.segmento],
    ["Equipo", recepcion.equipo],
    ["Accesorios", recepcion.accesorios],
    ["Falla denunciada", recepcion.falla_denunciada],
    ["Estado general", recepcion.estado_general],
    ["Observaciones", recepcion.observaciones],
  ];

  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:700;width:220px;">
            ${label}
          </td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;">
            ${formatValue(value)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <h1 style="margin:0 0 8px 0;font-size:24px;">ENERMOL</h1>
      <p style="margin:0 0 24px 0;color:#6b7280;">Recepcion de equipo</p>
      <table style="border-collapse:collapse;width:100%;max-width:900px;">
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Metodo no permitido" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("SENDER_EMAIL");

    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: "Falta configurar SUPABASE_URL o SUPABASE_ANON_KEY" }, 500);
    }

    if (!resendApiKey || !senderEmail) {
      return json({ error: "Falta configurar RESEND_API_KEY o SENDER_EMAIL" }, 500);
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json({ error: "Falta el header Authorization" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { recepcionId, destinatario } = await req.json();

    if (!recepcionId || !destinatario) {
      return json({ error: "Faltan recepcionId o destinatario" }, 400);
    }

    const { data: recepcion, error } = await supabase
      .from("recepciones")
      .select("*")
      .eq("id", Number(recepcionId))
      .maybeSingle();

    if (error) {
      return json({ error: "No se pudo obtener la recepcion" }, 500);
    }

    if (!recepcion) {
      return json({ error: "La recepcion no existe" }, 404);
    }

    const html = buildRecepcionHtml(recepcion);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [destinatario],
        subject: `Recepcion ${formatValue(recepcion.numero_formulario)} - ENERMOL`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      return json({ error: `Resend rechazo el envio: ${resendError}` }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return json({ error: message }, 500);
  }
});
