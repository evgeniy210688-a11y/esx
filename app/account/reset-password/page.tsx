"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import useChatInterface from '@/app/chat/[id]/useChatInterface';
import { registrationLabels } from '../registrationLabels';
import { recoveryLabels } from '../recoveryLabels';

export default function ResetPasswordPage() {
  const { language } = useChatInterface();
  const t = registrationLabels[language];
  const r = recoveryLabels[language];
  const [mode, setMode] = useState<'loading' | 'request' | 'update' | 'done'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    async function initialize() {
      try {
        if (params.has('auth_error')) { if (active) setStatus('expired'); }
        else if (params.get('verified') === '1') {
          const { data, error } = await supabase.auth.getUser();
          if (active && !error && data.user && !data.user.is_anonymous) { setMode('update'); return; }
          if (active) setStatus('expired');
        }
      } catch { if (active) setStatus('expired'); }
      if (active) setMode('request');
    }
    void initialize();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || (mode === 'request' && cooldown > 0)) return;
    if (mode === 'update' && password !== confirmation) { setStatus('passwordMismatch'); return; }
    lock.current = true; setBusy(true); setStatus('');
    try {
      if (mode === 'request') {
        const callback = new URL('/auth/callback', window.location.origin);
        callback.searchParams.set('next', '/account/reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: callback.href });
        if (error) throw error;
        setCooldown(60); setStatus('sent');
      } else if (mode === 'update') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword(''); setConfirmation(''); setMode('done');
        window.history.replaceState(null, '', '/account/reset-password');
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      setStatus(code?.includes('rate_limit') ? 'rateLimit' : code === 'weak_password' ? 'weakPassword' : code === 'same_password' ? 'samePassword' : code === 'session_not_found' || code === 'refresh_token_not_found' ? 'expired' : 'requestFailed');
      if (code === 'session_not_found' || code === 'refresh_token_not_found') setMode('request');
    } finally { lock.current = false; setBusy(false); }
  }
  const samePassword = {ru:'Новый пароль должен отличаться от прежнего.',en:'Choose a password different from your current password.',ko:'기존 비밀번호와 다른 비밀번호를 선택하세요.',zh:'新密码必须与原密码不同。',tr:'Mevcut şifrenizden farklı bir şifre seçin.',vi:'Chọn mật khẩu khác mật khẩu hiện tại.',kk:'Жаңа құпиясөз бұрынғысынан өзгеше болуы керек.',km:'សូមជ្រើសរើសពាក្យសម្ងាត់ខុសពីពាក្យសម្ងាត់បច្ចុប្បន្ន។'}[language];
  const message = status === 'sent' ? r.sent : status === 'expired' ? r.expired : status === 'samePassword' ? samePassword : t[status as keyof typeof t] || '';
  return <main className="account-page"><div className="account-shell">
    <nav className="account-nav"><Link href="/account?mode=login">{r.back}</Link></nav>
    <section className="account-card">
      <h1>{mode === 'update' ? r.newPassword : r.forgot}</h1>
      {mode === 'loading' ? <p role="status">{t.loading}</p> : mode === 'done' ? <><p role="status">{r.success}</p><Link className="account-button" href="/account">{t.signIn}</Link></> : <>
        <p className="account-muted">{mode === 'request' ? r.help : t.passwordHelp}</p>
        <form className="account-form" onSubmit={submit}>
          {mode === 'request' ? <label>{t.email}<input type="email" autoComplete="email" autoCapitalize="none" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} /></label> : <>
            <label>{r.newPassword}<input type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} /></label>
            <label>{t.confirmPassword}<input type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} value={confirmation} onChange={e => setConfirmation(e.target.value)} required disabled={busy} /></label>
            <label className="account-checkbox"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />{t.showPassword}</label>
          </>}
          <button disabled={busy || (mode === 'request' && cooldown > 0)}>{busy ? t.wait : mode === 'update' ? r.save : cooldown > 0 ? t.resendCountdown.replace('{seconds}', String(cooldown)) : r.send}</button>
        </form>
        <p role="status" className="account-status">{message}</p>
      </>}
    </section>
  </div></main>;
}
