import ServicesDirectory from '@/app/services/PublishedServicesDirectory';
import { servicesPageMetadata } from '@/lib/services-page-metadata';

export const metadata = servicesPageMetadata('ko');
export default function Page() { return <ServicesDirectory routeLanguage="ko" />; }
