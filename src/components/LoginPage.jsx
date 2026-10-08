import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconGladiolLogo,
  IconShield,
  IconPhone,
  IconLock,
  IconCheck,
  IconMapPin
} from './Icons';

export const LoginPage = () => {
  const { loginWithCredentials, loginByPhone } = useApp();

  // Tab: 'staff' (Super Admin, Pengelola, Pemilik) or 'tenant' (Anak Kos)
  const [activeTab, setActiveTab] = useState('staff');

  // Staff Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Tenant Form
  const [phone, setPhone] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [isSubmittingTenant, setIsSubmittingTenant] = useState(false);

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    setStaffError('');
    if (!username.trim() || !password.trim()) {
      setStaffError('Username dan kata sandi wajib diisi.');
      return;
    }

    setIsSubmittingStaff(true);
    const result = loginWithCredentials(username, password);
    if (!result.success) {
      setStaffError(result.message);
      setIsSubmittingStaff(false);
    }
  };

  const handleTenantSubmit = (e) => {
    e.preventDefault();
    setTenantError('');
    if (!phone.trim()) {
      setTenantError('Silakan masukkan nomor handphone Anda.');
      return;
    }

    setIsSubmittingTenant(true);
    const result = loginByPhone(phone);
    if (!result.success) {
      setTenantError(result.message);
      setIsSubmittingTenant(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Botanical Background Accents */}
      <div className="login-bg-overlay" aria-hidden="true"></div>

      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-circle">
            <IconGladiolLogo size={42} />
          </div>
          <h1 className="login-brand-title">GLADIOL</h1>
          <p className="login-brand-subtitle">KOS EKSKLUSIF • TAMAN SEJUK</p>
          <span className="login-tagline">Portal Akses & Monitoring Kos</span>
        </div>

        {/* Tab Selection: Manajemen vs Anak Kos */}
        <div className="login-tab-switcher">
          <button
            type="button"
            className={`login-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('staff');
              setStaffError('');
              setTenantError('');
            }}
          >
            <IconShield size={16} />
            <span>Manajemen & Pengelola</span>
          </button>

          <button
            type="button"
            className={`login-tab-btn ${activeTab === 'tenant' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tenant');
              setStaffError('');
              setTenantError('');
            }}
          >
            <IconPhone size={16} />
            <span>Penghuni (Anak Kos)</span>
          </button>
        </div>

        {/* Form 1: Staff / Admin / Owner / Pengelola */}
        {activeTab === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login-username" className="form-label">
                Username Akun
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                className="form-input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setStaffError('');
                }}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Kata Sandi (Password)
              </label>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="form-input"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setStaffError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {staffError && (
              <div className="login-error-alert" role="alert">
                <span>⚠️ {staffError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary-login"
              disabled={isSubmittingStaff}
            >
              <IconLock size={16} />
              <span>{isSubmittingStaff ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>
        )}

        {/* Form 2: Anak Kos (HANYA MENGGUNAKAN NOMOR HP) */}
        {activeTab === 'tenant' && (
          <form onSubmit={handleTenantSubmit} className="login-form">
            <div className="tenant-login-intro">
              <p>
                Khusus anak kos Gladiola, Anda dapat langsung masuk hanya menggunakan nomor handphone (WhatsApp) yang telah didaftarkan pada data sewa kos.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="login-tenant-phone" className="form-label">
                Nomor Handphone Terdaftar
              </label>
              <div className="input-with-prefix">
                <span className="phone-prefix">+62 / 08</span>
                <input
                  id="login-tenant-phone"
                  type="tel"
                  autoComplete="tel"
                  className="form-input-phone"
                  placeholder="Contoh: 081233445566"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setTenantError('');
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {tenantError && (
              <div className="login-error-alert" role="alert">
                <span>⚠️ {tenantError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary-login"
              disabled={isSubmittingTenant}
            >
              <IconCheck size={16} />
              <span>{isSubmittingTenant ? 'Memeriksa Data...' : 'Masuk sebagai Penghuni'}</span>
            </button>
          </form>
        )}

        {/* Security & Location Note */}
        <div className="login-footer-security">
          <div className="security-note-row">
            <IconMapPin size={14} className="text-forest-gold" />
            <span>Gladiola Guest House • Jl. Gladiol No. 1, Malang</span>
          </div>
          <p className="security-subnote">
            Sistem terlindungi enkripsi dan pemantauan verifikasi lokasi GPS otomatis.
          </p>
        </div>
      </div>
    </div>
  );
};
