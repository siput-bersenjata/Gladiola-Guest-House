import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconSearch,
  IconBell,
  IconMenu,
  IconMapPin,
  IconShield,
  IconCheck,
  IconLogOut,
  IconRadar,
  IconKey
} from './Icons';

export const Header = () => {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userLocation,
    setIsLocationEnforcedModalOpen,
    notifications,
    activityLogs,
    tenants
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantPhone, setSelectedTenantPhone] = useState('081233445566');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title and subtitle mapping
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Dashboard',
          subtitle: 'Selamat datang kembali — pantau operasional kos taman Anda'
        };
      case 'penyewa':
        return {
          title: 'Data Penyewa',
          subtitle: 'Kelola data penghuni kos, masa sewa, dan kontak darurat'
        };
      case 'pembayaran':
        return {
          title: 'Pembayaran Kos',
          subtitle: 'Validasi bukti pembayaran sewa & rincian transfer bank'
        };
      case 'kamar':
        return {
          title: 'Penyewaan Kamar',
          subtitle: 'Status 50 kamar kos Gladiola: Terisi, Booking, dan Kosong'
        };
      case 'utilitas':
        return {
          title: 'Utilitas & Listrik',
          subtitle: 'Pencatatan meteran listrik bulanan per kamar & tarif per kWh'
        };
      case 'petugas':
        return {
          title: 'Petugas & Rating',
          subtitle: 'Daftar staf operasional, kontak WhatsApp, dan ulasan wajib penghuni'
        };
      case 'laporan':
        return {
          title: 'Laporan Keuangan',
          subtitle: 'Ringkasan penerimaan sewa kos dan penagihan listrik bulanan'
        };
      case 'superadmin':
        return {
          title: 'Super Admin Control',
          subtitle: 'Audit log aktivitas pengguna lengkap dengan koordinat GPS'
        };
      case 'monitoring_lokasi':
        return {
          title: 'Monitoring Lokasi & Perangkat',
          subtitle: 'Radar real-time pengguna aktif dan telemetri perangkat'
        };
      case 'kelola_akun':
        return {
          title: 'Kelola Akun Sistem',
          subtitle: 'Kontrol hak akses Super Admin, Pengelola / Operator, dan Owner'
        };
      case 'anak_kos':
        return {
          title: `Portal Penghuni — ${currentUser.name}`,
          subtitle: `Kamar ${currentUser.roomNumber || '102'} • Fasilitas & Tagihan Anda`
        };
      case 'pengaturan':
        return {
          title: 'Pengaturan Sistem',
          subtitle: 'Nomor rekening pembayaran, konfigurasi Wi-Fi, dan informasi kos'
        };
      default:
        return {
          title: 'Gladiol Guest House',
          subtitle: 'Kos Eksklusif Taman Sejuk'
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  // Role display label
  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'owner':
        return 'Owner Kos';
      case 'operator':
        return 'Admin Taman';
      case 'anak_kos':
        return `Anak Kos (${currentUser.roomNumber || '102'})`;
      default:
        return 'User';
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {/* Mobile menu hamburger */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Buka Menu"
        >
          <IconMenu size={22} />
        </button>

        <div className="header-titles">
          <h1 className="header-main-title">{title}</h1>
          <p className="header-sub-title">{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Location Status Chip (Clickable to view/enforce) */}
        <button
          type="button"
          className="header-gps-chip"
          onClick={() => setIsLocationEnforcedModalOpen(true)}
          title="Status Pemantauan Lokasi"
        >
          <span className="gps-live-dot"></span>
          <IconMapPin size={14} className="text-forest-gold" />
          <span className="gps-chip-text">
            {userLocation.status === 'granted'
              ? `${userLocation.distanceKm !== null ? `${userLocation.distanceKm} km` : 'GPS Aktif'}`
              : 'Verifikasi GPS'}
          </span>
        </button>

        {/* Super Admin Quick Radar Shortcut */}
        {currentUser && currentUser.role === 'super_admin' && (
          <button
            type="button"
            className={`header-radar-shortcut ${activeTab === 'monitoring_lokasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring_lokasi')}
            title="Buka Dashboard Monitoring Lokasi & Perangkat"
          >
            <IconRadar size={15} />
            <span className="shortcut-label">Monitoring Live</span>
          </button>
        )}

        {/* Search input (Hidden on very narrow mobile screens) */}
        <div className="header-search-box">
          <IconSearch size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari kamar, penyewa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Notifications */}
        <div className="header-notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="notif-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifikasi"
          >
            <IconBell size={20} />
            <span className="notif-indicator"></span>
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown-card">
              <div className="notif-dropdown-header">
                <span className="font-semibold text-gray-800">Notifikasi Terbaru</span>
                <span className="text-xs text-primary-green font-medium">Gladiola Live</span>
              </div>
              <div className="notif-list">
                {activityLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="notif-item">
                    <div className="notif-dot"></div>
                    <div className="notif-content">
                      <p className="notif-action">{log.action}</p>
                      <p className="notif-user">{log.user} • {log.locationName}</p>
                      <span className="notif-time">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Role Switcher */}
        <div className="profile-pill-wrapper" ref={profileRef}>
          <button
            type="button"
            className="profile-pill-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <span className="profile-name">{currentUser.name}</span>
            <span className="profile-role-tag">{getRoleLabel()}</span>
            <span className="profile-caret">▾</span>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar Pengguna"
              className="profile-avatar-img"
            />
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <p className="dropdown-user-name">{currentUser.name}</p>
                <p className="dropdown-user-role">Role: <strong>{getRoleLabel()}</strong></p>
                {currentUser.roomNumber && (
                  <p className="dropdown-user-room">Penghuni Kamar {currentUser.roomNumber}</p>
                )}
                {currentUser.phone && (
                  <p className="dropdown-user-phone text-xs text-gray-500 mt-1">No. HP: {currentUser.phone}</p>
                )}
              </div>

              <div className="profile-dropdown-info">
                <div className="dropdown-location-status">
                  <span className="gps-live-dot"></span>
                  <span className="text-xs text-gray-600">
                    {userLocation.status === 'granted'
                      ? `Terverifikasi GPS (${userLocation.distanceKm !== null ? `${userLocation.distanceKm} km dari kos` : 'Aktif'})`
                      : 'Menunggu Izin Lokasi'}
                  </span>
                </div>
              </div>

              <div className="profile-dropdown-footer">
                <button
                  type="button"
                  className="dropdown-logout-btn"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                >
                  <IconLogOut size={16} />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
