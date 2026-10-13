// Prints an Ed25519 keypair for the shop worker. Run once:  node keygen.mjs
// SIGN_KEY goes in with `npx wrangler secret put SIGN_KEY`; the public key is served by the worker itself at /pubkey.
import { generateKeyPairSync } from 'node:crypto';
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const b64u = b => Buffer.from(b).toString('base64url');
const pkcs8 = privateKey.export({ type: 'pkcs8', format: 'der' });
const spki = publicKey.export({ type: 'spki', format: 'der' });
console.log('SIGN_KEY (private, pkcs8, base64url):\n' + b64u(pkcs8));
console.log('\npublic (raw 32 bytes, base64url; the worker derives this itself, shown for reference):\n' + b64u(spki.subarray(spki.length - 32)));
