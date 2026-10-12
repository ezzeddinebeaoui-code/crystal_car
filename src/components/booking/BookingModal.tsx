import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  Plane,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Vehicle } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle?: Vehicle | null;
  initialDates?: {
    pickupDate?: string;
    returnDate?: string;
    pickupLocation?: string;
    returnLocation?: string;
  };
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

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle: initialVehicle,
  initialDates,
}) => {
  const { formatPrice, t } = useLanguage();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(initialVehicle || null);

  // Form Fields
  const [pickupLocation, setPickupLocation] = useState(
    initialDates?.pickupLocation || 'Aéroport Tunis-Carthage (TUN)'
  );
  const [returnLocation, setReturnLocation] = useState(
    initialDates?.returnLocation || 'Aéroport Tunis-Carthage (TUN)'
  );
  const [pickupDate, setPickupDate] = useState(
    initialDates?.pickupDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    initialDates?.returnDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

  // Add-ons
  const [driverService, setDriverService] = useState(false);
  const [babySeat, setBabySeat] = useState(false);
  const [gps, setGps] = useState(false);
  const [additionalDriver, setAdditionalDriver] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [flightNumber, setFlightNumber] = useState('');

  // Status & Confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Load vehicles if active vehicle not set
  useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setActiveVehicle(initialVehicle);
      }
      fetch('/api/v1/cars')
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setVehicles(res.data);
            if (!initialVehicle && !activeVehicle && res.data.length > 0) {
              setActiveVehicle(res.data[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialVehicle]);

  // Sync user info if changed
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  // Calculate rental duration in days
  const startMs = new Date(pickupDate).getTime();
  const endMs = new Date(returnDate).getTime();
  const rentalDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));

  // Pricing calculation
  const dailyRate = activeVehicle?.dailyRateTnd || 0;
  const basePrice = dailyRate * rentalDays;

  const driverCost = driverService ? 60 * rentalDays : 0;
  const babySeatCost = babySeat ? 15 * rentalDays : 0;
  const gpsCost = gps ? 10 * rentalDays : 0;
  const addDriverCost = additionalDriver ? 30 : 0;

  const optionsTotal = driverCost + babySeatCost + gpsCost + addDriverCost;
  const totalPriceTnd = basePrice + optionsTotal;
  const depositTnd = activeVehicle?.depositAmountTnd || 1000;

  const handleNextToCustomer = async () => {
    setErrorMsg(null);
    if (!activeVehicle) {
      setErrorMsg('Veuillez sélectionner un véhicule.');
      return;
    }
    if (new Date(returnDate).getTime() <= new Date(pickupDate).getTime()) {
      setErrorMsg('La date de restitution doit être après la date de prise en charge.');
      return;
    }

    // Check backend availability
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: activeVehicle._id,
          pickupDate,
          returnDate,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.available) {
        setErrorMsg(data.error || data.message || 'Ce véhicule est indisponible sur ces dates.');
        setIsLoading(false);
        return;
      }
      setStep(2);
    } catch (e) {
      setErrorMsg('Erreur lors de la vérification de la disponibilité.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    setErrorMsg(null);
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg('Veuillez renseigner votre nom, email et numéro de téléphone.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('crystal_token');
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          vehicleId: activeVehicle?._id,
          pickupLocation,
          returnLocation,
          pickupDate,
          returnDate,
          pickupTime,
          returnTime,
          customerName,
          customerEmail,
          customerPhone,
          customerFlightNumber: flightNumber,
          options: {
            driverService,
            babySeat,
            gps,
            additionalDriver,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
        setStep(3);
      } else {
        setErrorMsg(data.error || 'Impossible de créer la réservation.');
      }
    } catch (e) {
      setErrorMsg('Erreur serveur lors de la confirmation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#10141d] border border-white/10 shadow-2xl overflow-hidden text-gray-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161c28]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Réservation Crystal Rent Car
              </h2>
              <p className="text-xs text-gray-400">
                {step === 1 && 'Étape 1/2 : Véhicule, dates et options'}
                {step === 2 && 'Étape 2/2 : Coordonnées et récapitulatif'}
                {step === 3 && 'Confirmation de votre réservation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Dates, Vehicle & Options */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* Vehicle Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Sélection du Véhicule
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vehicles.map((car) => {
                  const isSelected = activeVehicle?._id === car._id;
                  return (
                    <button
                      key={car._id}
                      type="button"
                      onClick={() => setActiveVehicle(car)}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10 ring-1 ring-[#d4af37]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={car.images?.[0]}
                        alt={car.model}
                        className="w-14 h-10 object-cover rounded-md bg-black"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{car.model}</p>
                        <p className="text-[10px] text-gray-400">{car.category}</p>
                        <p className="text-xs font-semibold text-[#d4af37] mt-0.5">
                          {formatPrice(car.dailyRateTnd)}/j
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pickup & Return Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  Prise en charge
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs focus:border-[#d4af37] outline-none"
                >
                  {DEFAULT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  Restitution
                </label>
                <select
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs focus:border-[#d4af37] outline-none"
                >
                  {DEFAULT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Date & Heure de Départ
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  Date & Heure de Retour
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            {/* Options & Add-ons */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Options Additionnelles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={driverService}
                    onChange={(e) => setDriverService(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Chauffeur Privé Professionnel</p>
                    <p className="text-[11px] text-[#d4af37]">+60 TND / jour</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={babySeat}
                    onChange={(e) => setBabySeat(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Siège Bébé / Rehausseur</p>
                    <p className="text-[11px] text-[#d4af37]">+15 TND / jour</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={gps}
                    onChange={(e) => setGps(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">GPS Tunisie & Cartes Hors-Ligne</p>
                    <p className="text-[11px] text-[#d4af37]">+10 TND / jour</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={additionalDriver}
                    onChange={(e) => setAdditionalDriver(e.target.checked)}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Conducteur Additionnel</p>
                    <p className="text-[11px] text-[#d4af37]">+30 TND forfait séjour</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick summary before next */}
            <div className="p-4 rounded-xl bg-[#161c28] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  Durée estimée : <strong className="text-white">{rentalDays} jours</strong>
                </p>
                <p className="text-xs text-gray-400">
                  Véhicule : <strong className="text-white">{activeVehicle?.brand} {activeVehicle?.model}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Total estimé : </span>
                <span className="text-xl font-bold text-[#d4af37]">
                  {formatPrice(totalPriceTnd)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextToCustomer}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-sm hover:brightness-110 transition flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification de la disponibilité...</span>
                  </>
                ) : (
                  <>
                    <span>Continuer vers les coordonnées</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Customer Details & Confirmation */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Customer Form */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Informations du Conducteur Principal
                </h3>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d4af37]" />
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Mohamed Ben Salem"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Ex: client@crystalrentcar.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                    Numéro de Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: +216 98 123 456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#d4af37]" />
                    Numéro de Vol (Optionnel pour livraison aéroport)
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="Ex: TU 721 (Tunisair), AF 1184"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d13] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Right Column: Complete Summary */}
              <div className="p-5 rounded-xl bg-[#0c1017] border border-white/10 space-y-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Détail du Devis
                </h3>

                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <img
                    src={activeVehicle?.images?.[0]}
                    alt={activeVehicle?.model}
                    className="w-16 h-12 object-cover rounded-lg bg-black"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {activeVehicle?.brand} {activeVehicle?.model}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {rentalDays} jours x {formatPrice(activeVehicle?.dailyRateTnd || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location de base :</span>
                    <span className="text-white font-medium">{formatPrice(basePrice)}</span>
                  </div>
                  {driverService && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chauffeur privé ({rentalDays}j) :</span>
                      <span className="text-white font-medium">{formatPrice(driverCost)}</span>
                    </div>
                  )}
                  {babySeat && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Siège bébé ({rentalDays}j) :</span>
                      <span className="text-white font-medium">{formatPrice(babySeatCost)}</span>
                    </div>
                  )}
                  {gps && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPS ({rentalDays}j) :</span>
                      <span className="text-white font-medium">{formatPrice(gpsCost)}</span>
                    </div>
                  )}
                  {additionalDriver && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conducteur additionnel :</span>
                      <span className="text-white font-medium">{formatPrice(addDriverCost)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
                    <strong className="text-white">Total à régler à l'arrivée :</strong>
                    <strong className="text-[#d4af37] text-base">{formatPrice(totalPriceTnd)}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/5 text-[11px] text-gray-400 space-y-1">
                  <p className="flex items-center gap-1.5 text-gray-300">
                    <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
                    Caution obligatoire : <strong>{depositTnd} TND</strong> (chèque ou empreinte CB non débitée)
                  </p>
                  <p className="text-emerald-400 font-medium">
                    ✓ Kilométrage illimité • Assistance 24/7 incluse
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour aux dates</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-sm hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-[#d4af37]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création de la réservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmer la réservation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && confirmedBooking && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-in zoom-in">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Demande Enregistrée avec Succès
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Merci {confirmedBooking.customerName} !
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-2">
                Votre demande de réservation a été enregistrée auprès de l'agence Crystal Rent Car. Notre équipe commerciale va préparer votre contrat.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="p-5 rounded-2xl bg-[#161c28] border border-[#d4af37]/30 max-w-md mx-auto text-center space-y-2">
              <p className="text-xs text-gray-400">Votre Référence Unique</p>
              <p className="text-2xl font-mono font-extrabold text-[#d4af37] tracking-wider">
                {confirmedBooking.referenceCode}
              </p>
              <p className="text-[11px] text-gray-400">
                Statut : <span className="text-amber-400 font-semibold">En attente de confirmation agence</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 max-w-md mx-auto text-left text-xs space-y-1.5 text-gray-300">
              <p>
                <strong>Véhicule :</strong> {confirmedBooking.vehicleSnapshot?.brand} {confirmedBooking.vehicleSnapshot?.model}
              </p>
              <p>
                <strong>Prise en charge :</strong> {confirmedBooking.pickupLocation} ({new Date(confirmedBooking.pickupDate).toLocaleDateString('fr-FR')})
              </p>
              <p>
                <strong>Montant total :</strong> {formatPrice(confirmedBooking.totalPriceTnd)} (Paiement sur place)
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                Fermer
              </button>
              <a
                href={`https://wa.me/21698123456?text=Bonjour,%20j'ai%20effectué%20la%20réservation%20${confirmedBooking.referenceCode}%20pour%20la%20${confirmedBooking.vehicleSnapshot?.brand}%20${confirmedBooking.vehicleSnapshot?.model}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Contacter l'agence sur WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
