"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { safeAccountNext } from '@/lib/account-path';

export default function EmailSignIn({ russian }: { russian: boolean }) {
  const c = (ru: string, en: string) => russian ? ru : en;
  const [register, setRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('auth_error')) {
      // Surface the result of the server-side confirmation redirect after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(russian ? 'Ссылка подтверждения недействительна или открыта в другом браузере. Попробуйте войти; если почта не подтверждена, запросите новое письмо.' : 'The confirmation link is invalid or was opened in another browser. Try signing in; if your email is unconfirmed, request a new email.');
    }
  }, [russian]);
  useEffect(() => {
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  function callbackUrl() {
    const callback = new URL('/auth/callback', window.location.origin);
    callback.searchParams.set('next', safeAccountNext(new URLSearchParams(window.location.search).get('next')));
    return callback.toString();
  }
  function showError(error: unknown) {
    const code = (error as { code?: string }).code;
    setStatus(code === 'user_already_exists' || code === 'email_exists' ? c('Аккаунт с этой почтой уже существует. Перейдите во вкладку «Вход».', 'An account with this email already exists. Open the Sign in tab.')
      : code === 'invalid_credentials' ? c('Неверная почта или пароль.', 'Incorrect email or password.')
      : code === 'email_not_confirmed' ? c('Сначала подтвердите почту по ссылке в письме.', 'First confirm your email using the link in your inbox.')
      : code === 'email_address_not_authorized' || code === 'unexpected_failure' ? c('Отправка писем сейчас недоступна. Попробуйте позже.', 'Email delivery is currently unavailable. Please try again later.')
      : code === 'weak_password' ? c('Выберите более надёжный пароль, не короче 8 символов.', 'Choose a stronger password with at least 8 characters.')
      : code?.includes('rate_limit') ? c('Слишком много попыток. Попробуйте немного позже.', 'Too many attempts. Please try again later.')
      : c('Не удалось выполнить запрос. Попробуйте позже.', 'The request failed. Please try again later.'));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    const login = username.trim().toLowerCase();
    if (register && !/^[a-z0-9][a-z0-9_]{2,23}$/.test(login)) {
      setStatus(c('Логин: от 3 до 24 латинских букв, цифр или _. Начните с буквы или цифры.', 'Username: 3–24 English letters, numbers or _. Start with a letter or number.'));
      return;
    }
    if (register && password !== confirmation) { setStatus(c('Пароли не совпадают.', 'Passwords do not match.')); return; }
    lock.current = true; setBusy(true); setStatus('');
    try {
      const address = email.trim().toLowerCase();
      if (!register) {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: callbackUrl(), data: { username: login } } });
        if (error) throw error;
        setSentEmail(address); setPassword(''); setConfirmation(''); setCooldown(60);
      }
    } catch (error) {
      if ((error as { code?: string }).code === 'email_not_confirmed') setSentEmail(email.trim().toLowerCase());
      showError(error);
    }
    finally { lock.current = false; setBusy(false); }
  }
  async function resend() {
    if (lock.current || cooldown > 0 || !sentEmail) return;
    lock.current = true; setBusy(true); setStatus('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: sentEmail, options: { emailRedirectTo: callbackUrl() } });
      if (error) throw error;
      setCooldown(60); setStatus(c('Письмо отправлено повторно.', 'Confirmation email sent again.'));
    } catch (error) { showError(error); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="account-card">
    <div className="account-tabs" aria-label={c('Вход или регистрация', 'Sign in or register')}>
      <button type="button" aria-pressed={register} disabled={busy} onClick={() => { setRegister(true); setSentEmail(''); setStatus(''); }}>{c('Регистрация', 'Register')}</button>
      <button type="button" aria-pressed={!register} disabled={busy} onClick={() => { setRegister(false); setSentEmail(''); setStatus(''); }}>{c('Вход', 'Sign in')}</button>
    </div>
    {sentEmail ? <>
      <h1>{c('Подтвердите почту', 'Confirm your email')}</h1>
      <p>{c('Проверьте почту', 'Check your inbox at')} <strong>{sentEmail}</strong>. {c('Откройте ссылку в письме, чтобы активировать аккаунт. Если письма нет, проверьте папку «Спам».', 'Open the confirmation link to activate your account. If the email is missing, check your spam folder.')}</p>
      <div className="account-actions"><button disabled={busy || cooldown > 0} onClick={resend}>{cooldown > 0 ? c(`Повторить через ${cooldown} с`, `Resend in ${cooldown}s`) : c('Отправить письмо ещё раз', 'Resend email')}</button><button className="account-secondary" disabled={busy} onClick={() => { setSentEmail(''); setStatus(''); }}>{c('Изменить почту', 'Change email')}</button></div>
    </> : <>
      <h1>{register ? c('Создайте свой ESX', 'Create your ESX account') : c('С возвращением', 'Welcome back')}</h1>
      <p className="account-muted">{register ? c('Выберите логин, укажите почту и придумайте пароль. Подтвердите адрес по ссылке в письме — откроется личный кабинет с постоянным QR-кодом.', 'Choose a username, enter your email and create a password. Confirm your address using the email link to open your account with a permanent QR code.') : c('Введите почту и пароль, чтобы открыть свой кабинет.', 'Enter your email and password to open your account.')}</p>
      <form className="account-form" onSubmit={submit}>
        {register && <label>{c('Логин', 'Username')}<input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={event => setUsername(event.target.value)} minLength={3} maxLength={24} required disabled={busy} /><small>{c('3–24 латинские буквы, цифры или _. Для входа используется почта.', '3–24 English letters, numbers or _. Use your email to sign in.')}</small></label>}
        <label>{c('Электронная почта', 'Email')}<input type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} maxLength={254} required disabled={busy} /></label>
        <label>{c('Пароль', 'Password')}<input type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={register ? 8 : 1} maxLength={72} required disabled={busy} /><small>{register && c('От 8 символов.', 'At least 8 characters.')}</small></label>
        {register && <label>{c('Повторите пароль', 'Confirm password')}<input type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={8} maxLength={72} required disabled={busy} /></label>}
        <label className="account-checkbox"><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)} />{c('Показать пароль', 'Show password')}</label>
        {register && <small className="account-muted">{c('Фото профиля можно добавить в личном кабинете после подтверждения почты.', 'You can add a profile photo in your account after confirming your email.')}</small>}
        <button disabled={busy}>{busy ? c('Подождите…', 'Please wait…') : register ? c('Зарегистрироваться', 'Create account') : c('Войти', 'Sign in')}</button>
      </form>
    </>}
    <p role="status" className="account-status">{status}</p>
  </section>;
}
