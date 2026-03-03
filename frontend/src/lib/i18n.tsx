import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type Language = 'en' | 'ur' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ur: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.quran': { en: 'Quran', ur: 'قرآن', ar: 'القرآن' },
  'nav.search': { en: 'Search', ur: 'تلاش', ar: 'البحث' },
  'nav.revision': { en: 'Revision', ur: 'مراجعة', ar: 'المراجعة' },
  'nav.dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ', ar: 'لوحة التحكم' },
  'nav.settings': { en: 'Settings', ur: 'ترتیبات', ar: 'الإعدادات' },

  // Auth
  'auth.login': { en: 'Sign In', ur: 'لاگ ان', ar: 'تسجيل الدخول' },
  'auth.register': { en: 'Create Account', ur: 'اکاؤنٹ بنائیں', ar: 'إنشاء حساب' },
  'auth.email': { en: 'Email', ur: 'ای میل', ar: 'البريد الإلكتروني' },
  'auth.password': { en: 'Password', ur: 'پاس ورڈ', ar: 'كلمة المرور' },
  'auth.forgotPassword': { en: 'Forgot Password?', ur: 'پاس ورڈ بھول گئے؟', ar: 'نسيت كلمة المرور؟' },

  // Dashboard
  'dashboard.streak': { en: 'Current Streak', ur: 'موجودہ سلسلہ', ar: 'السلسلة الحالية' },
  'dashboard.memorized': { en: 'Memorized', ur: 'حفظ شدہ', ar: 'محفوظ' },
  'dashboard.progress': { en: 'Progress', ur: 'پیش رفت', ar: 'التقدم' },
  'dashboard.mistakes': { en: 'Mistakes', ur: 'غلطیاں', ar: 'الأخطاء' },

  // Revision
  'revision.start': { en: 'Start Revision', ur: 'مراجعة شروع کریں', ar: 'بدء المراجعة' },
  'revision.sabaq': { en: 'Sabaq (New)', ur: 'سبق (نیا)', ar: 'السبق (جديد)' },
  'revision.manzil': { en: 'Manzil (Old)', ur: 'منزل (پرانا)', ar: 'المنزل (قديم)' },
  'revision.hide': { en: 'Hide Mode', ur: 'چھپانے کا موڈ', ar: 'وضع الإخفاء' },
  'revision.correct': { en: 'Correct', ur: 'درست', ar: 'صحيح' },
  'revision.incorrect': { en: 'Incorrect', ur: 'غلط', ar: 'خطأ' },

  // Settings
  'settings.theme': { en: 'Theme', ur: 'تھیم', ar: 'السمة' },
  'settings.language': { en: 'Language', ur: 'زبان', ar: 'اللغة' },
  'settings.audio': { en: 'Audio Settings', ur: 'آڈیو ترتیبات', ar: 'إعدادات الصوت' },
  'settings.reciter': { en: 'Default Reciter', ur: 'پہلے سے طے شدہ قاری', ar: 'القارئ الافتراضي' },

  // Common
  'common.save': { en: 'Save', ur: 'محفوظ کریں', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ur: 'منسوخ کریں', ar: 'إلغاء' },
  'common.delete': { en: 'Delete', ur: 'حذف کریں', ar: 'حذف' },
  'common.edit': { en: 'Edit', ur: 'ترمیم کریں', ar: 'تعديل' },
  'common.search': { en: 'Search', ur: 'تلاش کریں', ar: 'بحث' },
  'common.loading': { en: 'Loading...', ur: 'لوڈ ہو رہا ہے...', ar: 'جاري التحميل...' },
  'common.success': { en: 'Success', ur: 'کامیاب', ar: 'نجاح' },
  'common.error': { en: 'Error', ur: 'خرابی', ar: 'خطأ' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: () => 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['en', 'ur', 'ar'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  const dir = (): 'ltr' | 'rtl' => {
    return language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
