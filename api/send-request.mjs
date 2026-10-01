const destinationEmail = 'viscardigennaro2001@gmail.com';

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function cleanValue(value) {
  if (Array.isArray(value)) return value.map(cleanValue).join(', ');
  if (value == null) return '';
  return String(value).trim().slice(0, 5000);
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ success: false, message: 'Metodo non consentito.' }, 405);
    const expectedOrigin = new URL(request.url).origin;
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin && requestOrigin !== expectedOrigin) return json({ success: false, message: 'Origine non consentita.' }, 403);
    if (!process.env.RESEND_API_KEY) return json({ success: false, message: 'Servizio email non configurato.' }, 503);

    try {
      const rawPayload = await readPayload(request);
      if (cleanValue(rawPayload._honey)) return json({ success: true });
      const entries = Object.entries(rawPayload)
        .filter(([key]) => !key.startsWith('_'))
        .slice(0, 40)
        .map(([key, value]) => [cleanValue(key).slice(0, 120), cleanValue(value)]);
      const values = Object.fromEntries(entries);
      if (!values.nome || (!values.telefono && !values.email)) return json({ success: false, message: 'Nome e almeno un recapito sono obbligatori.' }, 400);

      const subject = cleanValue(rawPayload._subject || 'Nuova richiesta dal sito').replace(/[\r\n]+/g, ' ').slice(0, 180);
      const rows = entries.map(([key, value]) => `<tr><th style="padding:10px 12px;border:1px solid #d8dde4;text-align:left;background:#f3f5f7">${escapeHtml(key)}</th><td style="padding:10px 12px;border:1px solid #d8dde4;white-space:pre-wrap">${escapeHtml(value || 'Non indicato')}</td></tr>`).join('');
      const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || '') ? values.email : '';
      const emailRequest = {
        from: process.env.RESEND_FROM_EMAIL || 'Viscardi Assicurazioni <onboarding@resend.dev>',
        to: [destinationEmail],
        subject,
        html: `<div style="font-family:Arial,sans-serif;color:#07111f"><h1 style="font-size:24px">${escapeHtml(subject)}</h1><p>Nuova richiesta ricevuta dal sito Viscardi Assicurazioni.</p><table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table></div>`
      };
      if (emailAddress) emailRequest.reply_to = emailAddress;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `viscardi-${crypto.randomUUID()}` },
        body: JSON.stringify(emailRequest)
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Resend error', response.status, responseData);
        return json({ success: false, message: 'Il servizio email non ha accettato la richiesta.' }, 502);
      }
      return json({ success: true, id: responseData.id || null });
    } catch (error) {
      console.error('Email function error', error);
      return json({ success: false, message: 'Errore temporaneo durante l’invio.' }, 500);
    }
  }
};
