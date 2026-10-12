import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Clock, Plane, CheckCircle2, Database } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [dbInfo, setDbInfo] = useState<{ isAtlas: boolean; mode: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.database) {
          setDbInfo({
            isAtlas: data.database.isAtlasConnected,
            mode: data.database.mode,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="contact" className="bg-[#07090d] border-t border-white/5 text-gray-400 text-sm">
      {/* Airport delivery banner */}
      <div className="border-b border-white/5 bg-[#0b0e14]/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">
                Livraison à l’arrivée de votre vol en Tunisie
              </h4>
              <p className="text-xs text-gray-400">
                Accueil personnalisé avec pancarte à votre nom dans les 4 aéroports internationaux.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { code: 'TUN', name: 'Tunis-Carthage' },
              { code: 'NBE', name: 'Enfidha-Hammamet' },
              { code: 'MIR', name: 'Monastir' },
              { code: 'DJE', name: 'Djerba-Zarzis' },
            ].map((airport) => (
              <span
                key={airport.code}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                <strong>{airport.code}</strong> - {airport.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#aa8421] p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-[#07090d] rounded-[7px] flex items-center justify-center">
                <span className="font-serif-luxury text-xl font-bold gold-gradient-text">C</span>
              </div>
            </div>
            <div>
              <span className="font-serif-luxury text-lg font-bold tracking-wider text-white">
                CRYSTAL
              </span>
              <p className="text-[10px] tracking-widest text-[#d4af37] uppercase font-semibold">
                RENT CAR TUNISIE
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            Agence de référence en Tunisie pour la location de véhicules de prestige, berlines d'affaires et citadines récentes. Service VIP avec ou sans chauffeur.
          </p>
          <div className="flex items-center gap-3 text-xs text-emerald-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Assurance tous risques & assistance 24/7 incluse</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 text-[#d4af37]">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/" className="hover:text-white transition">
                {t('nav_home')}
              </Link>
            </li>
            <li>
              <Link to="/cars" className="hover:text-white transition">
                {t('nav_fleet')}
              </Link>
            </li>
            <li>
              <Link to="/cars?category=SUV%20%26%204x4" className="hover:text-white transition">
                SUV & Hybrides
              </Link>
            </li>
            <li>
              <Link to="/cars?category=Luxe%20%26%20Prestige" className="hover:text-white transition">
                Véhicules de Luxe
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition">
                Espace Réservation Client
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-white transition text-gray-500 hover:text-gray-300">
                Accès Gestionnaire
              </Link>
            </li>
          </ul>
        </div>

        {/* Rental Policies */}
        <div>
          <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 text-[#d4af37]">
            Conditions & Services
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Âge conducteur min: 21 à 25 ans</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Permis de conduire valide (min 2 ans)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Kilométrage illimité sur toute la Tunisie</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Paiement à la livraison / prise en charge</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Annulation gratuite jusqu'à 48h</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4 text-[#d4af37]">
            Contact & Agence
          </h4>
          <div className="flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <span>Avenue Habib Bourguiba, Tunis 1001, Tunisie</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
            <a href="tel:+21671888999" className="hover:text-white font-medium">
              +216 71 888 999
            </a>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="w-4 h-4 flex items-center justify-center font-bold text-[#d4af37]">WA</span>
            <a
              href="https://wa.me/21698123456"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white font-medium"
            >
              +216 98 123 456 (WhatsApp 24/7)
            </a>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
            <a href="mailto:contact@crystalrentcar.com" className="hover:text-white">
              contact@crystalrentcar.com
            </a>
          </div>
          <div className="flex items-center gap-3 text-xs pt-1 text-gray-500">
            <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>7j/7 - 24h/24 Assistance continue</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar with DB Status */}
      <div className="border-t border-white/5 py-6 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Crystal Rent Car Tunisie. Tous droits réservés.</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>
                Base de données:{' '}
                {dbInfo?.isAtlas ? (
                  <span className="text-emerald-400 font-semibold">MongoDB Atlas Connecté</span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Store Local Résilient (Atlas configurable via .env)
                  </span>
                )}
              </span>
            </div>
            <span>•</span>
            <span className="text-gray-400">Site Officiel Homologué</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
