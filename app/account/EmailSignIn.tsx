"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import type { Language } from '@/app/design/content';
import { registrationLabels, type RegistrationMessage } from './registrationLabels';

export default function EmailSignIn({ language }: { language: Language }) {
  const t = registrationLabels[language];
  const [register, setRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<RegistrationMessage | ''>('');
  const lock = useRef(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('auth_error')) {
      // Surface the result of the server-side confirmation redirect after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('authError');
    }
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  function showError(error: unknown) {
    const code = (error as { code?: string }).code;
    setStatus(code === 'user_already_exists' || code === 'email_exists' ? 'accountExists'
      : code === 'invalid_credentials' ? 'invalidCredentials'
      : code === 'email_not_confirmed' ? 'emailUnconfirmed'
      : code === 'email_address_not_authorized' || code === 'unexpected_failure' ? 'emailUnavailable'
      : code === 'weak_password' ? 'weakPassword'
      : code === 'otp_expired' || code === 'otp_disabled' ? 'invalidCode'
      : code?.includes('rate_limit') ? 'rateLimit'
      : 'requestFailed');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const login = username.trim().toLowerCase();
    if (register && !/^[a-z0-9][a-z0-9_]{2,23}$/.test(login)) {
      setStatus('invalidUsername');
      return;
    }
    if (register && password !== confirmation) { setStatus('passwordMismatch'); return; }
    lock.current = true; setBusy(true); setStatus('');
    try {
      const address = email.trim().toLowerCase();
      if (!register) {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: address, password, options: { data: { username: login, language } } });
        if (error) throw error;
        setSentEmail(address); setCode(''); setPassword(''); setConfirmation(''); setCooldown(60);
      }
    } catch (error) {
      if ((error as { code?: string }).code === 'email_not_confirmed') setSentEmail(email.trim().toLowerCase());
      showError(error);
    }
    finally { lock.current = false; setBusy(false); }
  }
  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !sentEmail) return;
    if (!/^[0-9]{6}$/.test(code)) { setStatus('codeRequired'); return; }
    lock.current = true; setBusy(true); setStatus('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: sentEmail, token: code, type: 'email' });
      if (error) throw error;
      if (!data.session) { setStatus('requestFailed'); return; }
      // useAccount observes SIGNED_IN and opens the account without another login.
    } catch (error) { showError(error); }
    finally { lock.current = false; setBusy(false); }
  }
  async function resend() {
    if (lock.current || cooldown > 0 || !sentEmail) return;
    lock.current = true; setBusy(true); setStatus('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: sentEmail });
      if (error) throw error;
      setCode(''); setCooldown(60); setStatus('emailResent');
    } catch (error) { showError(error); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="account-card">
    <div className="account-tabs" aria-label={t.tabs}>
      <button type="button" aria-pressed={register} disabled={busy} onClick={() => { setRegister(true); setSentEmail(''); setCode(''); setStatus(''); }}>{t.register}</button>
      <button type="button" aria-pressed={!register} disabled={busy} onClick={() => { setRegister(false); setSentEmail(''); setCode(''); setStatus(''); }}>{t.signIn}</button>
    </div>
    {sentEmail ? <>
      <h1>{t.confirmEmail}</h1>
      <p>{t.checkInbox} <strong>{sentEmail}</strong>. {t.confirmationHelp}</p>
      <form className="account-form" onSubmit={verifyCode}>
        <label>{t.emailCode}<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required disabled={busy} aria-describedby="email-code-help" autoFocus /></label>
        <small id="email-code-help" className="account-muted">{t.codeHelp}</small>
        <button disabled={busy}>{busy ? t.wait : t.verifyCode}</button>
      </form>
      <div className="account-actions"><button disabled={busy || cooldown > 0} onClick={resend}>{cooldown > 0 ? t.resendCountdown.replace('{seconds}', String(cooldown)) : t.resend}</button><button className="account-secondary" disabled={busy} onClick={() => { setSentEmail(''); setCode(''); setStatus(''); }}>{t.changeEmail}</button></div>
    </> : <>
      <h1>{register ? t.createTitle : t.welcome}</h1>
      <p className="account-muted">{register ? t.registerHelp : t.signInHelp}</p>
      <form className="account-form" onSubmit={submit}>
        {register && <label>{t.username}<input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={event => setUsername(event.target.value)} minLength={3} maxLength={24} required disabled={busy} /><small>{t.usernameHelp}</small></label>}
        <label>{t.email}<input type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} maxLength={254} required disabled={busy} /></label>
        <label>{t.password}<input type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={register ? 8 : 1} maxLength={72} required disabled={busy} /><small>{register && t.passwordHelp}</small></label>
        {register && <label>{t.confirmPassword}<input type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={8} maxLength={72} required disabled={busy} /></label>}
        <label className="account-checkbox"><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)} />{t.showPassword}</label>
        <button disabled={busy}>{busy ? t.wait : register ? t.createAccount : t.signIn}</button>
      </form>
    </>}
    <p role="status" className="account-status">{status ? t[status] : ''}</p>
  </section>;
}
