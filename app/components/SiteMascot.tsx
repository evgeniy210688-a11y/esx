'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './site-mascot.css';

export default function SiteMascot() {
  const pathname = usePathname();
  const section = pathname.split('/')[1];
  const pose = section === '' || section === 'contact' ? 'wave'
    : section === 'korea' || section === 'about' ? 'globe'
    : section === 'advertising' ? 'point' : 'mascot';
  return <Link href="/" className="site-mascot" aria-label="ESX — главная / Home" title="ESX">
    <span className="site-mascot-portrait" aria-hidden="true" style={{ backgroundImage: `url('/esx-fox-${pose}.webp')` }} />
  </Link>;
}
