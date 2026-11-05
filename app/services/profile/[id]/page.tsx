import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { ServiceListing } from '@/lib/service-directory';
import ListingProfile from '../ListingProfile';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Страница справочника — ESX' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  if (id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf') redirect('/services/tkhay-alina');
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { data, error } = await client.from('esx_service_listings')
    .select('id,name,description,city,category,address,phone,phones,photo,photos,email,website,social_links,branches,represented_company,listing_kind,service_languages,has_interpreter,interpreter_languages')
    .eq('id', id).eq('status', 'published').maybeSingle();
  if (error) return <main><Link href="/services">← Назад</Link><p role="alert">Не удалось загрузить страницу. Попробуйте обновить её позже.</p></main>;
  if (!data) notFound();
  return <ListingProfile data={data as ServiceListing} />;
}
