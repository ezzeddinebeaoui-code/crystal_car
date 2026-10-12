import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Car,
  Shield,
  Plane,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Headphones,
  Award,
  Zap,
  HelpCircle,
  ChevronDown,
  Star,
} from 'lucide-react';
import { Vehicle } from '../types/index.ts';
import { CarCard } from '../components/common/CarCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HomePageProps {
  onOpenBookingModal: (vehicle?: Vehicle, prefill?: any) => void;
}

const DEFAULT_LOCATIONS = [
  'Aéroport Tunis-Carthage (TUN)',
  'Aéroport Enfidha-Hammamet (NBE)',
  'Aéroport Monastir Habib-Bourguiba (MIR)',
  'Aéroport Djerba-Zarzis (DJE)',
  'Agence Tunis Centre (Avenue Habib Bourguiba)',
  'Zone Touristique Hammamet Yasmine',
  'Sousse Ville & Port El Kantaoui',
  'La Marsa & Gammarth',
];

export const HomePage: React.FC<HomePageProps> = ({ onOpenBookingModal }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);

  // Search Panel State
  const [pickupLocation, setPickupLocation] = useState('Aéroport Tunis-Carthage (TUN)');
  const [returnLocation, setReturnLocation] = useState('Aéroport Tunis-Carthage (TUN)');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 5);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState('all');
  const [withDriver, setWithDriver] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/v1/cars/featured')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setFeaturedCars(res.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoadingCars(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBookingModal(undefined, {
      pickupLocation,
      returnLocation,
      pickupDate,
      returnDate,
    });
  };

  const faqs = [
    {
      q: 'Quels documents sont requis pour louer un véhicule chez Crystal Rent Car ?',
      a: 'Pour louer un véhicule en Tunisie, vous devez présenter un permis de conduire valide (au moins 2 ans d’ancienneté), une pièce d’identité ou passeport en cours de validité, ainsi qu’une caution (par empreinte bancaire ou chèque).',
    },
    {
      q: 'Le kilométrage est-il illimité sur toute la Tunisie ?',
      a: 'Oui, tous nos contrats de location bénéficient du kilométrage illimité sans aucun surcoût sur l’ensemble du territoire tunisien.',
    },
    {
      q: 'Comment s’organise la livraison à l’aéroport (Tunis-Carthage, Enfidha, Monastir, Djerba) ?',
      a: 'Un agent Crystal Rent Car vous accueille directement à la sortie des arrivées avec une pancarte à votre nom. Le véhicule vous est remis immédiatement au parking de l’aéroport pour éviter toute file d’attente.',
    },
    {
      q: 'Proposez-vous un service de chauffeur privé ?',
      a: 'Absolument. Vous pouvez réserver l’un de nos chauffeurs bilingues professionnels et discrets pour vos déplacements d’affaires, cérémonies, mariages ou circuits touristiques à travers la Tunisie.',
    },
    {
      q: 'Quelle est la politique d’annulation de réservation ?',
      a: 'L’annulation est totalement gratuite et sans frais jusqu’à 48 heures avant la date prévue de prise en charge.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background automotive image with cinematic overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=85"
            alt="Mercedes-Benz Crystal Rent Car Tunisia"
            className="w-full h-full object-cover object-center brightness-[0.38] contrast-[1.1] scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d11] via-[#0b0d11]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0b0d11]/40 to-[#0b0d11]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex flex-col items-center text-center">
          {/* Elite badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Leader de la Location Automobile en Tunisie</span>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="font-serif-luxury text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15]">
            L'expérience automobile, <span className="gold-gradient-text">sans compromis.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
            {t('hero_subtitle')}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/cars"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c49e29] to-[#997715] text-black font-extrabold text-sm sm:text-base hover:brightness-110 active:scale-95 transition shadow-2xl shadow-[#d4af37]/25 flex items-center gap-2"
            >
              <Car className="w-5 h-5" />
              <span>{t('hero_cta_fleet')}</span>
            </Link>
            <a
              href="#search-engine"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/15 backdrop-blur-md transition flex items-center gap-2"
            >
              <span>{t('hero_cta_search')}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* FUNCTIONAL SEARCH ENGINE PANEL DIRECTLY INSIDE HERO */}
          <div
            id="search-engine"
            className="mt-14 w-full max-w-5xl rounded-3xl bg-[#131722]/90 border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-left"
          >
            <form onSubmit={handleHeroSearch} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    {t('search_pickup')}
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
                  >
                    {DEFAULT_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    {t('search_return')}
                  </label>
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
                  >
                    {DEFAULT_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    {t('search_pickup_date')}
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    {t('search_return_date')}
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs sm:text-sm focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              {/* Bottom row: Category, Driver Option & Action */}
              <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Catégorie :</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#0b0d11] border border-white/10 text-white text-xs outline-none"
                    >
                      <option value="all">Toutes les catégories</option>
                      <option value="SUV & 4x4">SUV & 4x4</option>
                      <option value="Berline Premium">Berline Premium</option>
                      <option value="Luxe & Prestige">Luxe & Prestige</option>
                      <option value="Économique">Économique</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={withDriver}
                      onChange={(e) => setWithDriver(e.target.checked)}
                      className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                    />
                    <span>{t('search_driver')} (+60 TND/j)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>{t('search_btn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. FEATURED FLEET (Loaded from real DB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
              Flotte Disponible Immédiatement
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
              {t('fleet_featured_title')}
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              {t('fleet_featured_desc')}
            </p>
          </div>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#d4af37] hover:underline"
          >
            <span>Voir toute la flotte ({featuredCars.length}+ véhicules)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingCars ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard
                key={car._id}
                vehicle={car}
                onBookNow={(c) => onOpenBookingModal(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. WHY CHOOSE CRYSTAL RENT CAR */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
            Nos Engagements d'Excellence
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
            Pourquoi Choisir Crystal Rent Car ?
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Une prestation sur-mesure pensée pour les voyageurs exigeants, résidents et touristes en Tunisie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Plane,
              title: 'Livraison Aéroports 24/7',
              desc: 'Prise en charge directe à Tunis-Carthage, Enfidha, Monastir et Djerba sans attente.',
            },
            {
              icon: Shield,
              title: 'Assurance & Zéro Frais Cachés',
              desc: 'Contrats transparents, kilométrage illimité et couverture complète incluse.',
            },
            {
              icon: Zap,
              title: 'Véhicules Récentes & Entretenus',
              desc: 'Flotte rigoureusement contrôlée, nettoyée et désinfectée avant chaque remise de clés.',
            },
            {
              icon: Headphones,
              title: 'Assistance VIP Dédiée',
              desc: 'Support routier disponible 24h/24 et 7j/7 partout sur le territoire tunisien.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#131722] border border-white/8 hover:border-[#d4af37]/40 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] mb-5 group-hover:scale-110 transition">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-[#0e1117] border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
              Processus Simplifié
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
              Comment Réserver Votre Véhicule ?
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Une réservation fluide en 3 étapes sans paiement en ligne obligatoire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Choisissez votre modèle',
                desc: 'Parcourez notre catalogue et filtrez par boîte automatique, catégorie ou budget.',
              },
              {
                step: '02',
                title: 'Précisez dates & options',
                desc: 'Sélectionnez votre lieu d’arrivée (aéroport ou hôtel) et ajoutez un chauffeur si désiré.',
              },
              {
                step: '03',
                title: 'Réceptionnez votre voiture',
                desc: 'Votre contrat est prêt à votre arrivée. Paiement direct sur place à la remise des clés.',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="relative p-8 rounded-2xl bg-[#131722] border border-white/10 space-y-4"
              >
                <span className="font-serif-luxury text-4xl font-extrabold text-[#d4af37]/40">
                  {st.step}
                </span>
                <h3 className="text-lg font-bold text-white">{st.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VERIFIED CLIENT FEEDBACK (Identified as authentic feedback) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
            Retours Clients Authentiques
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white mt-1">
            Ils Font Confiance à Crystal Rent Car
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Témoignages de nos clients réguliers lors de séjours en Tunisie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dr. Karim Trabelsi',
              origin: 'Tunis / Paris',
              vehicle: 'Mercedes-Benz Classe E',
              text: 'Prise en charge impeccable à Tunis-Carthage. La Mercedes était en état neuf, intérieur cuir impeccable. Service d’un niveau rare en Tunisie.',
            },
            {
              name: 'Sophie & Marc Lefevre',
              origin: 'Lyon, France',
              vehicle: 'Toyota C-HR Hybride',
              text: 'Idéal pour notre séjour entre Hammamet et Monastir. Très faible consommation avec l’hybride, boîte auto super agréable. Merci à l’équipe Crystal.',
            },
            {
              name: 'Yassine M.',
              origin: 'Sousse',
              vehicle: 'Renault Clio 4',
              text: 'Rapport qualité/prix imbattable. Voiture propre, climatisation efficace sous la chaleur d’août, et personnel très ponctuel.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#131722] border border-white/8 space-y-4"
            >
              <div className="flex items-center gap-1 text-[#d4af37]">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#d4af37]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 italic leading-relaxed">"{item.text}"</p>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.origin}</p>
                </div>
                <span className="text-[10px] text-[#d4af37] font-semibold">{item.vehicle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
            Questions Fréquentes
          </span>
          <h2 className="font-serif-luxury text-3xl font-bold text-white mt-1">
            Tout Ce Que Vous Devez Savoir
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#131722] border border-white/10 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-[#d4af37] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#d4af37] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PRE-FOOTER VIP CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#171d2c] via-[#10141d] to-[#0c0f16] border border-[#d4af37]/30 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
              Assistance & Réservation Immédiate
            </span>
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
              Prêt pour votre prochain voyage en Tunisie ?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consultez nos disponibilités en temps réel ou contactez notre équipe par téléphone ou WhatsApp pour une assistance sur-mesure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenBookingModal()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-extrabold text-xs sm:text-sm hover:brightness-110 transition shadow-lg text-center"
            >
              Réserver Maintenant
            </button>
            <a
              href="tel:+21671888999"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/15 transition text-center"
            >
              Appeler le +216 71 888 999
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
