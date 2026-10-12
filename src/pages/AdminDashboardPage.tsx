import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  Settings,
  FileSpreadsheet,
  Shield,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Database,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Eye,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Vehicle, Booking } from '../types/index.ts';

type AdminTab = 'overview' | 'fleet' | 'bookings' | 'users' | 'settings' | 'reports';

export const AdminDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { formatPrice } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard Data
  const [metrics, setMetrics] = useState<any>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  // Fleet Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  // Bookings Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [internalNote, setInternalNote] = useState('');

  // Users Data
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Settings Data
  const [agencySettings, setAgencySettings] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Health / DB status
  const [dbHealth, setDbHealth] = useState<any>(null);

  // Verify Admin
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAdminData();
  }, [token, user]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Dashboard metrics
      const dRes = await fetch('/api/v1/admin/dashboard', { headers });
      const dData = await dRes.json();
      if (dData.success) {
        setMetrics(dData.metrics);
        setMonthlyTrends(dData.monthlyTrends || []);
        setStatusDistribution(dData.statusDistribution || []);
        setCategoryDistribution(dData.categoryDistribution || []);
        setRecentBookings(dData.recentBookings || []);
      }

      // 2. Fleet
      const fRes = await fetch('/api/v1/admin/cars', { headers });
      const fData = await fRes.json();
      if (fData.success) setVehicles(fData.data || []);

      // 3. Bookings
      const bRes = await fetch('/api/v1/admin/bookings', { headers });
      const bData = await bRes.json();
      if (bData.success) setBookings(bData.data || []);

      // 4. Users
      const uRes = await fetch('/api/v1/admin/users', { headers });
      const uData = await uRes.json();
      if (uData.success) setUsersList(uData.data || []);

      // 5. Settings
      const sRes = await fetch('/api/v1/admin/settings', { headers });
      const sData = await sRes.json();
      if (sData.success) setAgencySettings(sData.data || {});

      // 6. DB health
      const hRes = await fetch('/api/v1/health');
      const hData = await hRes.json();
      setDbHealth(hData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Status changer for Bookings
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note: internalNote }),
      });
      const data = await res.json();
      if (data.success) {
        setInternalNote('');
        if (viewingBooking && (viewingBooking._id === id || viewingBooking.referenceCode === id)) {
          setViewingBooking(data.data);
        }
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Vehicle
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      const isNew = !editingVehicle._id || editingVehicle._id.startsWith('new_');
      const url = isNew ? '/api/v1/admin/cars' : `/api/v1/admin/cars/${editingVehicle._id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingVehicle),
      });

      const data = await res.json();
      if (data.success) {
        setEditingVehicle(null);
        setIsAddVehicleOpen(false);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule de la flotte ?')) return;
    try {
      const res = await fetch(`/api/v1/admin/cars/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(agencySettings),
      });
      const data = await res.json();
      if (data.success) {
        alert('Paramètres enregistrés avec succès.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    window.location.href = '/api/v1/admin/reports/csv';
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const match =
        b.referenceCode.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.vehicleSnapshot?.model.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10] flex flex-col md:flex-row">
      {/* 1. SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0e121a] border-r border-white/5 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37] flex items-center justify-center font-bold text-black font-serif-luxury text-sm">
              C
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">CRYSTAL ADMIN</h2>
              <p className="text-[10px] text-[#d4af37]">Portail Agence Tunisie</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
              { id: 'fleet', label: 'Gestion Flotte', icon: Car, count: vehicles.length },
              { id: 'bookings', label: 'Réservations', icon: CalendarCheck, count: bookings.length },
              { id: 'users', label: 'Clients & Comptes', icon: Users, count: usersList.length },
              { id: 'settings', label: 'Tarifs & Paramètres', icon: Settings },
              { id: 'reports', label: 'Rapports & Export', icon: FileSpreadsheet },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b89628] text-black font-bold shadow-lg shadow-[#d4af37]/15'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Database Status in Sidebar */}
        <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/5 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Database className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Base de Données</span>
          </div>
          <p className="text-gray-400">
            {dbHealth?.database?.isAtlasConnected ? (
              <span className="text-emerald-400 font-semibold">✓ Atlas Connecté</span>
            ) : (
              <span className="text-amber-400 font-medium">⚡ Mode Résilient Actif</span>
            )}
          </p>
          <p className="text-[10px] text-gray-500">
            Hôte: {dbHealth?.database?.host?.slice(0, 20)}
          </p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'overview' && "Tableau de Bord & Métriques en Temps Réel"}
              {activeTab === 'fleet' && "Gestion du Parc Automobile"}
              {activeTab === 'bookings' && "Supervision des Réservations"}
              {activeTab === 'users' && "Gestion des Utilisateurs"}
              {activeTab === 'settings' && "Paramètres Généraux & Grille Tarifaire"}
              {activeTab === 'reports' && "Rapports & Exportations Comptables"}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Crystal Rent Car • Agence Tunisie • Session administrative sécurisée
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'fleet' && (
              <button
                onClick={() => {
                  setEditingVehicle({
                    _id: `new_${Date.now()}`,
                    brand: 'Toyota',
                    model: 'Nouveau Modèle',
                    category: 'SUV & 4x4',
                    year: 2024,
                    dailyRateTnd: 150,
                    seats: 5,
                    luggage: 3,
                    transmission: 'Automatique',
                    fuelType: 'Essence',
                    depositAmountTnd: 1500,
                    minAge: 23,
                    status: 'available',
                    images: [
                      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
                    ],
                    features: ['Climatisation', 'Bluetooth', 'Régulateur'],
                    description: 'Description du véhicule...',
                  });
                  setIsAddVehicleOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un véhicule</span>
              </button>
            )}

            {activeTab === 'bookings' && (
              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span>Exporter CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
                <span className="text-xs text-gray-400">Total Réservations</span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-extrabold text-white">{metrics?.totalBookings || 0}</h3>
                  <span className="text-xs text-amber-400 font-bold">
                    {metrics?.pendingBookings || 0} en attente
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37]"
                    style={{
                      width: `${
                        metrics?.totalBookings
                          ? ((metrics.confirmedBookings + metrics.completedBookings) / metrics.totalBookings) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
                <span className="text-xs text-gray-400">Chiffre Confirmé / Réalisé</span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-extrabold text-[#d4af37]">
                    {formatPrice(metrics?.confirmedRevenue || 0)}
                  </h3>
                  <span className="text-[10px] text-gray-400">Paiement sur place</span>
                </div>
                <p className="text-[11px] text-emerald-400">
                  {metrics?.confirmedBookings || 0} validées + {metrics?.completedBookings || 0} terminées
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
                <span className="text-xs text-gray-400">Parc Automobile Total</span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-extrabold text-white">{metrics?.totalVehicles || 0}</h3>
                  <span className="text-xs text-emerald-400 font-bold">
                    {metrics?.availableVehicles || 0} disponibles
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {metrics?.maintenanceVehicles || 0} en maintenance • {metrics?.reservedVehicles || 0} en mission
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131722] border border-white/10 space-y-2">
                <span className="text-xs text-gray-400">Taux d'Utilisation Flotte</span>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-extrabold text-white">{metrics?.utilizationRate || 0}%</h3>
                  <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#d4af37]"
                    style={{ width: `${metrics?.utilizationRate || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 cols: Monthly Bookings & Revenue */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Évolution Mensuelle des Réservations</h3>
                  <span className="text-xs text-[#d4af37]">Données réelles de la base</span>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0b0d11',
                          borderColor: '#374151',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="reservations"
                        stroke="#d4af37"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#goldGradient)"
                        name="Réservations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right 4 cols: Status Distribution Pie */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Répartition des Statuts</h3>
                <div className="h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#d4af37'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0b0d11',
                          borderColor: '#374151',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table preview */}
            <div className="p-6 rounded-2xl bg-[#131722] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Dernières Demandes Reçues</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-[#d4af37] hover:underline"
                >
                  Voir toutes les réservations
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0b0d11] text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Référence</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Véhicule</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-white/5 transition">
                        <td className="p-3 font-mono font-bold text-[#d4af37]">{b.referenceCode}</td>
                        <td className="p-3">
                          <p className="font-semibold text-white">{b.customerName}</p>
                          <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                        </td>
                        <td className="p-3">
                          {b.vehicleSnapshot?.brand} {b.vehicleSnapshot?.model}
                        </td>
                        <td className="p-3">
                          {new Date(b.pickupDate).toLocaleDateString('fr-FR')} - {new Date(b.returnDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-3 font-bold text-white">{formatPrice(b.totalPriceTnd)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : b.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setViewingBooking(b);
                              setActiveTab('bookings');
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="rounded-2xl bg-[#131722] border border-white/10 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-black">
                    <img
                      src={v.images?.[0]}
                      alt={v.model}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#d4af37] text-[10px] font-bold uppercase">
                        {v.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === 'available'
                            ? 'bg-emerald-500/80 text-white'
                            : v.status === 'maintenance'
                            ? 'bg-red-500/80 text-white'
                            : 'bg-amber-500/80 text-white'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">{v.brand}</span>
                        <h4 className="text-base font-bold text-white">{v.model}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#d4af37]">
                          {formatPrice(v.dailyRateTnd)}
                        </span>
                        <span className="text-[10px] text-gray-400 block">/ jour</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[10px] text-center text-gray-300 py-2 border-y border-white/5">
                      <div>
                        <p className="text-gray-400">Places</p>
                        <strong>{v.seats}</strong>
                      </div>
                      <div>
                        <p className="text-gray-400">Coffre</p>
                        <strong>{v.luggage}</strong>
                      </div>
                      <div>
                        <p className="text-gray-400">Boîte</p>
                        <strong className="truncate block">{v.transmission}</strong>
                      </div>
                      <div>
                        <p className="text-gray-400">Carburant</p>
                        <strong>{v.fuelType}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingVehicle(v);
                          setIsAddVehicleOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        onClick={() => handleDeleteVehicle(v._id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RESERVATIONS SUPERVISION */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Rechercher référence, nom ou email..."
                  className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-400">Statut :</span>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#131722] border border-white/10 text-white text-xs outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="active">En cours</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-2xl bg-[#131722] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0b0d11] text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Réf.</th>
                      <th className="p-4">Client & Contact</th>
                      <th className="p-4">Véhicule</th>
                      <th className="p-4">Prise en charge</th>
                      <th className="p-4">Restitution</th>
                      <th className="p-4">Montant Total</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-mono font-bold text-[#d4af37]">{b.referenceCode}</td>
                        <td className="p-4">
                          <p className="font-bold text-white">{b.customerName}</p>
                          <p className="text-[10px] text-gray-400">{b.customerEmail}</p>
                          <p className="text-[10px] text-[#d4af37]">{b.customerPhone}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-white">{b.vehicleSnapshot?.brand} {b.vehicleSnapshot?.model}</p>
                          <p className="text-[10px] text-gray-400">{b.rentalDays} jours</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white truncate max-w-[150px]">{b.pickupLocation}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(b.pickupDate).toLocaleDateString('fr-FR')} à {b.pickupTime}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-white truncate max-w-[150px]">{b.returnLocation}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(b.returnDate).toLocaleDateString('fr-FR')} à {b.returnTime}
                          </p>
                        </td>
                        <td className="p-4 font-extrabold text-[#d4af37]">
                          {formatPrice(b.totalPriceTnd)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : b.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : b.status === 'active'
                                ? 'bg-blue-500/20 text-blue-400'
                                : b.status === 'completed'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setViewingBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition"
                          >
                            Gérer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#131722] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0b0d11] text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Nom</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Rôle</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Inscrit le</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white">{u.name}</td>
                        <td className="p-4 text-gray-300">{u.email}</td>
                        <td className="p-4 text-gray-400">{u.phone || 'Non renseigné'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-[#d4af37]/20 text-[#d4af37]'
                                : 'bg-white/5 text-gray-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={async () => {
                                const newStat = u.status === 'active' ? 'suspended' : 'active';
                                await fetch(`/api/v1/admin/users/${u._id}/status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ status: newStat }),
                                });
                                loadAdminData();
                              }}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs"
                            >
                              {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AGENCY SETTINGS & PRICING */}
        {activeTab === 'settings' && agencySettings && (
          <div className="max-w-3xl rounded-2xl bg-[#131722] border border-white/10 p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Paramètres Généraux de l'Agence</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Nom commercial</label>
                  <input
                    type="text"
                    value={agencySettings.agencyName || ''}
                    onChange={(e) => setAgencySettings({ ...agencySettings, agencyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Téléphone agence</label>
                  <input
                    type="text"
                    value={agencySettings.phone || ''}
                    onChange={(e) => setAgencySettings({ ...agencySettings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">WhatsApp 24/7</label>
                  <input
                    type="text"
                    value={agencySettings.whatsapp || ''}
                    onChange={(e) => setAgencySettings({ ...agencySettings, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email officiel</label>
                  <input
                    type="email"
                    value={agencySettings.email || ''}
                    onChange={(e) => setAgencySettings({ ...agencySettings, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                  />
                </div>
              </div>

              {/* Options pricing */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#d4af37]">
                  Tarifs des Options Additionnelles (TND)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Chauffeur privé (TND/jour)</label>
                    <input
                      type="number"
                      value={agencySettings.optionsPricing?.driverPerDayTnd || 60}
                      onChange={(e) =>
                        setAgencySettings({
                          ...agencySettings,
                          optionsPricing: {
                            ...agencySettings.optionsPricing,
                            driverPerDayTnd: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Siège bébé (TND/jour)</label>
                    <input
                      type="number"
                      value={agencySettings.optionsPricing?.babySeatPerDayTnd || 15}
                      onChange={(e) =>
                        setAgencySettings({
                          ...agencySettings,
                          optionsPricing: {
                            ...agencySettings.optionsPricing,
                            babySeatPerDayTnd: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les paramètres</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: REPORTS & AUDIT */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-[#131722] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white">Exportation Complète des Réservations</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-lg">
                  Téléchargez la base de données de toutes les réservations au format CSV avec références, montants, coordonnées clients et historique d'état.
                </p>
              </div>
              <button
                onClick={handleExportCsv}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le fichier CSV</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: VIEW / MANAGE SINGLE BOOKING */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#131722] border border-white/10 p-6 space-y-6 text-xs text-gray-200 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Détails de la réservation</span>
                <h3 className="text-xl font-mono font-bold text-[#d4af37]">{viewingBooking.referenceCode}</h3>
              </div>
              <button onClick={() => setViewingBooking(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0b0d11] space-y-2">
                <p className="font-bold text-white">Client</p>
                <p>Nom : {viewingBooking.customerName}</p>
                <p>Email : {viewingBooking.customerEmail}</p>
                <p>Téléphone : {viewingBooking.customerPhone}</p>
                {viewingBooking.customerFlightNumber && (
                  <p>Vol d'arrivée : {viewingBooking.customerFlightNumber}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#0b0d11] space-y-2">
                <p className="font-bold text-white">Véhicule & Tarif</p>
                <p>Modèle : {viewingBooking.vehicleSnapshot?.brand} {viewingBooking.vehicleSnapshot?.model}</p>
                <p>Durée : {viewingBooking.rentalDays} jours</p>
                <p className="text-sm font-bold text-[#d4af37]">Total : {formatPrice(viewingBooking.totalPriceTnd)}</p>
                <p className="text-[11px] text-gray-400">Caution : {viewingBooking.depositAmountSnapshot} TND</p>
              </div>
            </div>

            {/* Status change actions */}
            <div className="space-y-3 pt-2">
              <label className="block text-gray-400 font-semibold">Changer le statut de la réservation :</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'confirmed')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'active')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Marquer comme Prise en charge (En cours)
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'completed')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Marquer comme Restituée (Terminée)
                </button>
                <button
                  onClick={() => handleUpdateBookingStatus(viewingBooking._id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Rejeter / Annuler
                </button>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="block text-gray-400 font-semibold">Ajouter une note interne / commentaire :</label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Ex: Client a appelé pour confirmer l'arrivée à 11h..."
                className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT VEHICLE */}
      {isAddVehicleOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#131722] border border-white/10 p-6 space-y-6 text-xs text-gray-200 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingVehicle._id?.startsWith('new_') ? 'Ajouter un nouveau véhicule' : 'Modifier le véhicule'}
              </h3>
              <button onClick={() => setIsAddVehicleOpen(false)} className="p-2 rounded-lg bg-white/5">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Marque</label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.brand}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Modèle</label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={editingVehicle.category}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  >
                    <option value="SUV & 4x4">SUV & 4x4</option>
                    <option value="Berline Premium">Berline Premium</option>
                    <option value="Luxe & Prestige">Luxe & Prestige</option>
                    <option value="Économique">Économique</option>
                    <option value="Compacte">Compacte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Tarif journalier (TND)</label>
                  <input
                    type="number"
                    required
                    value={editingVehicle.dailyRateTnd}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, dailyRateTnd: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Transmission</label>
                  <select
                    value={editingVehicle.transmission}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, transmission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  >
                    <option value="Automatique">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Carburant</label>
                  <select
                    value={editingVehicle.fuelType}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, fuelType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  >
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Électrique">Électrique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Statut</label>
                  <select
                    value={editingVehicle.status}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  >
                    <option value="available">Disponible</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Réservé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Montant Caution (TND)</label>
                  <input
                    type="number"
                    value={editingVehicle.depositAmountTnd || 1000}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, depositAmountTnd: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">URL Image Principale</label>
                <input
                  type="text"
                  value={editingVehicle.images?.[0] || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, images: [e.target.value] })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingVehicle.description || ''}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#0b0d11] border border-white/10 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#d4af37] text-black font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
