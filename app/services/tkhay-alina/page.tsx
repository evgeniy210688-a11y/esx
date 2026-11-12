import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceProfile } from '@/lib/service-profile-data';
import { createHash } from 'node:crypto';
import type { ServiceListing } from '@/lib/service-directory';
import type { ProfileContent } from '@/lib/specialist-content';
import { profileTexts } from '@/lib/profile-translation';
import ProfileLanguage from './ProfileLanguage';
import ProfilePage from './ProfilePage';
export const metadata: Metadata = { title: 'Tkhay Alina — ESX', description: 'Личная страница Tkhay Alina на ESX.' };
export const dynamic = 'force-dynamic';
export default async function AlinaPage() {
  const data = await getServiceProfile('7dab9a53-66c5-409c-ab50-9f6a5c8b48cf');
  if (!data) notFound();
  const sourceKey = createHash('sha256').update(JSON.stringify(profileTexts(data))).digest('hex');
  return <ProfileLanguage sourceKey={sourceKey}><ProfilePage data={data as ServiceListing & {profile_content:ProfileContent | null}} /></ProfileLanguage>;
}
