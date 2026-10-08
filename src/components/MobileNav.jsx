import React from 'react';
import { useApp } from '../context/AppContext';
import {
  IconOverview,
  IconUsers,
  IconPayment,
  IconRoom,
  IconStar,
  IconMenu
} from './Icons';

export const MobileNav = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsMobileMenuOpen
  } = useApp();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah Mobile">
      {currentUser.role !== 'anak_kos' ? (
        <>
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <IconOverview size={20} />
            <span className="mobile-nav-label">Overview</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'penyewa' ? 'active' : ''}`}
            onClick={() => setActiveTab('penyewa')}
          >
            <IconUsers size={20} />
            <span className="mobile-nav-label">Penyewa</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'pembayaran' ? 'active' : ''}`}
            onClick={() => setActiveTab('pembayaran')}
          >
            <IconPayment size={20} />
            <span className="mobile-nav-label">Bayar</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'kamar' ? 'active' : ''}`}
            onClick={() => setActiveTab('kamar')}
          >
            <IconRoom size={20} />
            <span className="mobile-nav-label">Kamar</span>
          </button>

          <button
            type="button"
            className="mobile-nav-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <IconMenu size={20} />
            <span className="mobile-nav-label">Menu</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'anak_kos' ? 'active' : ''}`}
            onClick={() => setActiveTab('anak_kos')}
          >
            <IconOverview size={20} />
            <span className="mobile-nav-label">Tagihan</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'pembayaran' ? 'active' : ''}`}
            onClick={() => setActiveTab('pembayaran')}
          >
            <IconPayment size={20} />
            <span className="mobile-nav-label">Konfirmasi</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'petugas' ? 'active' : ''}`}
            onClick={() => setActiveTab('petugas')}
          >
            <IconStar size={20} />
            <span className="mobile-nav-label">Rating</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'kamar' ? 'active' : ''}`}
            onClick={() => setActiveTab('kamar')}
          >
            <IconRoom size={20} />
            <span className="mobile-nav-label">Fasilitas</span>
          </button>

          <button
            type="button"
            className="mobile-nav-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <IconMenu size={20} />
            <span className="mobile-nav-label">Akun</span>
          </button>
        </>
      )}
    </nav>
  );
};
