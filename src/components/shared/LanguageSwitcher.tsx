'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'ta' ? 'en' : 'ta');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold tracking-wider transition-all uppercase"
    >
      {language === 'ta' ? 'English' : 'தமிழ்'}
    </button>
  );
}
