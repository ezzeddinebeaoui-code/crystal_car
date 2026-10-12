import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Cog, Fuel, Heart, Shield, ArrowRight } from 'lucide-react';
import { Vehicle } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface CarCardProps {
  vehicle: Vehicle;
  onBookNow?: (vehicle: Vehicle) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ vehicle, onBookNow }) => {
  const { formatPrice, t } = useLanguage();
  const { isFavorite, toggleFavorite, user } = useAuth();

  const isFav = isFavorite(vehicle._id);

  return (
    <div className="group relative rounded-2xl bg-[#131722] border border-white/8 hover:border-[#d4af37]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4af37]/10 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
        <img
          src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-black/30 pointer-events-none" />

        {/* Category & Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#0b0d11]/80 backdrop-blur-md text-[#d4af37] text-[11px] font-semibold border border-[#d4af37]/30 uppercase tracking-wider">
            {vehicle.category}
          </span>
          {vehicle.isFeatured && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              POPULAIRE
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        {user && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(vehicle._id);
            }}
            aria-label="Ajouter aux favoris"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#0b0d11]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-red-400 transition"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isFav ? 'fill-red-500 text-red-500' : 'text-gray-300'
              }`}
            />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                {vehicle.brand}
              </span>
              <h3 className="text-lg font-bold text-white group-hover:text-[#d4af37] transition">
                {vehicle.model}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-white">
                {formatPrice(vehicle.dailyRateTnd)}
              </span>
              <p className="text-[11px] text-gray-400">{t('per_day')}</p>
            </div>
          </div>

          {/* Quick specs pills */}
          <div className="grid grid-cols-4 gap-2 py-3 border-y border-white/5 my-3 text-gray-300">
            <div className="flex flex-col items-center justify-center text-center p-1.5 rounded-lg bg-white/5">
              <Users className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-[11px] font-medium">{vehicle.seats} places</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-1.5 rounded-lg bg-white/5">
              <Briefcase className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-[11px] font-medium">{vehicle.luggage} valises</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-1.5 rounded-lg bg-white/5">
              <Cog className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-[11px] font-medium truncate w-full text-center">
                {vehicle.transmission === 'Automatique' ? 'Auto' : 'Manuelle'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-1.5 rounded-lg bg-white/5">
              <Fuel className="w-4 h-4 text-[#d4af37] mb-1" />
              <span className="text-[11px] font-medium truncate w-full text-center">
                {vehicle.fuelType}
              </span>
            </div>
          </div>

          {/* Terms snippet: caution & mileage */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
              Caution : {vehicle.depositAmountTnd} TND
            </span>
            <span className="text-emerald-400 font-medium">Kilométrage illimité</span>
          </div>
        </div>

        {/* Buttons CTA */}
        <div className="flex items-center gap-2 pt-2">
          <Link
            to={`/cars/${vehicle.slug || vehicle._id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
          >
            <span>{t('btn_details')}</span>
          </Link>

          <button
            onClick={() => onBookNow?.(vehicle)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89628] hover:brightness-110 active:scale-95 text-black text-xs font-bold text-center transition shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1"
          >
            <span>{t('btn_book')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
