import ServicesDirectory from '@/app/services/ServicesDirectory';
import { servicesPageMetadata } from '@/lib/services-page-metadata';

export const metadata = servicesPageMetadata('ru');
export default function Page() { return <ServicesDirectory routeLanguage="ru" />; }
