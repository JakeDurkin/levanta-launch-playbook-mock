// Shared-password gate (Vercel Routing Middleware, Edge runtime).
export const config = { matcher: '/:path*' };

function safeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Levanta Playbook", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return unauthorized(); // fail closed

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (!encoded || scheme.toLowerCase() !== 'basic') return unauthorized();

  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }
  const idx = decoded.indexOf(':');
  const password = idx >= 0 ? decoded.slice(idx + 1) : '';
  if (!safeEqual(password, expected)) return unauthorized();
  // Returning nothing lets the request continue to the static files.
}
