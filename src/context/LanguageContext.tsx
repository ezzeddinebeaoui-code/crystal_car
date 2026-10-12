import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/index.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: 'TND' | 'EUR' | 'USD';
  setCurrency: (c: 'TND' | 'EUR' | 'USD') => void;
  formatPrice: (tndAmount: number) => string;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    brand_subtitle: 'Location de voitures premium en Tunisie',
    nav_home: 'Accueil',
    nav_fleet: 'Notre Flotte',
    nav_services: 'Services & Avantages',
    nav_contact: 'Contact',
    nav_login: 'Connexion',
    nav_register: 'Inscription',
    nav_account: 'Mon Espace',
    nav_admin: 'Administration',
    nav_logout: 'Déconnexion',
    hero_title: "L'expérience automobile, sans compromis.",
    hero_subtitle: 'Découvrez, choisissez et réservez votre prochaine voiture en Tunisie avec Crystal Rent Car.',
    hero_cta_fleet: 'Découvrir nos voitures',
    hero_cta_search: 'Trouver ma voiture',
    search_pickup: 'Lieu de prise en charge',
    search_return: 'Lieu de restitution',
    search_pickup_date: 'Date de départ',
    search_return_date: 'Date de retour',
    search_category: 'Catégorie de véhicule',
    search_driver: 'Option Chauffeur privé',
    search_btn: 'Rechercher la disponibilité',
    fleet_featured_title: 'Véhicules d’Exception',
    fleet_featured_desc: 'Des véhicules récents, rigoureusement entretenus pour une sérénité absolue.',
    per_day: '/ jour',
    btn_details: 'Voir les détails',
    btn_book: 'Réserver',
    btn_assistant: 'Crystal Assistant IA',
    assistant_subtitle: 'Votre conseiller automobile personnel en Tunisie',
    filter_all: 'Tous',
    transmission_auto: 'Automatique',
    transmission_manual: 'Manuelle',
    unlimited_mileage: 'Kilométrage illimité',
    airport_delivery: 'Livraison gratuite aux aéroports',
    assistance_24: 'Assistance 24/7 sur toute la Tunisie',
    no_hidden_fees: 'Zéro frais cachés',
    recent_fleet: 'Véhicules neufs & récents',
    caution: 'Caution garantie',
    confirmed: 'Confirmée',
    pending: 'En attente',
    cancelled: 'Annulée',
    completed: 'Terminée',
    active: 'En cours',
  },
  en: {
    brand_subtitle: 'Premium Car Rental in Tunisia',
    nav_home: 'Home',
    nav_fleet: 'Our Fleet',
    nav_services: 'Services & Perks',
    nav_contact: 'Contact',
    nav_login: 'Sign In',
    nav_register: 'Sign Up',
    nav_account: 'My Account',
    nav_admin: 'Admin Panel',
    nav_logout: 'Log Out',
    hero_title: 'The Automotive Experience, Without Compromise.',
    hero_subtitle: 'Explore, choose, and reserve your next premium rental car in Tunisia with Crystal Rent Car.',
    hero_cta_fleet: 'Explore Our Cars',
    hero_cta_search: 'Find My Car',
    search_pickup: 'Pick-up Location',
    search_return: 'Drop-off Location',
    search_pickup_date: 'Pick-up Date',
    search_return_date: 'Drop-off Date',
    search_category: 'Vehicle Category',
    search_driver: 'Private Driver Option',
    search_btn: 'Check Availability',
    fleet_featured_title: 'Exclusive Fleet',
    fleet_featured_desc: 'Recent, meticulously inspected vehicles for total peace of mind in Tunisia.',
    per_day: '/ day',
    btn_details: 'View Details',
    btn_book: 'Book Now',
    btn_assistant: 'Crystal AI Assistant',
    assistant_subtitle: 'Your personal automotive concierge in Tunisia',
    filter_all: 'All',
    transmission_auto: 'Automatic',
    transmission_manual: 'Manual',
    unlimited_mileage: 'Unlimited mileage',
    airport_delivery: 'Free airport delivery',
    assistance_24: '24/7 Roadside assistance across Tunisia',
    no_hidden_fees: 'Zero hidden fees',
    recent_fleet: 'New & well-maintained fleet',
    caution: 'Security deposit',
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
    active: 'Active',
  },
  ar: {
    brand_subtitle: 'كراء سيارات راقية في تونس',
    nav_home: 'الرئيسية',
    nav_fleet: 'أسطول السيارات',
    nav_services: 'الخدمات والمزايا',
    nav_contact: 'اتصل بنا',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب',
    nav_account: 'حسابي',
    nav_admin: 'لوحة التحكم',
    nav_logout: 'تسجيل الخروج',
    hero_title: 'تجربة سياقة استثنائية، بدون مساومة.',
    hero_subtitle: 'اكتشف، اختر واحجز سيارتك الفاخرة القادمة في تونس مع كريستال رنت كار.',
    hero_cta_fleet: 'استكشف سياراتنا',
    hero_cta_search: 'ابحث عن سيارتي',
    search_pickup: 'مكان الاستلام',
    search_return: 'مكان التسليم',
    search_pickup_date: 'تاريخ الاستلام',
    search_return_date: 'تاريخ الإرجاع',
    search_category: 'فئة السيارة',
    search_driver: 'خدمة سائق خاص',
    search_btn: 'التحقق من التوفر',
    fleet_featured_title: 'أسطول سيارات مميز',
    fleet_featured_desc: 'سيارات حديثة ومجهزة بعناية فائقة لراحة وأمان تام في تونس.',
    per_day: '/ يوم',
    btn_details: 'عرض التفاصيل',
    btn_book: 'حجز الآن',
    btn_assistant: 'مساعد كريستال الذكي',
    assistant_subtitle: 'مستشارك الشخصي لاختيار السيارة المثالية في تونس',
    filter_all: 'الكل',
    transmission_auto: 'أوتوماتيك',
    transmission_manual: 'يدوي',
    unlimited_mileage: 'مسافة غير محدودة',
    airport_delivery: 'تسليم مجاني في المطارات التونسية',
    assistance_24: 'مساعدة 24/7 على مدار الساعة',
    no_hidden_fees: 'بدون أي رسوم خفية',
    recent_fleet: 'سيارات جديدة وعصرية',
    caution: 'مبلغ الضمان',
    confirmed: 'مؤكد',
    pending: 'قيد الانتظار',
    cancelled: 'ملغى',
    completed: 'مكتمل',
    active: 'جارية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('crystal_lang') as Language) || 'fr';
  });

  const [currency, setCurrencyState] = useState<'TND' | 'EUR' | 'USD'>(() => {
    return (localStorage.getItem('crystal_currency') as any) || 'TND';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('crystal_lang', lang);
  };

  const setCurrency = (c: 'TND' | 'EUR' | 'USD') => {
    setCurrencyState(c);
    localStorage.setItem('crystal_currency', c);
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.fr[key] || key;
  };

  const formatPrice = (tndAmount: number): string => {
    if (currency === 'EUR') {
      const eur = Math.round(tndAmount * 0.29);
      return `${eur} €`;
    }
    if (currency === 'USD') {
      const usd = Math.round(tndAmount * 0.32);
      return `$${usd}`;
    }
    return `${tndAmount} TND`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        formatPrice,
        t,
        isRtl,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
