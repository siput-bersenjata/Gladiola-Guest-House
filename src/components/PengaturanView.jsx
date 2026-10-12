import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconSettings,
  IconPayment,
  IconWifi,
  IconMapPin,
  IconCheck,
  IconExternalLink,
  IconCloud,
  IconRefresh
} from './Icons';
import { GLADIOLA_COORDS } from '../data/initialData';
import { sanitizeFirebaseConfig } from '../services/firebaseSync';

export const PengaturanView = () => {
  const {
    bankInfo,
    setBankInfo,
    wifiInfo,
    setWifiInfo,
    currentUser,
    addToast,
    logActivity,
    cloudSyncStatus,
    lastSyncedTime,
    isCloudSyncing,
    cloudBinId,
    setCloudBinId,
    syncWithCloud,
    forcePushLocalToCloud,
    firebaseConfig,
    firebaseConnected,
    handleUpdateFirebaseConfig,
    testFirebaseConnection
  } = useApp();

  const [bankFormData, setBankFormData] = useState({ ...bankInfo });
  const [wifiFormData, setWifiFormData] = useState({ ...wifiInfo });
  const [customBinId, setCustomBinId] = useState(cloudBinId);

  // Firebase Realtime Database Form State
  const [firebaseForm, setFirebaseForm] = useState({
    databaseURL: firebaseConfig?.databaseURL || '',
    apiKey: firebaseConfig?.apiKey || '',
    projectId: firebaseConfig?.projectId || ''
  });
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestFeedback, setFirebaseTestFeedback] = useState(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(true);
  const [detectedAutoFix, setDetectedAutoFix] = useState(false);

  const canEdit = currentUser.role === 'operator' || currentUser.role === 'super_admin';

  const handleDatabaseUrlChange = (val) => {
    setFirebaseTestFeedback(null);
    if (val.includes('console.firebase.google.com')) {
      const sanitized = sanitizeFirebaseConfig({ databaseURL: val, projectId: firebaseForm.projectId });
      if (sanitized) {
        setFirebaseForm({
          ...firebaseForm,
          databaseURL: sanitized.databaseURL,
          projectId: sanitized.projectId
        });
        setDetectedAutoFix(true);
        addToast(`URL Console otomatis diubah ke URL Realtime Database: ${sanitized.databaseURL}`, 'info');
        return;
      }
    }
    setDetectedAutoFix(false);
    setFirebaseForm({ ...firebaseForm, databaseURL: val });
  };

  const handleTestFirebase = async () => {
    if (!firebaseForm.databaseURL) {
      addToast('Masukkan URL Database Firebase terlebih dahulu!', 'warning');
      return;
    }
    setIsTestingFirebase(true);
    setFirebaseTestFeedback(null);
    try {
      const sanitized = sanitizeFirebaseConfig(firebaseForm);
      if (sanitized.databaseURL !== firebaseForm.databaseURL) {
        setFirebaseForm(sanitized);
      }
      const res = await testFirebaseConnection(sanitized);
      setFirebaseTestFeedback(res);
      if (res.success) {
        if (res.databaseURL && res.databaseURL !== sanitized.databaseURL) {
          setFirebaseForm((prev) => ({ ...prev, databaseURL: res.databaseURL }));
        }
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'warning');
      }
    } catch (e) {
      setFirebaseTestFeedback({ success: false, message: e.message });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSaveFirebase = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const sanitized = sanitizeFirebaseConfig(firebaseForm);
    if (sanitized && sanitized.databaseURL) {
      setFirebaseForm(sanitized);
      await handleUpdateFirebaseConfig(sanitized);
    } else {
      await handleUpdateFirebaseConfig(null);
    }
  };

  const handleResetFirebase = async () => {
    if (!canEdit) return;
    setFirebaseForm({ databaseURL: '', apiKey: '', projectId: '' });
    setFirebaseTestFeedback(null);
    setDetectedAutoFix(false);
    await handleUpdateFirebaseConfig(null);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    setBankInfo(bankFormData);
    logActivity('Perbarui Rekening Bank Kos', `No rek diubah: ${bankFormData.bankName} ${bankFormData.accountNumber}`);
    addToast('Informasi nomor rekening berhasil diperbarui!', 'success');
  };

  const handleSaveWifi = (e) => {
    e.preventDefault();
    setWifiInfo(wifiFormData);
    logActivity('Perbarui Wi-Fi Kos', `SSID: ${wifiFormData.ssid}`);
    addToast('Konfigurasi Wi-Fi Gladiola berhasil diperbarui!', 'success');
  };

  return (
    <div className="pengaturan-container">
      <div className="pengaturan-grid">
        {/* Card 1: Pengaturan Rekening Pembayaran */}
        <div className="dashboard-card">
          <div className="chart-card-header">
            <div className="icon-badge-box bg-warm-tint">
              <IconPayment size={22} className="text-warm-gold" />
            </div>
            <div>
              <h3 className="card-headline">Nomor Rekening Pembayaran</h3>
              <p className="card-subheadline">
                Rekening tujuan transfer yang ditampilkan kepada seluruh anak kos
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBank} className="modal-form-grid mt-4">
            <div className="form-group full-width">
              <label className="form-label">Nama Bank</label>
              <input
                type="text"
                className="form-input"
                value={bankFormData.bankName}
                onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Nomor Rekening</label>
              <input
                type="text"
                className="form-input"
                value={bankFormData.accountNumber}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, accountNumber: e.target.value })
                }
                disabled={!canEdit}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Nama Pemilik Rekening (Atas Nama)</label>
              <input
                type="text"
                className="form-input"
                value={bankFormData.accountHolder}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, accountHolder: e.target.value })
                }
                disabled={!canEdit}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Catatan Transfer Penghuni</label>
              <textarea
                rows="2"
                className="form-textarea"
                value={bankFormData.paymentNotes}
                onChange={(e) =>
                  setBankFormData({ ...bankFormData, paymentNotes: e.target.value })
                }
                disabled={!canEdit}
              ></textarea>
            </div>

            {canEdit && (
              <div className="modal-actions-row full-width">
                <button type="submit" className="btn-primary">
                  <IconCheck size={16} />
                  <span>Simpan Rekening</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Card 2: Pengaturan Wi-Fi Gladiola */}
        <div className="dashboard-card">
          <div className="chart-card-header">
            <div className="icon-badge-box bg-green-tint">
              <IconWifi size={22} className="text-primary-green" />
            </div>
            <div>
              <h3 className="card-headline">Konfigurasi Wi-Fi Kos</h3>
              <p className="card-subheadline">
                Nama SSID dan password yang otomatis tampil di portal anak kos bulan ini
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveWifi} className="modal-form-grid mt-4">
            <div className="form-group full-width">
              <label className="form-label">Nama Wi-Fi (SSID)</label>
              <input
                type="text"
                className="form-input"
                value={wifiFormData.ssid}
                onChange={(e) => setWifiFormData({ ...wifiFormData, ssid: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Password Wi-Fi</label>
              <input
                type="text"
                className="form-input"
                value={wifiFormData.password}
                onChange={(e) => setWifiFormData({ ...wifiFormData, password: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Kecepatan Internet</label>
              <input
                type="text"
                className="form-input"
                value={wifiFormData.speed}
                onChange={(e) => setWifiFormData({ ...wifiFormData, speed: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            {canEdit && (
              <div className="modal-actions-row full-width">
                <button type="submit" className="btn-primary">
                  <IconCheck size={16} />
                  <span>Simpan Wi-Fi</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Card 3: Data Lokasi & Google Maps Gladiola */}
      <div className="dashboard-card mt-6">
        <div className="chart-card-header">
          <div className="icon-badge-box bg-green-tint">
            <IconMapPin size={22} className="text-primary-green" />
          </div>
          <div>
            <h3 className="card-headline">Informasi Lokasi Resmi Google Maps</h3>
            <p className="card-subheadline">
              Koordinat pemantauan geofence GPS Gladiola Guest House
            </p>
          </div>
        </div>

        <div className="location-settings-box">
          <p className="text-gray-800 font-medium">
            <strong>Alamat:</strong> {GLADIOLA_COORDS.address}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <strong>Koordinat:</strong> Latitude: {GLADIOLA_COORDS.lat} | Longitude: {GLADIOLA_COORDS.lng}
          </p>
          <div className="mt-4">
            <a
              href={GLADIOLA_COORDS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-sm"
            >
              <span>Buka Tautan Google Maps Gladiola</span>
              <IconExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Card 4: Database Google Firebase (Sinkronisasi Realtime Antar Perangkat) */}
      <div className="dashboard-card mt-6">
        <div className="chart-card-header">
          <div className="icon-badge-box bg-blue-tint">
            <IconCloud size={22} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="card-headline">Database Cloud & Google Firebase (Sinkronisasi Realtime)</h3>
            <p className="card-subheadline">
              Hubungkan ke Google Firebase Realtime Database (100% Gratis) agar setiap perubahan data anak kos langsung ter-update di semua HP & laptop secara instan
            </p>
          </div>
        </div>

        <div className="location-settings-box">
          {/* Status Bar */}
          <div className="cloud-sync-status-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>Status Sinkronisasi:</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.82rem',
              backgroundColor: firebaseConnected
                ? '#dcfce7'
                : cloudSyncStatus === 'offline'
                ? '#fee2e2'
                : '#e0f2fe',
              color: firebaseConnected
                ? '#15803d'
                : cloudSyncStatus === 'offline'
                ? '#b91c1c'
                : '#0369a1'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: firebaseConnected
                  ? '#22c55e'
                  : cloudSyncStatus === 'offline'
                  ? '#ef4444'
                  : '#0ea5e9'
              }}></span>
              {isCloudSyncing
                ? 'Menyinkronkan...'
                : firebaseConnected
                ? '🔥 Firebase Realtime Live'
                : cloudSyncStatus === 'offline'
                ? 'Offline / Terputus'
                : 'Cloud Cadangan Aktif'}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              • Terakhir diperbarui: <strong>{lastSyncedTime}</strong>
            </span>
          </div>

          {/* Form Konfigurasi Firebase */}
          <form onSubmit={handleSaveFirebase} className="modal-form-grid" style={{ marginBottom: '18px' }}>
            <div className="form-group full-width">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>URL Firebase Realtime Database</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Gratis (Spark Plan)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="https://gladiola-1d671-default-rtdb.firebaseio.com"
                value={firebaseForm.databaseURL}
                onChange={(e) => handleDatabaseUrlChange(e.target.value)}
                disabled={!canEdit}
              />

              {/* Fast Presets for gladiola-1d671 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFirebaseForm({
                      databaseURL: 'https://gladiola-1d671-default-rtdb.firebaseio.com',
                      projectId: 'gladiola-1d671',
                      apiKey: firebaseForm.apiKey
                    });
                    setDetectedAutoFix(false);
                    setFirebaseTestFeedback(null);
                    addToast('URL disetel ke: gladiola-1d671 (US)', 'info');
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  ⚡ gladiola-1d671 (United States)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFirebaseForm({
                      databaseURL: 'https://gladiola-1d671-default-rtdb.asia-southeast1.firebasedatabase.app',
                      projectId: 'gladiola-1d671',
                      apiKey: firebaseForm.apiKey
                    });
                    setDetectedAutoFix(false);
                    setFirebaseTestFeedback(null);
                    addToast('URL disetel ke: gladiola-1d671 (Singapore)', 'info');
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  ⚡ gladiola-1d671 (Singapore)
                </button>
              </div>

              {detectedAutoFix && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af'
                }}>
                  ✨ <strong>URL Diperbaiki Otomatis:</strong> Link Firebase Console Anda telah diubah ke format database <code>{firebaseForm.databaseURL}</code>. Pastikan Anda sudah mengklik <em>Create Database</em> di Firebase Console.
                </div>
              )}

              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                Format benar berakhiran <code>.firebaseio.com</code> atau <code>.asia-southeast1.firebasedatabase.app</code> (bukan link website console).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Project ID Firebase (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="gladiola-1d671"
                value={firebaseForm.projectId}
                onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Key Web (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="AIzaSy..."
                value={firebaseForm.apiKey}
                onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            {firebaseTestFeedback && (
              <div
                className="full-width"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  backgroundColor: firebaseTestFeedback.success ? '#f0fdf4' : '#fef2f2',
                  color: firebaseTestFeedback.success ? '#166534' : '#991b1b',
                  border: `1px solid ${firebaseTestFeedback.success ? '#bbf7d0' : '#fecaca'}`,
                  lineHeight: '1.5'
                }}
              >
                {firebaseTestFeedback.success ? '✓ ' : '✕ '} {firebaseTestFeedback.message}
              </div>
            )}

            {canEdit && (
              <div className="modal-actions-row full-width" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTestFirebase}
                  disabled={isTestingFirebase}
                >
                  <IconRefresh size={14} className={isTestingFirebase ? 'spin-animate' : ''} />
                  <span>{isTestingFirebase ? 'Menguji...' : 'Tes Koneksi Firebase'}</span>
                </button>

                <button type="submit" className="btn-primary">
                  <IconCheck size={16} />
                  <span>Simpan & Terapkan Firebase</span>
                </button>

                {firebaseConfig?.databaseURL && (
                  <button
                    type="button"
                    className="btn-outline-danger"
                    onClick={handleResetFirebase}
                    style={{ marginLeft: 'auto' }}
                  >
                    Reset ke Default
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Tutorial / Petunjuk Cara Buat Firebase Gratis */}
          <div style={{
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#f0f9ff',
            marginBottom: '16px'
          }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0369a1', fontSize: '0.88rem' }}>
                <span>📖 Panduan: Cara Mengaktifkan Realtime Database di gladiola-1d671</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                {showFirebaseGuide ? 'Tutup Panduan ▲' : 'Buka Panduan ▼'}
              </span>
            </div>

            {showFirebaseGuide && (
              <div style={{ marginTop: '12px', fontSize: '0.84rem', color: '#334155', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#0f172a' }}>
                  Langkah mengaktifkan Realtime Database di project Firebase Anda:
                </p>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '8px' }}>
                    Buka langsung halaman Realtime Database project Anda:{' '}
                    <a
                      href="https://console.firebase.google.com/u/0/project/gladiola-1d671/database"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Buka Realtime Database gladiola-1d671 ↗
                    </a>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Klik tombol biru <strong>"Create Database"</strong> (Buat Database).
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Pilih lokasi database (misal: <em>United States</em> atau <em>Singapore</em>), lalu klik <strong>Next</strong>.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Pada opsi Security Rules, pilih <strong>"Start in test mode"</strong> (agar akses baca & tulis langsung aktif tanpa login), lalu klik <strong>Enable</strong> (Aktifkan).
                  </li>
                  <li>
                    Kembali ke halaman ini, klik tombol <strong>"⚡ gladiola-1d671"</strong> di atas, lalu klik <strong>"Simpan & Terapkan Firebase"</strong>. Selesai! Data langsung tersinkronisasi realtime ke semua HP & laptop.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Quick Sync Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={syncWithCloud}
              disabled={isCloudSyncing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <IconRefresh size={16} className={isCloudSyncing ? 'spin-animate' : ''} />
              <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={forcePushLocalToCloud}
              disabled={isCloudSyncing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <IconCloud size={16} />
              <span>Kirim Seluruh Data Lokal ke Cloud</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
