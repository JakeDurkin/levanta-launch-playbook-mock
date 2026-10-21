// Password-only gate (Vercel Routing Middleware, Edge runtime, no framework).
export const config = { matcher: '/:path*' };

const COOKIE = 'lp_auth';
const MAX_AGE = 60 * 60 * 24 * 30;

function safeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

async function token(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + ':levanta-playbook'));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

function page(error) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Launch Playbook · Levanta</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:#FFFCF4;color:#0D1901;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px}
.card{width:100%;max-width:400px;background:#fff;border:1px solid rgba(13,25,1,.1);border-radius:16px;padding:40px 32px;box-shadow:0 8px 30px rgba(13,25,1,.06)}
.brand{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin:0 0 12px}
h1{font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:34px;line-height:1.1;margin:0 0 8px}
h1 em{color:#E48C34;font-style:italic}
p{margin:0 0 24px;font-size:15px;opacity:.75}
label{display:block;font-size:13px;font-weight:500;margin-bottom:6px}
input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid rgba(13,25,1,.25);border-radius:10px;background:#FFFCF4;color:#0D1901}
input:focus{outline:2px solid #E48C34;outline-offset:1px;border-color:#E48C34}
button{margin-top:16px;width:100%;font:inherit;font-weight:600;font-size:15px;padding:13px;border:0;border-radius:10px;background:#E48C34;color:#0D1901;cursor:pointer}
button:hover{filter:brightness(.96)}
.err{margin:10px 0 0;font-size:13px;color:#C0392B;opacity:1}
</style></head><body><main class="card">
<div class="brand">Levanta</div>
<h1>Launch <em>Playbook</em></h1>
<p>Enter the password to view this review mockup.</p>
<form method="POST" action="/__login">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
${error ? '<p class="err" role="alert">Incorrect password</p>' : ''}
<button type="submit">View playbook</button>
</form></main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export default async function middleware(request) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return page(false); // fail closed

  const url = new URL(request.url);
  if (url.pathname === '/__login' && request.method === 'POST') {
    let pw = '';
    try {
      const form = await request.formData();
      pw = String(form.get('password') || '');
    } catch {}
    if (!safeEqual(pw, expected)) return page(true);
    const t = await token(expected);
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/',
        'Set-Cookie': `${COOKIE}=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const c = getCookie(request, COOKIE);
  if (c && safeEqual(c, await token(expected))) return; // pass through to static files
  return page(false);
}
