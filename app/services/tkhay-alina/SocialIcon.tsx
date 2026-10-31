import type { SocialLink } from '@/lib/service-socials';

export default function SocialIcon({ network }: { network: SocialLink['network'] }) {
  if (network === 'instagram') return <svg className="specialist-social-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
  if (network === 'telegram') return <svg className="specialist-social-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M21.7 3.3 18.4 20c-.2 1.2-.9 1.5-1.9.9l-5-3.7-2.4 2.3c-.3.3-.6.6-1.1.6l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.3L5.6 13.5.7 12c-1.1-.3-1.1-1.1.2-1.6L20.1 3c.9-.3 1.7.2 1.6.3Z"/></svg>;
  return <svg className="specialist-social-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 0) scale(.9)"/></svg>;
}
