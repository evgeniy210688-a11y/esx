import { createClient } from '@supabase/supabase-js';
import type { ServiceListing } from '@/lib/service-directory';

// Published directory data never depends on the visitor's login or token refresh.
export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const signal = AbortSignal.timeout(20000);
  try {
    const cursor = new URL(request.url).searchParams.get('after');
    if (cursor && !/^[0-9a-f-]{36}$/i.test(cursor)) return Response.json({error: 'Invalid cursor'}, {status:400});
    let query = supabase.from('esx_service_listings')
      .select('categories,listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,email,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages')
      .eq('status', 'published').order('id').limit(25);
    if (cursor) query = query.gt('id', cursor);
    const {data: rows, error} = await query.abortSignal(signal).returns<ServiceListing[]>();
    if (error || !rows) throw error ?? new Error('No listings returned');
    return Response.json(rows, { headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=60',
    } });
  } catch {
    return Response.json({ error: 'Directory temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
