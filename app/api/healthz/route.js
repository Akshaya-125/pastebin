   import { NextResponse } from 'next/server';
   import { ping } from '@/lib/db';

   export const dynamic = 'force-dynamic';

   export async function GET() {
     try {
       await ping();
       return NextResponse.json({ ok: true }, { status: 200 });
     } catch (e) {
       console.error('HEALTHZ ERROR:', e.message);
       return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
     }
   }