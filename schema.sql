-- Optional: the app also creates this automatically on first request.
CREATE TABLE IF NOT EXISTS pastes (
  id         TEXT PRIMARY KEY,
  content    TEXT NOT NULL,
  created_at BIGINT NOT NULL,          -- epoch ms
  expires_at BIGINT,                   -- epoch ms, NULL = never
  max_views  INTEGER,                  -- NULL = unlimited
  view_count INTEGER NOT NULL DEFAULT 0
);
