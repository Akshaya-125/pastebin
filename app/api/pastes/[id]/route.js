import { NextResponse } from 'next/server';
import { consumeView, nowMs } from '@/lib/pastes';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const now = nowMs((h) => req.headers.get(h));
    const paste = await consumeView(params.id, now);
    if (!paste) {
      return NextResponse.json({ error: 'Paste not found or no longer available' }, { status: 404 });
    }
    return NextResponse.json(paste, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
