# Tressé Hair — Handover

Production stack for the client project.

## Links
- **GitHub:** https://github.com/tejumakanju/Tress-Hair
- **Supabase project ref:** `funcdwtsvkbnojqtiefg`
- **Supabase dashboard:** https://supabase.com/dashboard/project/funcdwtsvkbnojqtiefg
- **Netlify:** connect this GitHub repo (see below)

## Local development
```bash
cd web   # if cloning a monorepo; this repo root already is the Next app
npm install
cp .env.example .env.local
# fill keys (never commit .env.local)
npm run dev
```

## Required environment variables

Set these in **Netlify → Site configuration → Environment variables** (and locally in `.env.local`):

| Variable | Where to get it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Secret** — server only |
| `FLW_SECRET_KEY` | Flutterwave dashboard | Test or live secret |
| `FLW_PUBLIC_KEY` | Flutterwave dashboard | Test or live public |
| `FLW_SECRET_HASH` | Flutterwave → Webhooks | Optional |
| `NEXT_PUBLIC_SITE_URL` | Your live URL | e.g. `https://your-site.netlify.app` (no trailing slash) |

After the Netlify URL is known, set `NEXT_PUBLIC_SITE_URL` to that URL (or custom domain) and redeploy. Flutterwave redirect/callback depends on it.

## Connect Netlify to GitHub
1. Open https://app.netlify.com/start
2. **Import from Git** → GitHub → authorize if needed
3. Select **`tejumakanju/Tress-Hair`**
4. Build settings (should auto-detect Next.js):
   - **Build command:** `npm run build`
   - **Publish directory:** leave Netlify / Next default (do not set `out`)
   - **Node:** 20
5. Add the env vars above **before** the first production deploy (or redeploy after adding them)
6. Deploy

## Supabase
- Schema applied via SQL (`APPLY_FRESH.sql` / migrations `00001`–`00009`)
- GitHub integration is linked for future migration deploys
- Storage buckets + policies are included

## Flutterwave (go-live)
1. Switch from TEST to LIVE keys in Netlify env
2. Set webhook URL to `https://YOUR_DOMAIN/api/payments/flutterwave/webhook`
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain
4. Confirm redirect URL `…/checkout/callback` works end-to-end

## What is still mock / local
- Storefront catalog still uses in-repo mock product data in places; Supabase schema is ready to wire fully
- Orders can be stored client-side for demos; production should persist to Supabase `orders`
- Admin is a lightweight local UI — expand against Supabase staff roles when needed

## Git identity for this repo
Commits on this client repo should be authored as **tejumakanju** (project owner), not personal / other brand accounts.
