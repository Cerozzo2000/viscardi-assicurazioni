const destinationEmail = 'viscardigennaro2001@gmail.com';
const maxAttachmentBytes = 3 * 1024 * 1024;
const maxAttachmentCount = 3;

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

function isUploadedFile(value) {
  return value && typeof value === 'object' && typeof value.arrayBuffer === 'function' && typeof value.name === 'string';
}

async function readRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return { rawPayload: await request.json(), files: [] };
  const formData = await request.formData();
  const rawPayload = {};
  const files = [];
  for (const [key, value] of formData.entries()) {
    if (isUploadedFile(value)) {
      if (value.size) files.push(value);
    } else rawPayload[key] = value;
  }
  return { rawPayload, files };
}

function detectedMime(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  return '';
}

function safeFilename(name, mime, index) {
  const extensions = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png' };
  const cleaned = String(name || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 100);
  const withoutExtension = cleaned.replace(/\.(pdf|jpe?g|png)$/i, '') || `allegato-${index + 1}`;
  return withoutExtension + extensions[mime];
}

async function prepareAttachments(files) {
  if (files.length > maxAttachmentCount) throw new Error('TOO_MANY_FILES');
  const totalBytes = files.reduce((total, file) => total + Number(file.size || 0), 0);
  if (totalBytes > maxAttachmentBytes) throw new Error('FILES_TOO_LARGE');
  const attachments = [];
  for (let index = 0; index < files.length; index += 1) {
    const buffer = Buffer.from(await files[index].arrayBuffer());
    const mime = detectedMime(buffer);
    if (!mime) throw new Error('INVALID_FILE_TYPE');
    attachments.push({ filename: safeFilename(files[index].name, mime, index), content: buffer.toString('base64'), content_type: mime });
  }
  return attachments;
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ success: false, message: 'Metodo non consentito.' }, 405);
    const expectedOrigin = new URL(request.url).origin;
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin && requestOrigin !== expectedOrigin) return json({ success: false, message: 'Origine non consentita.' }, 403);
    if (!process.env.RESEND_API_KEY) return json({ success: false, message: 'Servizio email non configurato.' }, 503);

    try {
      const { rawPayload, files } = await readRequest(request);
      if (cleanValue(rawPayload._honey)) return json({ success: true });
      if (cleanValue(rawPayload._attachment_required) === 'true' && !files.length) return json({ success: false, message: 'La carta di circolazione è obbligatoria.' }, 400);
      const attachments = await prepareAttachments(files);
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
        html: `<div style="font-family:Arial,sans-serif;color:#07111f"><h1 style="font-size:24px">${escapeHtml(subject)}</h1><p>Nuova richiesta ricevuta dal sito Viscardi Assicurazioni.</p>${attachments.length ? `<p><strong>Allegati ricevuti:</strong> ${attachments.length}</p>` : ''}<table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table></div>`
      };
      if (emailAddress) emailRequest.reply_to = emailAddress;
      if (attachments.length) emailRequest.attachments = attachments;

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
      if (error.message === 'TOO_MANY_FILES') return json({ success: false, message: 'Puoi allegare al massimo 3 file.' }, 400);
      if (error.message === 'FILES_TOO_LARGE') return json({ success: false, message: 'Gli allegati possono pesare al massimo 3 MB complessivi.' }, 400);
      if (error.message === 'INVALID_FILE_TYPE') return json({ success: false, message: 'Sono ammessi soltanto file PDF, JPG e PNG validi.' }, 400);
      return json({ success: false, message: 'Errore temporaneo durante l’invio.' }, 500);
    }
  }
};
