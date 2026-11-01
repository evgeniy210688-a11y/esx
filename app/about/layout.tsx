import { publicPageMetadata } from '@/lib/site-seo';
export const metadata = publicPageMetadata('/about', 'О проекте ESX', 'ESX — проект для общения и поиска услуг в Южной Корее.');
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
