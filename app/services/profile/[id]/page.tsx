import { getServiceProfile } from '@/lib/service-profile-data';
import { notFound, redirect } from 'next/navigation';
import type { ServiceListing } from '@/lib/service-directory';
import { serviceProfilePath } from '@/lib/service-profile-path';
import ListingProfile from '../ListingProfile';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Страница справочника — ESX' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  if (id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf') redirect('/services/tkhay-alina');
  const data = await getServiceProfile(id);
  if (!data) notFound();
  const path = serviceProfilePath(id);
  if (!path.startsWith('/services/profile/')) redirect(path);
  return <ListingProfile data={data as ServiceListing} />;
}
