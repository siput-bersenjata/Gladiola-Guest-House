import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconSettings,
  IconPayment,
  IconWifi,
  IconMapPin,
  IconCheck,
  IconExternalLink
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
    logActivity
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
    </div>
  );
};
