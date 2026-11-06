import { notFound } from 'next/navigation';
import { getServiceProfile } from '@/lib/service-profile-data';
import { serviceProfileId, serviceProfilePath } from '@/lib/service-profile-path';
import { publicPageMetadata } from '@/lib/site-seo';
import type { ServiceListing } from '@/lib/service-directory';
import ListingProfile from '../profile/ListingProfile';

export const dynamic = 'force-dynamic';

async function profile(slug: string) {
  const id = serviceProfileId(slug);
  if (!id) notFound();
  const data = await getServiceProfile(id);
  if (!data) notFound();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await profile((await params).slug);
  return publicPageMetadata(serviceProfilePath(data.id), `${data.name} — ESX`, `${data.name} — услуги и контакты в Южной Корее.`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const data = await profile((await params).slug);
  return <ListingProfile data={data as ServiceListing} />;
}
