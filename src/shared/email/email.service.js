import nodemailer from 'nodemailer'

/**
 * Servicio de correo basado en Gmail SMTP (Nodemailer).
 *
 * A diferencia de Resend en su plan gratis (que solo permite enviar a tu propio
 * correo mientras no verifiques un dominio), Gmail SMTP entrega a CUALQUIER
 * destinatario real sin costo. Requiere una "contraseña de aplicación" de Google
 * (no la contraseña normal de la cuenta), generada en
 * https://myaccount.google.com/apppasswords con la verificación en 2 pasos activa.
 *
 * Si no hay credenciales configuradas (entorno de desarrollo), hace fallback a
 * `console.log` para no romper los flujos de login/notificación.
 */
const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD
const from = process.env.MAIL_FROM || (user ? `TraceChain <${user}>` : 'TraceChain')

const transporter = user && pass
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  : null

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log('[email:dev] (sin GMAIL_USER/GMAIL_APP_PASSWORD) correo simulado →', { to, subject })
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    return { simulated: true }
  }

  const info = await transporter.sendMail({ from, to, subject, html })
  return info
}
