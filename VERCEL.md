# Deploy to Vercel

## 1. Import project

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New** → **Project** → Import `zeriouslyzen/-intelHQ` (or your fork).
3. **Root Directory**: set to **`web`** (click Edit, enter `web`). All build and run commands will use the Next.js app inside `web/`.

## 2. Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | **Yes** | Postgres connection string. Use [Supabase](https://supabase.com) (or any Postgres): from Supabase **Project Settings → Database** copy the **Connection string (URI)** and replace `[YOUR-PASSWORD]` with your database password. Example: `postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres` |
| `VESSEL_API_URL` | No | Optional; full URL to an OGC/vessel API for live cargo positions on the map. |

Set `DATABASE_URL` in Vercel **Settings → Environment Variables** so notes and feed config persist.

## 3. Deploy

Click **Deploy**. Vercel will:

- Install dependencies (`npm install`), which runs `prisma generate` (postinstall).
- Build with `next build` (or use the `buildCommand` in `web/vercel.json`).
- Serve the app with the Next.js runtime.

## 4. Run migrations (once)

After setting `DATABASE_URL` (Supabase or other Postgres), apply the schema once:

```bash
cd web
npx prisma migrate deploy
```

Use the same `DATABASE_URL` in `.env` locally so the command runs against your Supabase DB. After that, the app and Vercel will use the same database.

## Monorepo note

The repo root contains docs and the app in **`web/`**. Always set **Root Directory** to **`web`** in the Vercel project so the correct `package.json` and `next.config.ts` are used.
