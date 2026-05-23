import { SupportedLanguage, MobileTranslations } from './types';
import { en } from './en';
import { mk } from './mk';
import { sq } from './sq';

export type { SupportedLanguage, MobileTranslations };

export const translations: Record<SupportedLanguage, MobileTranslations> = {
  en,
  mk,
  sq,
};

export function getTranslations(language: SupportedLanguage): MobileTranslations {
  return translations[language] || translations.mk;
}

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'mk', label: 'Македонски', flag: '🇲🇰' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export const LOCALE_MAP: Record<SupportedLanguage, string> = {
  mk: 'mk-MK',
  sq: 'sq-AL',
  en: 'en-US',
};
