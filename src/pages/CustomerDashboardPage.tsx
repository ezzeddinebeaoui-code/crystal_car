import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Heart,
  Phone,
  Mail,
  Shield,
  FileText,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Booking, Vehicle } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const CustomerDashboardPage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { formatPrice } = useLanguage();

  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation Modal
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch customer bookings
      const bRes = await fetch('/api/v1/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bData = await bRes.json();
      if (bData.success) {
        setBookings(bData.data || []);
      }

      // 2. Fetch all cars to populate favorites
      const cRes = await fetch('/api/v1/cars');
      const cData = await cRes.json();
      if (cData.success && cData.data && user?.favorites) {
        const favs = cData.data.filter((c: Vehicle) => user.favorites?.includes(c._id));
        setFavoriteCars(favs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsSubmittingCancel(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/v1/bookings/my/${cancellingBooking.referenceCode}/cancellation-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Votre réservation a bien été annulée.' });
        setCancellingBooking(null);
        setCancelReason('');
        loadData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Erreur lors de l’annulation.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
        refreshUser();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Erreur mise à jour.' });
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmée</span>
          </span>
        );
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>En cours</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terminée</span>
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Annulée</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>En attente agence</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#131722] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa8421] p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#0e121a] rounded-[15px] flex items-center justify-center text-xl font-bold text-[#d4af37]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Bienvenue, {user?.name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Espace personnel • {user?.email}
            </p>
          </div>
        </div>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-2 bg-[#0b0d11] p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'bookings'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mes Réservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'favorites'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mes Favoris ({favoriteCars.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-[#d4af37] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mon Profil
          </button>
        </div>
      </div>

      {/* Status notification toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#131722] border border-white/10 space-y-4">
              <Car className="w-12 h-12 text-[#d4af37]/40 mx-auto" />
              <h3 className="text-lg font-bold text-white">Aucune réservation pour le moment</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Explorez notre flotte et trouvez la voiture idéale pour votre prochain séjour en Tunisie.
              </p>
              <Link
                to="/cars"
                className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs"
              >
                Découvrir la flotte
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="p-6 rounded-2xl bg-[#131722] border border-white/10 hover:border-white/20 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">
                        Référence de location
                      </span>
                      <p className="text-base font-mono font-bold text-[#d4af37]">
                        {b.referenceCode}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Body: Vehicle Snapshot & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={b.vehicleSnapshot?.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'}
                        alt={b.vehicleSnapshot?.model}
                        className="w-20 h-14 object-cover rounded-xl bg-black shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {b.vehicleSnapshot?.brand} {b.vehicleSnapshot?.model}
                        </h4>
                        <p className="text-xs text-[#d4af37] font-medium">
                          {b.vehicleSnapshot?.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {b.rentalDays} jours de location
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-300">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span><strong>Départ:</strong> {b.pickupLocation}</span>
                      </p>
                      <p className="text-gray-400 pl-5">
                        {new Date(b.pickupDate).toLocaleDateString('fr-FR')} à {b.pickupTime}
                      </p>
                      <p className="flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span><strong>Retour:</strong> {b.returnLocation}</span>
                      </p>
                      <p className="text-gray-400 pl-5">
                        {new Date(b.returnDate).toLocaleDateString('fr-FR')} à {b.returnTime}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end text-left md:text-right">
                      <div>
                        <span className="text-xs text-gray-400">Montant Total :</span>
                        <p className="text-2xl font-extrabold text-[#d4af37]">
                          {formatPrice(b.totalPriceTnd)}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          Caution requise : {b.depositAmountSnapshot} TND
                        </span>
                      </div>

                      {/* Cancellation action if eligible */}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="mt-3 text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Demander l'annulation</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAVORITE CARS */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favoriteCars.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#131722] border border-white/10 space-y-4">
              <Heart className="w-12 h-12 text-red-500/40 mx-auto" />
              <h3 className="text-lg font-bold text-white">Aucun véhicule favori</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Cliquez sur le coeur sur n'importe quel véhicule du catalogue pour l'ajouter à vos favoris.
              </p>
              <Link
                to="/cars"
                className="inline-block px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs"
              >
                Explorer la flotte
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteCars.map((car) => (
                <div key={car._id} className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-3">
                  <img
                    src={car.images?.[0]}
                    alt={car.model}
                    className="w-full h-40 object-cover rounded-xl bg-black"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{car.brand} {car.model}</h4>
                      <p className="text-xs text-gray-400">{car.category}</p>
                    </div>
                    <span className="text-sm font-bold text-[#d4af37]">{formatPrice(car.dailyRateTnd)}/j</span>
                  </div>
                  <Link
                    to={`/cars/${car.slug || car._id}`}
                    className="block w-full py-2 text-center rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition"
                  >
                    Voir la fiche
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE EDIT */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#131722] border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white">Modifier Mes Informations</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Adresse Email (Identifiant de connexion)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/5 text-gray-500 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Numéro de téléphone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 98 123 456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Sauvegarder les modifications</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#131722] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Annuler la réservation {cancellingBooking.referenceCode} ?
            </h3>
            <p className="text-xs text-gray-400">
              Conformément à la politique Crystal Rent Car, l'annulation est gratuite jusqu'à 48h avant la prise en charge. Veuillez préciser la raison :
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Changement de date de vol, empêchement personnel..."
              className="w-full p-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold"
              >
                Conserver la réservation
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {isSubmittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer l'annulation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
