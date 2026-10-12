import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
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
    syncWithCloud,
    forcePushLocalToCloud,
    firebaseConnected
  } = useApp();

  const [bankFormData, setBankFormData] = useState({ ...bankInfo });
  const [wifiFormData, setWifiFormData] = useState({ ...wifiInfo });

  const canEdit = currentUser.role === 'operator' || currentUser.role === 'super_admin';

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

      {/* Card 4: Database Realtime & Cloud Gladiola (Permanen Terkunci) */}
      <div className="dashboard-card mt-6">
        <div className="chart-card-header">
          <div className="icon-badge-box bg-blue-tint">
            <IconCloud size={22} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="card-headline">Database Cloud & Sinkronisasi Realtime (Permanen)</h3>
            <p className="card-subheadline">
              Database terkunci permanen pada project <strong>gladiola-1d671</strong>. Sinkronisasi data antar seluruh perangkat (HP, laptop, tablet) berjalan otomatis dan realtime tanpa perlu pengaturan manual.
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
                : '⚡ Cloud Realtime Otomatis Aktif'}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              • Terakhir diperbarui: <strong>{lastSyncedTime}</strong>
            </span>
          </div>

          {/* Three Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Database Terkunci</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>gladiola-1d671</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '2px', fontWeight: 500 }}>✓ Permanen Terhubung</div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Multi-Perangkat</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>Semua HP & Laptop</div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '2px', fontWeight: 500 }}>✓ Sinkron Otomatis Tanpa Setting</div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cakupan Data</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>Penyewa, Kamar & Tagihan</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>✓ Instan saat disimpan</div>
            </div>
          </div>

          {!firebaseConnected && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              fontSize: '0.82rem',
              color: '#854d0e',
              lineHeight: '1.6'
            }}>
              <strong>💡 Catatan Server Firebase:</strong> Database sudah terkunci permanen ke <code>gladiola-1d671</code>. Saat ini data otomatis tersinkron via Cloud Realtime Cadangan. Untuk mengaktifkan koneksi sub-detik langsung Google WebSocket, cukup klik tombol <em>"Create Database"</em> 1x di <a href="https://console.firebase.google.com/u/0/project/gladiola-1d671/database" target="_blank" rel="noopener noreferrer" style={{ color: '#b45309', fontWeight: 600, textDecoration: 'underline' }}>Console Firebase gladiola-1d671 ↗</a>.
            </div>
          )}

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
