import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import type { ServiceListing } from '@/lib/service-directory';
import type { ProfileContent } from '@/lib/specialist-content';
import { profileTexts } from '@/lib/profile-translation';
import ProfileLanguage from './ProfileLanguage';
import ProfilePage from './ProfilePage';
export const metadata: Metadata = { title: 'Tkhay Alina — ESX', description: 'Личная страница Tkhay Alina на ESX.' };
export const dynamic = 'force-dynamic';
export default async function AlinaPage() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { data, error } = await client.from('esx_service_listings')
    .select('profile_content,id,name,represented_company,description,city,category,address,phone,phones,photo,photos,website,social_links,service_languages,has_interpreter,interpreter_languages')
    .eq('id', '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf').eq('status', 'published').maybeSingle();
  if (error) return <main><Link href="/services">← Назад</Link><p role="alert">Не удалось загрузить страницу. Попробуйте обновить её позже.</p></main>;
  if (!data) notFound();
  const sourceKey = createHash('sha256').update(JSON.stringify(profileTexts(data))).digest('hex');
  return <ProfileLanguage sourceKey={sourceKey}><ProfilePage data={data as ServiceListing & {profile_content:ProfileContent | null}} /></ProfileLanguage>;
}
