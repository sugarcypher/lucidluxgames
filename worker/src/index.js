// Lucid Lux shop worker.
//   GET  /pubkey            → { pub }            raw Ed25519 public key, base64url
//   GET  /unlock?session=cs_… → { token } | { error }   verifies the Stripe Checkout Session, mints a signed key
//   POST /age { age }       → { ok }             counts a bracket: u13 | 13-17 | 18+   (no identity, no cookies, no IP kept)
//   GET  /age?key=ADMIN_KEY → { u13, "13-17", "18+" }
// A key is  base64url(payload) "." base64url(signature)  with payload {"k":"lucidlux","v":1,"iat":<unix s>,"ref":<8 hex of the session id hash>}.
// The game verifies the signature client-side with /pubkey, so a key cannot be forged; it can be shared, which is the intended "every device" behaviour.
const ORIGIN = 'https://lucidlux.fyi';
const AGES = ['u13', '13-17', '18+'];
const b64u = {
  enc: b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': ORIGIN, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'cache-control': 'no-store' } });

async function privateKey(env) { return crypto.subtle.importKey('pkcs8', b64u.dec(env.SIGN_KEY), { name: 'Ed25519' }, true, ['sign']); }
async function publicRaw(env) { const pk = await privateKey(env); const jwk = await crypto.subtle.exportKey('jwk', pk); return jwk.x; }   // jwk.x is the raw public key, already base64url

async function mint(env, sessionId) {
  const h = b64u.enc(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sessionId))).slice(0, 8);
  const payload = b64u.enc(new TextEncoder().encode(JSON.stringify({ k: 'lucidlux', v: 1, iat: Math.floor(Date.now() / 1000), ref: h })));
  const sig = await crypto.subtle.sign({ name: 'Ed25519' }, await privateKey(env), new TextEncoder().encode(payload));
  return payload + '.' + b64u.enc(sig);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return json({}, 204);
    if (url.pathname === '/pubkey') return json({ pub: await publicRaw(env) });

    if (url.pathname === '/unlock') {
      const id = url.searchParams.get('session') || '';
      if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return json({ error: 'bad session id' }, 400);
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, { headers: { authorization: 'Bearer ' + env.STRIPE_KEY } });
      if (!r.ok) return json({ error: 'session not found' }, 404);
      const s = await r.json();
      const paid = s.status === 'complete' && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required');
      if (!paid) return json({ error: 'not paid' }, 402);
      return json({ token: await mint(env, id) });
    }

    if (url.pathname === '/age' && req.method === 'POST') {
      let age = null; try { age = (await req.json()).age; } catch (_) {}
      if (!AGES.includes(age)) return json({ error: 'bad bracket' }, 400);
      const n = parseInt((await env.AGES.get(age)) || '0', 10) + 1;   // approximate under concurrency; a count, not a ledger
      await env.AGES.put(age, String(n));
      return json({ ok: true });
    }
    if (url.pathname === '/age' && req.method === 'GET') {
      if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'no' }, 403);
      const out = {}; for (const a of AGES) out[a] = parseInt((await env.AGES.get(a)) || '0', 10);
      return json(out);
    }
    return json({ error: 'not found' }, 404);
  },
};
