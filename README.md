# Pastebin Lite

A small Pastebin-style app: create a text paste, get a shareable link, view it at that link.
Pastes can optionally expire by time (TTL) and/or by number of views.

**Stack:** Next.js 14 (App Router, JavaScript) + Postgres (Neon) via `pg`. Deploys to Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local     # set DATABASE_URL to your Neon/Postgres URL
npm run dev                    # http://localhost:3000
```
The `pastes` table is created automatically on first request (see also `schema.sql`).

## Deploy (Vercel + Neon)
1. Create a free Postgres DB at https://neon.tech and copy the connection string.
2. Push this folder to a GitHub repo and import it on https://vercel.com.
3. Add env var `DATABASE_URL` (and `TEST_MODE=1` if the evaluator needs deterministic time).
4. Deploy. Open `/api/healthz` — it should return `{"ok":true}`.

## API
| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | `200 {"ok":true}` if the DB is reachable |
| POST | `/api/pastes` | Body `{content, ttl_seconds?, max_views?}` → `201 {id, url}`; `400` on invalid input |
| GET | `/api/pastes/:id` | `200 {content, remaining_views, expires_at}`; `404` if missing/expired/exhausted |
| GET | `/p/:id` | HTML page showing the paste (404 page if unavailable) |

`remaining_views` and `expires_at` are `null` when unlimited / never expiring.

## Design decisions (interview notes)
- **Atomic view counting:** one `UPDATE ... WHERE (not expired) AND (view_count < max_views) RETURNING ...`
  both checks and increments. Concurrent requests can't push a paste past `max_views`, and there's no
  read-then-write race.
- **Every successful fetch (API or HTML page) consumes one view.** Once views hit the limit, or the TTL passes,
  the same query matches no rows → 404. Expired/missing/exhausted all look identical to the client.
- **Serverless-safe DB:** pooled `pg` connection stored on `globalThis` to be reused across invocations;
  schema is created lazily with `CREATE TABLE IF NOT EXISTS`.
- **Time as epoch ms (BIGINT)** passed in from the app, which makes expiry deterministic. With `TEST_MODE=1`,
  the `x-test-now-ms` header overrides "now" so expiry can be tested without sleeping.
- **XSS-safe rendering:** paste content is rendered as React text inside `<pre>`, so it is always escaped.
- **IDs:** 6 random bytes, base64url (8 chars) via `crypto.randomBytes` — unguessable enough for share links.
- **Validation:** `content` must be a non-empty string; `ttl_seconds` / `max_views` must be integers ≥ 1 if provided.
- **No caching:** routes are `force-dynamic` and API responses send `no-store`, since every view mutates state.

## Possible improvements
Rate limiting, max content size, background cleanup of expired rows, delete endpoint, syntax highlighting.
