import type { Metadata } from 'next';
import ServicesDirectory from './ServicesDirectory';
export const metadata: Metadata = { title: 'Услуги в Южной Корее — ESX', description: 'Организации и услуги в Южной Корее: город, категория, язык обслуживания и переводчик.' };
export default function ServicesPage() { return <ServicesDirectory />; }
