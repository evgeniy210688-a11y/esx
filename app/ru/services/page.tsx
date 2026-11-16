import ServicesDirectory from '@/app/services/PublishedServicesDirectory';
import { servicesPageMetadata } from '@/lib/services-page-metadata';

export const metadata = servicesPageMetadata('ru');
export default function Page() { return <ServicesDirectory routeLanguage="ru" />; }
