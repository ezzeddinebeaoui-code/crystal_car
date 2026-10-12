import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  Car,
  Fuel,
  Users,
  Briefcase,
  Cog,
  Check,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { Vehicle } from '../types/index.ts';
import { CarCard } from '../components/common/CarCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FleetPageProps {
  onOpenBookingModal: (vehicle: Vehicle) => void;
}

export const FleetPage: React.FC<FleetPageProps> = ({ onOpenBookingModal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice, t } = useLanguage();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedTransmission, setSelectedTransmission] = useState(searchParams.get('transmission') || 'all');
  const [selectedFuel, setSelectedFuel] = useState(searchParams.get('fuel') || 'all');
  const [selectedSeats, setSelectedSeats] = useState<number | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('recommended');

  const categories = ['all', 'SUV & 4x4', 'Berline Premium', 'Luxe & Prestige', 'Économique', 'Compacte'];

  useEffect(() => {
    fetchVehicles();
  }, [selectedCategory, selectedTransmission, selectedFuel, sortBy]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedTransmission !== 'all') params.set('transmission', selectedTransmission);
      if (selectedFuel !== 'all') params.set('fuelType', selectedFuel);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy !== 'recommended') params.set('sort', sortBy);

      const res = await fetch(`/api/v1/cars?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setVehicles(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTransmission('all');
    setSelectedFuel('all');
    setSelectedSeats('all');
    setMaxPrice(500);
    setSortBy('recommended');
  };

  // Client-side quick filter on price & seats
  const filteredVehicles = vehicles.filter((v) => {
    if (v.dailyRateTnd > maxPrice) return false;
    if (selectedSeats !== 'all' && v.seats < selectedSeats) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title & Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <span className="text-xs font-extrabold text-[#d4af37] tracking-widest uppercase">
            Catalogue Automobile
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Notre Flotte de Véhicules en Tunisie
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl">
            Découvrez des modèles récents, climatisés et entretenus selon les standards les plus exigeants. Tarifs transparents en Dinars Tunisiens (TND).
          </p>
        </div>

        {/* View mode toggle & sorting */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Vue Grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Vue Liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#131722] px-3 py-2 rounded-xl border border-white/10 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#d4af37]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="recommended" className="bg-[#131722]">Recommandés</option>
              <option value="price_asc" className="bg-[#131722]">Prix : Moins cher</option>
              <option value="price_desc" className="bg-[#131722]">Prix : Plus cher</option>
              <option value="newest" className="bg-[#131722]">Année récente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg shadow-[#d4af37]/20 font-bold'
                  : 'bg-[#131722] text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par marque ou modèle (Toyota, Mercedes, Clio...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Transmission filter */}
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white outline-none"
            >
              <option value="all">Toutes boîtes</option>
              <option value="Automatique">Automatique</option>
              <option value="Manuelle">Manuelle</option>
            </select>

            {/* Fuel filter */}
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white outline-none"
            >
              <option value="all">Tous carburants</option>
              <option value="Essence">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybride">Hybride</option>
            </select>

            {/* Seats filter */}
            <select
              value={selectedSeats}
              onChange={(e) => setSelectedSeats(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-xs text-white outline-none"
            >
              <option value="all">Nombre de places</option>
              <option value="5">5 places et +</option>
              <option value="7">7 places</option>
            </select>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </form>

        {/* Price Slider Bar */}
        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-80">
            <span className="text-gray-400 shrink-0">Budget max/jour :</span>
            <input
              type="range"
              min={80}
              max={500}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />
            <span className="font-bold text-[#d4af37] shrink-0 w-20 text-right">
              {formatPrice(maxPrice)}
            </span>
          </div>

          <div className="text-gray-400 text-xs">
            <strong className="text-white">{filteredVehicles.length}</strong> véhicule(s) correspondent à vos critères
          </div>
        </div>
      </div>

      {/* Grid or List of Vehicles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#131722] border border-white/10 space-y-4">
          <Car className="w-12 h-12 text-[#d4af37]/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">Aucun véhicule trouvé</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Aucun modèle ne correspond exactement à vos critères de recherche. Essayez d'élargir vos filtres de prix ou de catégorie.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((car) => (
            <CarCard
              key={car._id}
              vehicle={car}
              onBookNow={(c) => onOpenBookingModal(c)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredVehicles.map((car) => (
            <div
              key={car._id}
              className="p-5 rounded-2xl bg-[#131722] border border-white/10 hover:border-[#d4af37]/40 transition flex flex-col md:flex-row items-center gap-6"
            >
              <img
                src={car.images?.[0]}
                alt={car.model}
                className="w-full md:w-64 h-40 object-cover rounded-xl bg-black shrink-0"
              />
              <div className="flex-1 space-y-2 text-left w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/5 text-[#d4af37] text-[10px] font-bold uppercase">
                    {car.category}
                  </span>
                  <span className="text-xs text-gray-400">{car.year}</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {car.brand} {car.model}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">{car.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                  <span>{car.seats} places</span>
                  <span>•</span>
                  <span>{car.luggage} valises</span>
                  <span>•</span>
                  <span>{car.transmission}</span>
                  <span>•</span>
                  <span>{car.fuelType}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                <div className="text-left md:text-right">
                  <span className="text-2xl font-extrabold text-white">
                    {formatPrice(car.dailyRateTnd)}
                  </span>
                  <p className="text-[10px] text-gray-400">/ jour</p>
                </div>
                <button
                  onClick={() => onOpenBookingModal(car)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs"
                >
                  Réserver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
