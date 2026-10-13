# Lucid Lux shop worker

Mints the game key after a paid Stripe checkout and counts age brackets. No accounts, no email, no database of people: the key is a signed token the player keeps.

## One-time setup (your hands; nothing here needs Claude)

1. **Keys.** `node keygen.mjs` → copy the SIGN_KEY line.
2. **Stripe.** Dashboard → Developers → API keys → *Create restricted key*: name `lucidlux-shop`, permission **Checkout Sessions: Read** only. Copy it.
3. **Stripe Payment Link.** Products → add product "Lucid Lux key" → price: *Customers choose what to pay*, minimum 3.00 USD, suggested 5.00 → Create payment link. In the link's settings → *After payment* → redirect to `https://lucidlux.fyi/resonant/?cs={CHECKOUT_SESSION_ID}`. Enable *Allow promotion codes*. Copy the link URL.
4. **Free play for you and reviewers.** Products → Coupons → new coupon 100% off, duration *forever* → add a promotion code (for example FOUNDER, usage limit of your choice). Entering it at checkout completes a $0 session, which the worker accepts (`payment_status = no_payment_required`), so it mints a real key.
5. **Stablecoin.** Settings → Payment methods → request **Stablecoins and Crypto** (USDC; US except New York; 1.5% fee; settles in USD). Once approved it appears in the same Payment Link automatically.
6. **Deploy.** In this folder:
   ```
   npx wrangler login
   npx wrangler kv namespace create AGES        # paste the id into wrangler.toml
   npx wrangler secret put SIGN_KEY
   npx wrangler secret put STRIPE_KEY
   npx wrangler secret put ADMIN_KEY            # any long random string
   npx wrangler deploy                          # prints https://lucidlux-shop.<account>.workers.dev
   ```
7. **Turn the gate on.** In `resonant/index.html` set `SHOP.pay` to the Payment Link URL and `SHOP.api` to the worker URL (no trailing slash). Until both are set the gate is off and every round is free.

## Reading the age counts
`https://lucidlux-shop.<account>.workers.dev/age?key=<ADMIN_KEY>` → `{"u13":n,"13-17":n,"18+":n}`

## What the gate is and is not
The game checks the key's signature in the browser. A forged key fails. Someone who edits the page's JavaScript in their own browser can skip the check; that is true of every client-side gate and is the accepted cost of a site with no server. The gate is also off on any host other than lucidlux.fyi, so a local copy plays free.
