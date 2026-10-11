"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import './entry.css';

const labels: Record<string, string[]> = {
  ru: ['Панель управления', 'Добавляйте компании, меняйте контакты, языки обслуживания и публикацию карточек.', 'Добавить компанию', 'Управлять компаниями', 'Проверяем права администратора…', 'Не удалось проверить права. Откройте панель для повторной проверки.', 'Для управления компаниями аккаунту нужны права администратора.', 'Открыть панель'],
  en: ['Admin control panel', 'Add companies and manage contacts, service languages and publication.', 'Add company', 'Manage companies', 'Checking administrator access…', 'Could not check access. Open the panel to retry.', 'This account needs administrator access to manage companies.', 'Open control panel'],
};
export default function AdminEntry({ language = 'ru', account = false }: { language?: string; account?: boolean }) {
  const { user, ready } = useAccount();
  const id = user && !user.is_anonymous ? user.id : null;
  const [result, setResult] = useState<{ id: string; status: 'allowed' | 'denied' | 'error' } | null>(null);
  const t = labels[language] ?? labels.en;
  useEffect(() => {
    if (!id) return;
    let active = true;
    async function check() {
      try {
        const { data, error } = await supabase.from('esx_service_admins').select('user_id').eq('user_id', id!).maybeSingle();
        if (active) setResult({ id: id!, status: error ? 'error' : data ? 'allowed' : 'denied' });
      } catch { if (active) setResult({ id: id!, status: 'error' }); }
    }
    void check();
    return () => { active = false; };
  }, [id]);
  if (!ready || !id) return null;
  const status = result?.id === id ? result.status : 'loading';
  if (!account && status !== 'allowed') return null;
  return <section className="admin-entry" aria-label={t[0]}>
    <h2>{t[0]}</h2>
    <p>{status === 'allowed' ? t[1] : status === 'loading' ? t[4] : status === 'error' ? t[5] : t[6]}</p>
    <div className="admin-entry-actions">
      {status === 'allowed' ? <><Link href="/admin#company-form">+ {t[2]}</Link><Link href="/admin">{t[3]} →</Link></> : status !== 'loading' && <Link href="/admin">{t[7]} →</Link>}
    </div>
  </section>;
}
