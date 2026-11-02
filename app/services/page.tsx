import { publicPageMetadata } from '@/lib/site-seo';
import type { Metadata } from 'next';
import ServicesDirectory from './ServicesDirectory';
export const metadata: Metadata = publicPageMetadata('/services', 'Справочник услуг в Корее — страхование, юристы, визы | ESX', 'Нужны страховка, юрист или переводчик в Корее? Справочник ESX: страхование, помощь с визой и ID-картой (айди-картой), поиск услуг по городу и языку.');
export default function ServicesPage() { return <ServicesDirectory />; }
