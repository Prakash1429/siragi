import { useStore } from '@/store/useStore';
import enDict from '../../public/locales/en/common.json';
import taDict from '../../public/locales/ta/common.json';

type DictType = typeof enDict;

export const useTranslation = () => {
  const { language, setLanguage } = useStore();

  const dict: DictType = language === 'ta' ? (taDict as DictType) : enDict;

  // Simple key resolver e.g. "nav.home" or "hero.title"
  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current: any = dict;
    for (const key of keys) {
      if (current[key] !== undefined) {
        current = current[key];
      } else {
        return keyPath; // fallback to key path if not found
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  return { t, language, setLanguage };
};
