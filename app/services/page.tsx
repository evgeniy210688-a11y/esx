import { publicPageMetadata } from '@/lib/site-seo';
import type { Metadata } from 'next';
import ServicesDirectory from './ServicesDirectory';
export const metadata: Metadata = publicPageMetadata('/services', 'Услуги и специалисты в Южной Корее — ESX', 'Каталог компаний и специалистов в Южной Корее: переводчики, клиники, страхование, недвижимость и другие услуги. Поиск по городу и языку обслуживания.');
export default function ServicesPage() { return <ServicesDirectory />; }
