import { createHash } from 'node:crypto';

export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; until: number }>();
const reply = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply('forbidden', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return reply('invalid_request', 415);
  const reader = request.body?.getReader();
  if (!reader) return reply('invalid_request', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  let input;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return reply('too_large', 413); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return reply('invalid_request', 400); }
  if (!input || typeof input !== 'object') return reply('invalid_request', 400);
  const { name, email, message, requestId } = input;
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || /[\r\n]/.test(name) ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) ||
      typeof message !== 'string' || !message.trim() || message.length > 5000 ||
      typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId)) return reply('invalid_request', 400);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return reply('not_configured', 503);

  // Best-effort per-instance throttling. Use hosting firewall rules for a global limit.
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const bucket = attempts.get(ip) || { count: 0, until: now + 60000 };
  if (bucket.count >= 3 || (!attempts.has(ip) && attempts.size >= 10000)) return reply('rate_limited', 429);
  bucket.count++;
  attempts.set(ip, bucket);
  const text = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`;
  // Reusing a retry ID with the same content cannot create a second email.
  const key = createHash('sha256').update(`${requestId}\n${text}`).digest('hex');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${key}` },
      body: JSON.stringify({ from, to: ['88esx88@gmail.com'], reply_to: email.trim(), subject: `ESX — ${name.trim()}`, text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return reply('send_failed', 502);
    const result = await response.json();
    if (typeof result.id !== 'string' || !result.id) return reply('send_failed', 502);
    return Response.json({ ok: true });
  } catch { return reply('send_failed', 502); }
}
