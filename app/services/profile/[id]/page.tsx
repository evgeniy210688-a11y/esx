import { getServiceProfile } from '@/lib/service-profile-data';
import { notFound, permanentRedirect } from 'next/navigation';
import type { ServiceListing } from '@/lib/service-directory';
import { serviceProfilePath } from '@/lib/service-profile-path';
import ListingProfile from '../ListingProfile';
import { serviceProfileMetadata } from '@/lib/service-profile-metadata';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const data = await getServiceProfile((await params).id);
  if (!data) notFound();
  return serviceProfileMetadata(data);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  if (id === '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf') permanentRedirect('/services/tkhay-alina');
  const data = await getServiceProfile(id);
  if (!data) notFound();
  const path = serviceProfilePath(id);
  if (!path.startsWith('/services/profile/')) permanentRedirect(path);
  return <ListingProfile data={data as ServiceListing} />;
}
