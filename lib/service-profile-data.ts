import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getServiceProfile = cache(async (id: string) => {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.from('esx_service_listings')
    .select('id,name,description,city,category,address,phone,phones,photo,photos,email,website,social_links,branches,represented_company,listing_kind,service_languages,has_interpreter,interpreter_languages')
    .eq('id', id).eq('status', 'published').abortSignal(AbortSignal.timeout(15000)).maybeSingle();
  if (error) throw new Error('Unable to load service profile');
  return data;
});
