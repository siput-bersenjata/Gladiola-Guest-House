import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { LocationEnforcerModal } from './components/LocationEnforcerModal';
import { OverviewView } from './components/OverviewView';
import { PenyewaView } from './components/PenyewaView';
import { PembayaranView } from './components/PembayaranView';
import { KamarView } from './components/KamarView';
import { UtilitasView } from './components/UtilitasView';
import { PetugasView } from './components/PetugasView';
import { LaporanView } from './components/LaporanView';
import { SuperAdminView } from './components/SuperAdminView';
import { AnakKosPortal } from './components/AnakKosPortal';
import { PengaturanView } from './components/PengaturanView';

const MainLayout = () => {
  const { activeTab, currentUser, notifications } = useApp();

  // If user is not logged in, enforce mandatory login wall
  if (!currentUser) {
    return (
      <div className="login-root-container">
        <LocationEnforcerModal />
        <LoginPage />
        <div className="toast-container" aria-live="polite">
          {notifications.map((toast) => (
            <div key={toast.id} className={`toast-pill ${toast.type}`}>
              <span className="toast-dot"></span>
              <span className="toast-text">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    // If user is currently in anak_kos tab or role
    if (activeTab === 'anak_kos' || (currentUser.role === 'anak_kos' && activeTab === 'overview')) {
      return <AnakKosPortal />;
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'penyewa':
        return <PenyewaView />;
      case 'pembayaran':
        return <PembayaranView />;
      case 'kamar':
        return <KamarView />;
      case 'utilitas':
        return <UtilitasView />;
      case 'petugas':
        return <PetugasView />;
      case 'laporan':
        return <LaporanView />;
      case 'superadmin':
        return <SuperAdminView />;
      case 'pengaturan':
        return <PengaturanView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="app-shell">
      {/* Mandatory Location Tracker Modal */}
      <LocationEnforcerModal />

      {/* Botanical Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-viewport">
        <Header />

        <main className="content-container">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav />

      {/* Floating Toast Notifications */}
      <div className="toast-container" aria-live="polite">
        {notifications.map((toast) => (
          <div key={toast.id} className={`toast-pill ${toast.type}`}>
            <span className="toast-dot"></span>
            <span className="toast-text">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
