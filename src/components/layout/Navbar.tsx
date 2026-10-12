import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Globe,
  Phone,
  Compass,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface NavbarProps {
  onOpenBookingModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBookingModal }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0d11]/90 backdrop-blur-md border-b border-white/5 transition-all">
      {/* Top micro-bar with quick hotline info */}
      <div className="hidden md:flex items-center justify-between px-6 py-1.5 text-xs text-gray-400 border-b border-white/5 bg-[#0e1117]/80">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-[#d4af37]">
            <Phone className="w-3.5 h-3.5" />
            <a href="tel:+21671888999" className="hover:underline font-medium tracking-wide">
              +216 71 888 999
            </a>
          </span>
          <span className="text-gray-400">
            Livraison 7j/7 Aéroports Tunis-Carthage • Enfidha • Djerba • Monastir
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {(['TND', 'EUR', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  currency === c ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <Globe className="w-3 h-3 text-gray-400" />
            <button
              onClick={() => setLanguage('fr')}
              className={`px-1 rounded text-[11px] font-semibold transition ${
                language === 'fr' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1 rounded text-[11px] font-semibold transition ${
                language === 'en' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-1 rounded text-[11px] font-semibold transition ${
                language === 'ar' ? 'text-[#d4af37]' : 'text-gray-400 hover:text-white'
              }`}
            >
              عربي
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#aa8421] to-[#60490b] p-[1px] shadow-lg shadow-[#d4af37]/10 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0d11] rounded-[7px] flex items-center justify-center">
              <span className="font-serif-luxury text-xl font-bold tracking-wider gold-gradient-text">
                C
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-luxury text-lg md:text-xl font-bold tracking-widest text-white group-hover:text-[#d4af37] transition">
              CRYSTAL
            </span>
            <span className="text-[9px] tracking-[0.25em] text-[#d4af37] uppercase font-semibold">
              RENT CAR • TUNISIE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium tracking-wide transition ${
              isActive('/') ? 'text-[#d4af37] font-semibold' : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('nav_home')}
          </Link>
          <Link
            to="/cars"
            className={`text-sm font-medium tracking-wide transition ${
              isActive('/cars') ? 'text-[#d4af37] font-semibold' : 'text-gray-300 hover:text-white'
            }`}
          >
            {t('nav_fleet')}
          </Link>
          <a
            href="/#services"
            className="text-sm font-medium tracking-wide text-gray-300 hover:text-white transition"
          >
            {t('nav_services')}
          </a>
          <a
            href="/#contact"
            className="text-sm font-medium tracking-wide text-gray-300 hover:text-white transition"
          >
            {t('nav_contact')}
          </a>
        </nav>

        {/* Actions & User profile */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#d4af37]/40 transition text-sm text-gray-200"
              >
                <div className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xs font-bold text-[#d4af37]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-bold border border-[#d4af37]/40">
                    ADMIN
                  </span>
                )}
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#131722] border border-white/10 shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/5 text-xs">
                    <p className="text-gray-400">Connecté en tant que</p>
                    <p className="font-semibold text-white truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 hover:text-[#d4af37] transition"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>{t('nav_account')}</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#d4af37] hover:bg-[#d4af37]/10 transition font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{t('nav_admin')}</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition border-t border-white/5 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition"
              >
                {t('nav_login')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-[#d4af37]/50 hover:bg-white/10 transition"
              >
                {t('nav_register')}
              </Link>
            </div>
          )}

          <button
            onClick={() => {
              if (onOpenBookingModal) {
                onOpenBookingModal();
              } else {
                navigate('/cars');
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#d4af37]/20"
          >
            <Car className="w-4 h-4" />
            <span>{t('btn_book')}</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0e1117] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-200 hover:text-[#d4af37]"
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-200 hover:text-[#d4af37]"
            >
              {t('nav_fleet')}
            </Link>
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-200 hover:text-[#d4af37]"
            >
              {t('nav_services')}
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-200 hover:text-[#d4af37]"
            >
              {t('nav_contact')}
            </a>
          </nav>

          {/* Currency & Language mobile toggles */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-400 mr-1">Devise:</span>
              {(['TND', 'EUR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    currency === c ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded text-xs ${language === 'fr' ? 'text-[#d4af37] font-bold' : 'text-gray-400'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs ${language === 'en' ? 'text-[#d4af37] font-bold' : 'text-gray-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 rounded text-xs ${language === 'ar' ? 'text-[#d4af37] font-bold' : 'text-gray-400'}`}
              >
                عربي
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-xs text-gray-400">
                  Connecté : <strong className="text-white">{user.name}</strong>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-white/5 text-gray-200 hover:text-[#d4af37] border border-white/10 text-sm font-medium"
                >
                  {t('nav_account')}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-lg bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-sm font-semibold"
                  >
                    {t('nav_admin')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 text-center text-red-400 text-sm hover:underline"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenBookingModal) onOpenBookingModal();
                else navigate('/cars');
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-sm shadow-lg text-center"
            >
              {t('btn_book')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
