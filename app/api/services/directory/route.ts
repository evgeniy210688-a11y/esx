import { createClient } from '@supabase/supabase-js';
import type { ServiceListing } from '@/lib/service-directory';

// Published directory data never depends on the visitor's login or token refresh.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const signal = AbortSignal.timeout(20000);
  try {
    const rows: ServiceListing[] = [];
        // Fetch every page: Supabase's default row limit must not silently hide listings.
        for (let from = 0; ; from += 100) {
          let { data, error } = await supabase.from('esx_service_listings')
            .select('categories,listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,email,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages')
            .eq('status', 'published').order('id').range(from, from + 99).abortSignal(signal).returns<ServiceListing[]>();
          if (error?.code === '42703') {
            ({ data, error } = await supabase.from('esx_service_listings').select('listing_kind,id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,email,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages').eq('status', 'published').order('id').range(from, from + 99).abortSignal(signal).returns<ServiceListing[]>());
          }
          if (error?.code === '42703') {
            ({ data, error } = await supabase.from('esx_service_listings').select('id,name,represented_company,description,city,category,address,branches,phone,phones,photo,photos,business_hours,email,website,social_links,service_languages,has_manager,has_interpreter,interpreter_languages').eq('status', 'published').order('id').range(from, from + 99).abortSignal(signal).returns<ServiceListing[]>());
          }
          if (error || !data) throw error ?? new Error('No listings returned');
          rows.push(...(data as ServiceListing[]));
          if (data.length < 100) break;
        }

    rows.sort((a, b) => a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id));
    return Response.json(rows, { headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=60',
    } });
  } catch {
    return Response.json({ error: 'Directory temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
