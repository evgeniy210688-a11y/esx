'use client';
import ServicesHeader from '../ServicesHeader';
import { useProfileLanguage } from './ProfileLanguage';
export default function ProfileHeader() {
  const {language,chooseLanguage} = useProfileLanguage();
  return <ServicesHeader showDirectory language={language} chooseLanguage={chooseLanguage} />;
}
