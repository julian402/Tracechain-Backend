/**
 * Plantillas HTML para los correos de TraceChain.
 * Se mantienen simples (inline styles) para máxima compatibilidad con clientes.
 */

const baseLayout = (title, body) => `
  <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:20px;font-weight:700;color:#16a34a">TraceChain</span>
    </div>
    <h2 style="font-size:18px;margin:0 0 16px">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
    <p style="font-size:12px;color:#9ca3af">Este es un mensaje automático de TraceChain. Si no esperabas este correo, ignóralo.</p>
  </div>
`

export const otpCodeEmail = ({ name, code }) =>
  baseLayout(
    'Tu código de acceso',
    `
      <p>Hola ${name || ''},</p>
      <p>Usa el siguiente código para completar tu inicio de sesión. Vence en 10 minutos:</p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;background:#f0fdf4;color:#166534;padding:12px 24px;border-radius:8px">${code}</span>
      </div>
      <p style="font-size:13px;color:#6b7280">Si no intentaste iniciar sesión, te recomendamos cambiar tu contraseña.</p>
    `
  )

const findingsTable = (findings = []) => {
  if (!findings.length) return ''
  const rows = findings
    .map(
      (f) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${f.type}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${f.priority}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${f.description}</td>
        </tr>`
    )
    .join('')
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #d1d5db;font-size:12px;color:#6b7280">Tipo</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #d1d5db;font-size:12px;color:#6b7280">Prioridad</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #d1d5db;font-size:12px;color:#6b7280">Descripción</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

export const inspectionAssignedEmail = ({ responsibleName, visit, appUrl }) => {
  const detailUrl = appUrl ? `${appUrl}/inspections/${visit.id}` : null
  const visitDate = visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('es-CO') : '—'
  return baseLayout(
    'Te asignaron como responsable de una inspección',
    `
      <p>Hola ${responsibleName || ''},</p>
      <p>Se te asignó como responsable de la siguiente ${String(visit.visitType || 'visita').toLowerCase()}:</p>
      <ul style="font-size:14px;line-height:1.7;padding-left:18px">
        <li><strong>Tipo:</strong> ${visit.visitType}</li>
        <li><strong>Entidad auditora:</strong> ${visit.auditorEntity}</li>
        <li><strong>Auditor:</strong> ${visit.auditorName}</li>
        <li><strong>Fecha:</strong> ${visitDate}</li>
        ${visit.lot ? `<li><strong>Lote:</strong> ${visit.lot.code} — ${visit.lot.name}</li>` : ''}
        ${visit.correctiveActions ? `<li><strong>Acciones correctivas:</strong> ${visit.correctiveActions}</li>` : ''}
      </ul>
      ${findingsTable(visit.findings)}
      ${
        detailUrl
          ? `<div style="text-align:center;margin:24px 0">
               <a href="${detailUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">Ver detalle</a>
             </div>`
          : ''
      }
      <p style="font-size:13px;color:#6b7280">Por favor revisa los hallazgos y actualiza el estado de seguimiento.</p>
    `
  )
}
