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
    forcePushLocalToCloud
  } = useApp();

  const [bankFormData, setBankFormData] = useState({ ...bankInfo });
  const [wifiFormData, setWifiFormData] = useState({ ...wifiInfo });
  const [customBinId, setCustomBinId] = useState(cloudBinId);

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

      {/* Card 4: Sinkronisasi Multi-Perangkat (Cloud Sync Realtime) */}
      <div className="dashboard-card mt-6">
        <div className="chart-card-header">
          <div className="icon-badge-box bg-blue-tint">
            <IconCloud size={22} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="card-headline">Sinkronisasi Cloud Multi-Perangkat (Realtime Sync)</h3>
            <p className="card-subheadline">
              Memastikan perubahan data langsung tersinkronisasi otomatis saat diakses dari HP, laptop, atau jaringan lain
            </p>
          </div>
        </div>

        <div className="location-settings-box">
          <div className="cloud-sync-status-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Status Koneksi Cloud:</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.82rem',
              backgroundColor: cloudSyncStatus === 'offline' ? '#fee2e2' : '#dcfce7',
              color: cloudSyncStatus === 'offline' ? '#b91c1c' : '#15803d'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: cloudSyncStatus === 'offline' ? '#ef4444' : '#22c55e'
              }}></span>
              {isCloudSyncing ? 'Sedang Menyinkronkan...' : cloudSyncStatus === 'offline' ? 'Offline / Terputus' : 'Online & Tersinkronisasi'}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              • Terakhir diperbarui: <strong>{lastSyncedTime}</strong>
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            Sistem Gladiola dilengkapi integrasi penyimpanan cloud otomatis. Setiap kali Anda menambah atau mengubah data anak kos, tagihan, atau pembayaran di satu perangkat, data akan otomatis tersimpan ke cloud dan sinkron ke seluruh gadget lain secara real-time.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
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
