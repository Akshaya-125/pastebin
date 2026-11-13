import { NextResponse } from 'next/server';
import { createPaste, nowMs, validate } from '@/lib/pastes';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    const now = nowMs((h) => req.headers.get(h));
    const { id } = await createPaste(body, now);
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const origin = host ? `${proto}://${host}` : new URL(req.url).origin;
    return NextResponse.json({ id, url: `${origin}/p/${id}` }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
