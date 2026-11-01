import SitePage from './design/SitePage';

import { publicPageMetadata } from '@/lib/site-seo';
export const metadata = publicPageMetadata('/', 'ESX — услуги и специалисты в Южной Корее', 'Найдите компании и специалистов в Южной Корее по городу и языку обслуживания. Общайтесь с переводом, знакомьтесь с услугами и жизнью в Корее.');

export default function HomePage() {
  return <SitePage />;
}
