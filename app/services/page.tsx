import { servicesLanguageAlternates } from '@/lib/services-page-metadata';
import { publicPageMetadata } from '@/lib/site-seo';
import type { Metadata } from 'next';
import ServicesDirectory from './ServicesDirectory';
import DirectoryIndex from './DirectoryIndex';
const baseMetadata = publicPageMetadata('/services', 'Справочник услуг и специалистов в Южной Корее | ESX', 'Справочник ESX в Южной Корее: русскоязычные специалисты, авто, страховка, кафе, рестораны, салоны красоты, недвижимость, медицина и переводчики.');
export const metadata: Metadata = {...baseMetadata, alternates: {...baseMetadata.alternates, languages: servicesLanguageAlternates}};
export default function ServicesPage() { return <><ServicesDirectory /><DirectoryIndex /></>; }
