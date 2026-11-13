'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLink('');
    setCopied(false);
    const payload = { content };
    if (ttl.trim()) payload.ttl_seconds = Number(ttl);
    if (maxViews.trim()) payload.max_views = Number(maxViews);

    setBusy(true);
    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setLink(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {}
  }

  return (
    <form onSubmit={submit} className="card">
      <label htmlFor="content">Your text</label>
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste something here…"
        rows={12}
        required
      />
      <div className="row">
        <div>
          <label htmlFor="ttl">Expire after (seconds)</label>
          <input id="ttl" type="number" min="1" step="1" value={ttl}
                 onChange={(e) => setTtl(e.target.value)} placeholder="Never" />
        </div>
        <div>
          <label htmlFor="mv">Max views</label>
          <input id="mv" type="number" min="1" step="1" value={maxViews}
                 onChange={(e) => setMaxViews(e.target.value)} placeholder="Unlimited" />
        </div>
      </div>
      <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create paste'}</button>

      {error && <p className="error" role="alert">{error}</p>}
      {link && (
        <div className="result">
          <span>Shareable link</span>
          <a href={link}>{link}</a>
          <button type="button" className="secondary" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      )}
    </form>
  );
}
