import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { consumeView, nowMs } from '@/lib/pastes';

export const dynamic = 'force-dynamic';

export default async function PastePage({ params }) {
  const h = headers();
  const paste = await consumeView(params.id, nowMs((name) => h.get(name)));
  if (!paste) notFound();

  return (
    <article className="card">
      <div className="meta">
        <span>{paste.remaining_views === null ? 'Unlimited views' : `${paste.remaining_views} view(s) remaining`}</span>
        <span>{paste.expires_at ? `Expires ${paste.expires_at}` : 'Never expires'}</span>
      </div>
      {/* React escapes text, so content can never execute as HTML/script */}
      <pre>{paste.content}</pre>
    </article>
  );
}
