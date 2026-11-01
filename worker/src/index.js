// Lucid Lux shop worker.
//   GET  /pubkey            → { pub }            raw Ed25519 public key, base64url
//   GET  /unlock?session=cs_… → { token } | { error }   verifies the Stripe Checkout Session, mints a signed key
//   POST /renew { token }    → { token } | { error }   re-checks the subscription behind a paid key, mints a fresh one
//   POST /age { age }       → { ok }             counts a bracket: u13 | 13-17 | 18+   (no identity, no cookies, no IP kept)
//   GET  /age?key=ADMIN_KEY → { u13, "13-17", "18+" }
//   GET  /mint?key=ADMIN_KEY → { token }          a free key to give away
// A key is  base64url(payload) "." base64url(signature).  v2 payload: {"k":"lucidlux","v":2,"iat":<unix s>,"exp":<unix s>,"s":<checkout session id>}
// for a subscription (exp = the paid-through date plus GRACE), or {"k":"lucidlux","v":2,"iat":…,"gift":1} with no exp for a free key.
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

const GRACE = 3 * 86400;   // a few days past the paid-through date, for card retries and offline play
const LIVE = ['active', 'trialing', 'past_due'];

async function sign(env, obj) {
  const payload = b64u.enc(new TextEncoder().encode(JSON.stringify(Object.assign({ k: 'lucidlux', v: 2, iat: Math.floor(Date.now() / 1000) }, obj))));
  const sig = await crypto.subtle.sign({ name: 'Ed25519' }, await privateKey(env), new TextEncoder().encode(payload));
  return payload + '.' + b64u.enc(sig);
}
async function readKey(env, tok) {   // → payload or null; checks our own signature
  try {
    const [p, sig] = String(tok).trim().split('.');
    const pk = await privateKey(env); const jwk = await crypto.subtle.exportKey('jwk', pk);
    const pub = await crypto.subtle.importKey('raw', b64u.dec(jwk.x), { name: 'Ed25519' }, true, ['verify']);
    if (!(await crypto.subtle.verify({ name: 'Ed25519' }, pub, b64u.dec(sig), new TextEncoder().encode(p)))) return null;
    const o = JSON.parse(new TextDecoder().decode(b64u.dec(p))); return o.k === 'lucidlux' ? o : null;
  } catch (_) { return null; }
}
const stripe = (env, path) => fetch('https://api.stripe.com/v1/' + path, { headers: { authorization: 'Bearer ' + env.STRIPE_KEY } });
// The paid-through date of the subscription behind a Checkout Session, or an error.
async function paidThrough(env, sessionId) {
  const r = await stripe(env, 'checkout/sessions/' + sessionId);
  if (!r.ok) return { error: 'session not found', status: 404 };
  const s = await r.json();
  const paid = s.status === 'complete' && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required');
  if (!paid) return { error: 'not paid', status: 402 };
  if (s.mode !== 'subscription' || !s.subscription) return { error: 'not a subscription', status: 402 };
  const q = await stripe(env, 'subscriptions/' + (typeof s.subscription === 'string' ? s.subscription : s.subscription.id));
  if (!q.ok) return { error: 'subscription unreadable', status: 502 };
  const sub = await q.json();
  if (!LIVE.includes(sub.status)) return { error: 'subscription ' + sub.status, status: 402 };
  // Newer API versions keep the period on the item; older ones on the subscription.
  const end = sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end);
  if (!end) return { error: 'no period end', status: 502 };
  return { end };
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: json({}).headers });   // a 204 may not carry a body
    if (url.pathname === '/pubkey') return json({ pub: await publicRaw(env) });

    if (url.pathname === '/unlock') {
      const id = url.searchParams.get('session') || '';
      if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return json({ error: 'bad session id' }, 400);
      const t = await paidThrough(env, id);
      if (t.error) return json({ error: t.error }, t.status);
      return json({ token: await sign(env, { exp: t.end + GRACE, s: id }) });
    }

    if (url.pathname === '/renew' && req.method === 'POST') {
      let tok = null; try { tok = (await req.json()).token; } catch (_) {}
      const o = await readKey(env, tok);
      if (!o) return json({ error: 'bad key' }, 400);
      if (!o.exp) return json({ token: tok });   // a gift key never needs renewing
      if (!o.s) return json({ error: 'no subscription on this key' }, 402);
      const t = await paidThrough(env, o.s);
      if (t.error) return json({ error: t.error }, t.status);
      return json({ token: await sign(env, { exp: t.end + GRACE, s: o.s }) });
    }

    // Free keys for the owner, reviewers and friends: GET /mint?key=ADMIN_KEY → { token }. Free keys never expire.
    if (url.pathname === '/mint' && req.method === 'GET') {
      if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'no' }, 403);
      return json({ token: await sign(env, { gift: 1 }) });
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
