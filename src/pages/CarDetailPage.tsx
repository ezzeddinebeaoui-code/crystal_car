import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Users,
  Briefcase,
  Cog,
  Fuel,
  Shield,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Heart,
  ChevronLeft,
  Clock,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { Vehicle } from '../types/index.ts';
import { CarCard } from '../components/common/CarCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface CarDetailPageProps {
  onOpenBookingModal: (vehicle: Vehicle, prefill?: any) => void;
}

export const CarDetailPage: React.FC<CarDetailPageProps> = ({ onOpenBookingModal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, t } = useLanguage();
  const { isFavorite, toggleFavorite, user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Instant calculator state
  const [calcPickupDate, setCalcPickupDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  const [calcReturnDate, setCalcReturnDate] = useState(() => {
    return new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
  });
  const [includeDriver, setIncludeDriver] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/v1/cars/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setVehicle(res.data);
            setActiveImageIndex(0);
            if (res.similar) {
              setSimilarVehicles(res.similar);
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Car className="w-12 h-12 text-gray-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Véhicule introuvable</h2>
        <p className="text-xs text-gray-400">Le modèle demandé n'existe pas ou a été archivé.</p>
        <Link
          to="/cars"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs"
        >
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  // Calculator computations
  const startMs = new Date(calcPickupDate).getTime();
  const endMs = new Date(calcReturnDate).getTime();
  const days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const baseRate = vehicle.dailyRateTnd * days;
  const driverCost = includeDriver ? 60 * days : 0;
  const totalCalcTnd = baseRate + driverCost;

  const isFav = isFavorite(vehicle._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour à la sélection</span>
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => toggleFavorite(vehicle._id)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-red-400 flex items-center gap-1.5 transition"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isFav ? 'Dans vos favoris' : 'Favori'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Gallery & Specs on Left, Booking Calculator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 cols: Gallery and Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <img
                src={
                  vehicle.images?.[activeImageIndex] ||
                  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
                }
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-md bg-[#0b0d11]/80 backdrop-blur-md text-[#d4af37] text-xs font-bold border border-[#d4af37]/30 uppercase">
                  {vehicle.category}
                </span>
                <span className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
                  Millésime {vehicle.year}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#d4af37] tracking-wider uppercase">
              {vehicle.brand}
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-white">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {vehicle.description}
            </p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Caractéristiques Techniques
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-1">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <p className="text-[10px] text-gray-400">Passagers</p>
                <p className="text-sm font-bold text-white">{vehicle.seats} places</p>
              </div>

              <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-1">
                <Briefcase className="w-4 h-4 text-[#d4af37]" />
                <p className="text-[10px] text-gray-400">Capacité Coffre</p>
                <p className="text-sm font-bold text-white">{vehicle.luggage} grandes valises</p>
              </div>

              <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-1">
                <Cog className="w-4 h-4 text-[#d4af37]" />
                <p className="text-[10px] text-gray-400">Transmission</p>
                <p className="text-sm font-bold text-white">{vehicle.transmission}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#131722] border border-white/5 space-y-1">
                <Fuel className="w-4 h-4 text-[#d4af37]" />
                <p className="text-[10px] text-gray-400">Motorisation</p>
                <p className="text-sm font-bold text-white">{vehicle.fuelType}</p>
              </div>
            </div>
          </div>

          {/* Included Equipment & Verified Features */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Équipements & Options Incluses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(vehicle.features && vehicle.features.length > 0
                ? vehicle.features
                : [
                    'Climatisation automatique régulée',
                    'Bluetooth & Téléphonie mains libres',
                    'Régulateur et limiteur de vitesse',
                    'Airbags frontaux et latéraux',
                    'Fixations ISOFIX sièges enfants',
                    'Fermeture centralisée à distance',
                  ]
              ).map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Requirements & Conditions */}
          <div className="p-6 rounded-2xl bg-[#0e121a] border border-[#d4af37]/20 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Shield className="w-5 h-5 text-[#d4af37]" />
              <span>Conditions de Location pour ce Véhicule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
              <div>
                <p className="text-gray-400">Âge minimum du conducteur :</p>
                <strong className="text-white text-sm">{vehicle.minAge} ans révolus</strong>
              </div>
              <div>
                <p className="text-gray-400">Ancienneté du permis :</p>
                <strong className="text-white text-sm">2 ans minimum</strong>
              </div>
              <div>
                <p className="text-gray-400">Montant de la caution :</p>
                <strong className="text-[#d4af37] text-sm">{vehicle.depositAmountTnd} TND</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Interactive Instant Booking Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 rounded-2xl bg-[#131722] border border-[#d4af37]/30 p-6 space-y-6 shadow-2xl">
            {/* Price Header */}
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-3xl font-extrabold text-white">
                  {formatPrice(vehicle.dailyRateTnd)}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ jour</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                Disponible
              </span>
            </div>

            {/* Instant Date Calculator */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Date de prise en charge
                </label>
                <input
                  type="date"
                  value={calcPickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCalcPickupDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Date de restitution
                </label>
                <input
                  type="date"
                  value={calcReturnDate}
                  min={calcPickupDate}
                  onChange={(e) => setCalcReturnDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Driver option toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDriver}
                  onChange={(e) => setIncludeDriver(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d4af37] accent-[#d4af37]"
                />
                <div className="text-xs">
                  <p className="font-semibold text-white">Option Chauffeur Privé</p>
                  <p className="text-[11px] text-[#d4af37]">+60 TND / jour</p>
                </div>
              </label>

              {/* Price Calculation breakdown */}
              <div className="p-4 rounded-xl bg-[#0b0d11] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Durée de location :</span>
                  <span className="text-white font-semibold">{days} jour(s)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tarif journalier :</span>
                  <span className="text-white">{formatPrice(vehicle.dailyRateTnd)}</span>
                </div>
                {includeDriver && (
                  <div className="flex justify-between text-gray-400">
                    <span>Chauffeur privé ({days}j) :</span>
                    <span className="text-white">{formatPrice(driverCost)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
                  <strong className="text-white">Estimation Totale :</strong>
                  <strong className="text-[#d4af37] text-lg">{formatPrice(totalCalcTnd)}</strong>
                </div>
              </div>

              {/* Book CTA */}
              <button
                onClick={() =>
                  onOpenBookingModal(vehicle, {
                    pickupDate: calcPickupDate,
                    returnDate: calcReturnDate,
                  })
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c49e29] to-[#997715] text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Réserver cette voiture</span>
              </button>

              <div className="text-[11px] text-center text-gray-400 space-y-1">
                <p>✓ Confirmation sans frais immédiate</p>
                <p>✓ Paiement sur place à la livraison</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Vehicles Carousel */}
      {similarVehicles.length > 0 && (
        <div className="pt-10 border-t border-white/5 space-y-8">
          <div>
            <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
              Modèles Comparables
            </span>
            <h3 className="font-serif-luxury text-2xl font-bold text-white mt-1">
              Dans la Même Catégorie
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarVehicles.map((simCar) => (
              <CarCard
                key={simCar._id}
                vehicle={simCar}
                onBookNow={(c) => onOpenBookingModal(c)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
