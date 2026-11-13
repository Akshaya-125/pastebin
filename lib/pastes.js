import crypto from 'crypto';
import { query } from './db';

/** Current time in ms. In TEST_MODE=1 the x-test-now-ms header overrides it. */
export function nowMs(getHeader) {
  if (process.env.TEST_MODE === '1') {
    const v = getHeader('x-test-now-ms');
    if (v && /^\d+$/.test(v)) return Number(v);
  }
  return Date.now();
}

export function newId() {
  return crypto.randomBytes(6).toString('base64url'); // 8 URL-safe chars
}

/** Returns an error string, or null if valid. */
export function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body must be a JSON object';
  const { content, ttl_seconds, max_views } = body;
  if (typeof content !== 'string' || content.trim().length === 0) {
    return 'content is required and must be a non-empty string';
  }
  if (ttl_seconds !== undefined && ttl_seconds !== null) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) return 'ttl_seconds must be an integer >= 1';
  }
  if (max_views !== undefined && max_views !== null) {
    if (!Number.isInteger(max_views) || max_views < 1) return 'max_views must be an integer >= 1';
  }
  return null;
}

export async function createPaste({ content, ttl_seconds, max_views }, now) {
  const id = newId();
  const expiresAt = ttl_seconds ? now + ttl_seconds * 1000 : null;
  await query(
    `INSERT INTO pastes (id, content, created_at, expires_at, max_views, view_count)
     VALUES ($1, $2, $3, $4, $5, 0)`,
    [id, content, now, expiresAt, max_views ?? null]
  );
  return { id, expiresAt };
}

/**
 * Atomically consume one view. A single UPDATE both checks availability
 * (not expired, views left) and increments the counter, so concurrent
 * requests can never exceed max_views.
 * Returns null if the paste is missing, expired, or out of views.
 */
export async function consumeView(id, now) {
  const { rows } = await query(
    `UPDATE pastes
        SET view_count = view_count + 1
      WHERE id = $1
        AND (expires_at IS NULL OR expires_at > $2)
        AND (max_views IS NULL OR view_count < max_views)
  RETURNING content, expires_at, max_views, view_count`,
    [id, now]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    content: r.content,
    remaining_views: r.max_views === null ? null : r.max_views - r.view_count,
    expires_at: r.expires_at === null ? null : new Date(Number(r.expires_at)).toISOString(),
  };
}
