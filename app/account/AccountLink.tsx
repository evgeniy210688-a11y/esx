"use client";
import Link from 'next/link';
import type { Language } from '@/app/design/content';
import useAccount from './useAccount';
const labels: Record<Language, [string, string]> = {
  ru: ['Регистрация', 'Мой аккаунт'], en: ['Register', 'My account'], ko: ['회원가입', '내 계정'],
  zh: ['注册', '我的账户'], tr: ['Kayıt ol', 'Hesabım'], vi: ['Đăng ký', 'Tài khoản'],
  km: ['ចុះឈ្មោះ', 'គណនីរបស់ខ្ញុំ'], kk: ['Тіркелу', 'Менің аккаунтым'],
};
export default function AccountLink({ language, onClick }: { language: Language; onClick?: () => void }) {
  const { user } = useAccount();
  return <Link className="nav-registration" href="/account" onClick={onClick}>{labels[language][user && !user.is_anonymous ? 1 : 0]}</Link>;
}
