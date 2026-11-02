import SitePage from './design/SitePage';

import { publicPageMetadata } from '@/lib/site-seo';
export const metadata = publicPageMetadata('/', 'ESX — справочник услуг в Корее: страховка, юрист, переводчик', 'Справочник услуг в Южной Корее: страхование и страховка, юристы, переводчики, помощь с визой и ID-картой (айди-картой). Поиск специалистов по городу и языку.');

export default function HomePage() {
  return <SitePage />;
}
