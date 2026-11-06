import ServicesDirectory from '@/app/services/ServicesDirectory';
import { servicesPageMetadata } from '@/lib/services-page-metadata';

export const metadata = servicesPageMetadata('en');
export default function Page() { return <ServicesDirectory routeLanguage="en" />; }
