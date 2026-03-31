## Variables necesarias

Configura estos secretos antes de desplegar la funcion:

- `RESEND_API_KEY`: API key de Resend.
- `SENDER_EMAIL`: remitente verificado en Resend. Ejemplo: `Enermol <notificaciones@tu-dominio.com>`.

La funcion tambien usa las variables del proyecto de Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Despliegue

```bash
supabase functions deploy send-recepcion-email
```

## Invocacion

La app la invoca enviando este body:

```json
{
  "recepcionId": 1,
  "destinatario": "cliente@correo.com"
}
```
