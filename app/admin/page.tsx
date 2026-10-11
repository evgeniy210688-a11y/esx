import type { Metadata } from 'next';
import AdminServices from './AdminServices';
export const metadata: Metadata = { title: 'Администратор — ESX', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminServices />; }
