'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthSupportedLanguage, getAuthTranslation, AuthTranslationDictionary } from '@/lib/i18n/authTranslations';

interface AuthLanguageContextType {
  language: AuthSupportedLanguage;
  setLanguage: (lang: AuthSupportedLanguage) => void;
  t: AuthTranslationDictionary;
}

const AuthLanguageContext = createContext<AuthLanguageContextType | undefined>(undefined);

export function AuthLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AuthSupportedLanguage>('English');

  useEffect(() => {
    const saved = localStorage.getItem('chaos2commit_auth_lang') as AuthSupportedLanguage;
    if (saved && ['English', 'Español', 'हिन्दी', 'Français', 'Deutsch', 'العربية'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: AuthSupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('chaos2commit_auth_lang', lang);
  };

  const t = getAuthTranslation(language);

  return (
    <AuthLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AuthLanguageContext.Provider>
  );
}

export function useAuthLanguage() {
  const context = useContext(AuthLanguageContext);
  if (!context) {
    return {
      language: 'English' as AuthSupportedLanguage,
      setLanguage: () => {},
      t: getAuthTranslation('English'),
    };
  }
  return context;
}
