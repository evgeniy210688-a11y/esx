import type { Metadata } from 'next';
import Registration from './Registration';

export const metadata: Metadata = { title: 'Регистрация компании или специалиста — ESX' };
export default function RegistrationPage() { return <Registration />; }
