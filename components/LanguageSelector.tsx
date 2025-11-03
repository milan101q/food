
import React from 'react';
import { Language, Translation, translations } from '../i18n/translations.ts';

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage, t }) => {
  return (
    <div className="w-full max-w-md text-center p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 font-display">{t.languageSelector.title}</h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {(Object.keys(translations) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => onSelectLanguage(lang)}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300"
          >
            {translations[lang].languageName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;