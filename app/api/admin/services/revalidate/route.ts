import { createClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';
import { serviceCacheTag } from '@/lib/service-live';

export async function POST(request: Request) {
  const reply = (status: number) => Response.json({ ok: status === 200 }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply(403);
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return reply(401);
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user || user.is_anonymous) return reply(401);
    const admin = await db.from('esx_service_admins').select('user_id').eq('user_id', user.id).maybeSingle();
    if (admin.error || !admin.data) return reply(403);
    revalidateTag(serviceCacheTag, { expire: 0 });
    return reply(200);
  } catch { return reply(503); }
}
