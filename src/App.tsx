import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CrystalAssistant } from './components/chat/CrystalAssistant.tsx';
import { BookingModal } from './components/booking/BookingModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { FleetPage } from './pages/FleetPage.tsx';
import { CarDetailPage } from './pages/CarDetailPage.tsx';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { Vehicle } from './types/index.ts';

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<Vehicle | null>(null);
  const [prefilledDatesForModal, setPrefilledDatesForModal] = useState<any>(null);

  const handleOpenBooking = (vehicle?: Vehicle, prefill?: any) => {
    setSelectedVehicleForModal(vehicle || null);
    setPrefilledDatesForModal(prefill || null);
    setIsBookingModalOpen(true);
  };

  const handleSelectCarFromChat = async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/v1/cars/${vehicleId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedVehicleForModal(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsBookingModalOpen(true);
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#0b0d11] text-[#f3f4f6]">
            {/* Global Navbar */}
            <Navbar onOpenBookingModal={() => handleOpenBooking()} />

            {/* Main Application Routes */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage onOpenBookingModal={handleOpenBooking} />} />
                <Route path="/cars" element={<FleetPage onOpenBookingModal={handleOpenBooking} />} />
                <Route path="/cars/:id" element={<CarDetailPage onOpenBookingModal={handleOpenBooking} />} />
                <Route path="/dashboard" element={<CustomerDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Crystal Assistant AI Widget floating across public website */}
            <CrystalAssistant onSelectVehicleForBooking={handleSelectCarFromChat} />

            {/* Global multi-step Booking Modal */}
            <BookingModal
              isOpen={isBookingModalOpen}
              onClose={() => {
                setIsBookingModalOpen(false);
                setSelectedVehicleForModal(null);
                setPrefilledDatesForModal(null);
              }}
              selectedVehicle={selectedVehicleForModal}
              initialDates={prefilledDatesForModal}
            />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
