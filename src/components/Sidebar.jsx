import React from 'react';
import { useApp } from '../context/AppContext';
import {
  IconOverview,
  IconUsers,
  IconPayment,
  IconRoom,
  IconLightning,
  IconReport,
  IconSettings,
  IconShield,
  IconStar,
  IconGladiolLogo,
  IconX,
  IconPhone,
  IconWhatsApp
} from './Icons';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  const handleNavClick = (tabKey) => {
    setActiveTab(tabKey);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Subtle Botanical Leaf Silhouette Background Pattern */}
        <div className="sidebar-leaf-watermark" aria-hidden="true"></div>

        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-group">
            <IconGladiolLogo size={34} />
            <div className="brand-text-container">
              <span className="brand-title">GLADIOL</span>
              <span className="brand-subtitle">KOS EKSKLUSIF • TAMAN SEJUK</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup Menu"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {/* Main Items for Admin / Owner / Operator */}
          {currentUser.role !== 'anak_kos' ? (
            <>
              <button
                type="button"
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleNavClick('overview')}
              >
                <IconOverview size={19} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'penyewa' ? 'active' : ''}`}
                onClick={() => handleNavClick('penyewa')}
              >
                <IconUsers size={19} />
                <span>Penyewa</span>
                {currentUser.role === 'owner' && (
                  <span className="nav-badge-pill">Read Only</span>
                )}
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'pembayaran' ? 'active' : ''}`}
                onClick={() => handleNavClick('pembayaran')}
              >
                <IconPayment size={19} />
                <span>Pembayaran</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'kamar' ? 'active' : ''}`}
                onClick={() => handleNavClick('kamar')}
              >
                <IconRoom size={19} />
                <span>Kamar</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'utilitas' ? 'active' : ''}`}
                onClick={() => handleNavClick('utilitas')}
              >
                <IconLightning size={19} />
                <span>Utilitas</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'petugas' ? 'active' : ''}`}
                onClick={() => handleNavClick('petugas')}
              >
                <IconStar size={19} />
                <span>Petugas & Rating</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'laporan' ? 'active' : ''}`}
                onClick={() => handleNavClick('laporan')}
              >
                <IconReport size={19} />
                <span>Laporan</span>
              </button>

              {currentUser.role === 'super_admin' && (
                <button
                  type="button"
                  className={`nav-item ${activeTab === 'superadmin' ? 'active' : ''}`}
                  onClick={() => handleNavClick('superadmin')}
                >
                  <IconShield size={19} />
                  <span>Super Admin Log</span>
                </button>
              )}

              <button
                type="button"
                className={`nav-item ${activeTab === 'pengaturan' ? 'active' : ''}`}
                onClick={() => handleNavClick('pengaturan')}
              >
                <IconSettings size={19} />
                <span>Pengaturan</span>
              </button>
            </>
          ) : (
            /* Anak Kos Special Navigation */
            <>
              <button
                type="button"
                className={`nav-item ${activeTab === 'anak_kos' ? 'active' : ''}`}
                onClick={() => handleNavClick('anak_kos')}
              >
                <IconOverview size={19} />
                <span>Portal Anak Kos</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'pembayaran' ? 'active' : ''}`}
                onClick={() => handleNavClick('pembayaran')}
              >
                <IconPayment size={19} />
                <span>Konfirmasi Bayar</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'petugas' ? 'active' : ''}`}
                onClick={() => handleNavClick('petugas')}
              >
                <IconStar size={19} />
                <span>Rating Petugas</span>
              </button>

              <button
                type="button"
                className={`nav-item ${activeTab === 'kamar' ? 'active' : ''}`}
                onClick={() => handleNavClick('kamar')}
              >
                <IconRoom size={19} />
                <span>Fasilitas Kos</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Help Widget - Exactly as in screenshot */}
        <div className="sidebar-help-card">
          <div className="help-potted-plants">
            🌱 🪴
          </div>
          <h4 className="help-card-title">Butuh Bantuan?</h4>
          <p className="help-card-desc">Pusat Bantuan 24/7</p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Gladiola%20Guest%20House,%20saya%20butuh%20bantuan%20operasional%20kos"
            target="_blank"
            rel="noopener noreferrer"
            className="help-card-btn"
          >
            Hubungi Kami
          </a>
        </div>
      </aside>
    </>
  );
};
