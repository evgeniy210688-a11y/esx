import ServicesDirectory from '@/app/services/PublishedServicesDirectory';
import { servicesPageMetadata } from '@/lib/services-page-metadata';

export const metadata = servicesPageMetadata('en');
export default function Page() { return <ServicesDirectory routeLanguage="en" />; }
