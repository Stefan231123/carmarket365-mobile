import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { SupportedLanguage, MobileTranslations, getTranslations } from '../i18n';
import { useAuth } from './AuthContext';

const LANGUAGE_KEY = '@language';

const UPDATE_LANGUAGE = gql`
  mutation UpdateLanguagePreference($languageCode: String!) {
    updateLanguagePreference(languageCode: $languageCode) {
      id
      languagePreference
    }
  }
`;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: MobileTranslations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'mk',
  setLanguage: () => {},
  t: getTranslations('mk'),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('mk');
  const { isAuthenticated } = useAuth();
  const apolloClient = useApolloClient();

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (!mounted) return;
      if (stored && (stored === 'mk' || stored === 'sq' || stored === 'en')) {
        setLanguageState(stored);
      }
    });
    return () => { mounted = false; };
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);

    if (isAuthenticated) {
      apolloClient.mutate({
        mutation: UPDATE_LANGUAGE,
        variables: { languageCode: lang },
      }).catch(() => {});
    }
  }, [isAuthenticated, apolloClient]);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
