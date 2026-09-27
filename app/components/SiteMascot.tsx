import Link from 'next/link';
import './site-mascot.css';

export default function SiteMascot() {
  return <Link href="/" className="site-mascot" aria-label="ESX — главная / Home" title="ESX">
    <span className="site-mascot-portrait" aria-hidden="true" />

  </Link>;
}
