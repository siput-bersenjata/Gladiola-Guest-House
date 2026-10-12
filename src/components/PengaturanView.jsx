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
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  const canEdit = currentUser.role === 'operator' || currentUser.role === 'super_admin';

  const handleTestFirebase = async () => {
    if (!firebaseForm.databaseURL) {
      addToast('Masukkan URL Database Firebase terlebih dahulu!', 'warning');
      return;
    }
    setIsTestingFirebase(true);
    setFirebaseTestFeedback(null);
    try {
      const res = await testFirebaseConnection(firebaseForm);
      setFirebaseTestFeedback(res);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'error');
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
    await handleUpdateFirebaseConfig(
      firebaseForm.databaseURL.trim() ? firebaseForm : null
    );
  };

  const handleResetFirebase = async () => {
    if (!canEdit) return;
    setFirebaseForm({ databaseURL: '', apiKey: '', projectId: '' });
    setFirebaseTestFeedback(null);
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
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>URL Firebase Realtime Database</span>
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Gratis (Spark Plan)</span>
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://gladiola-kos-default-rtdb.firebaseio.com"
                value={firebaseForm.databaseURL}
                onChange={(e) => setFirebaseForm({ ...firebaseForm, databaseURL: e.target.value })}
                disabled={!canEdit}
              />
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                Dapatkan gratis dari Firebase Console &gt; Realtime Database (akhiran <code>.firebaseio.com</code>).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Project ID Firebase (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="gladiola-guest-house"
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
                  border: `1px solid ${firebaseTestFeedback.success ? '#bbf7d0' : '#fecaca'}`
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
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '14px 16px',
            backgroundColor: '#f8fafc',
            marginBottom: '16px'
          }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                <span>📖 Panduan: Cara Membuat Firebase Realtime Database Gratis (2 Menit)</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500 }}>
                {showFirebaseGuide ? 'Tutup Panduan ▲' : 'Buka Panduan ▼'}
              </span>
            </div>

            {showFirebaseGuide && (
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#475569', lineHeight: '1.6' }}>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    Buka <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>console.firebase.google.com</a> dan login dengan akun Google Anda.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    Klik <strong>"Tambahkan project"</strong> (Add Project) &gt; Beri nama <em>Gladiola Kos</em> &gt; Klik Lanjutkan.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    Di menu navigasi kiri, pilih <strong>Build &gt; Realtime Database</strong> &gt; Klik tombol <strong>Create Database</strong> (Pilih lokasi terdekat: <em>Singapore</em> atau <em>United States</em>).
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    Pada pilihan Security rules, pilih <strong>Start in test mode</strong> (agar izin baca/tulis aktif).
                  </li>
                  <li>
                    Salin <strong>URL Database</strong> yang muncul di bagian atas (berformat <code>https://nama-project-default-rtdb.firebaseio.com/</code>), lalu tempelkan ke kolom URL Firebase di atas dan klik <strong>Simpan & Terapkan</strong>.
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
