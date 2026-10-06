import Link from 'next/link';
import type { Language } from './content';
import { scanLabels } from '../scan/labels';
import './mobile-scan-button.css';

export default function MobileScanButton({ language }: { language: Language }) {
  const label = scanLabels[language][0];
  return <Link href="/scan" className="back-to-top floating-scan-toggle" aria-label={label} title={label}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M8 8h3v3H8zM14 8h2M8 15h2M14 13v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>;
}
