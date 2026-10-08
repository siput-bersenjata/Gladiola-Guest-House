import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconMapPin, IconShield, IconCompass, IconExternalLink, IconCheck } from './Icons';
import { GLADIOLA_COORDS } from '../data/initialData';

export const LocationEnforcerModal = () => {
  const {
    isLocationEnforcedModalOpen,
    userLocation,
    requestLocation,
    simulateLocationDefault
  } = useApp();

  const [isRequesting, setIsRequesting] = useState(false);

  if (!isLocationEnforcedModalOpen && userLocation.status === 'granted') {
    return null;
  }

  const handleRequest = () => {
    setIsRequesting(true);
    requestLocation();
    setTimeout(() => setIsRequesting(false), 2000);
  };

  return (
    <div className="location-modal-overlay">
      <div className="location-modal-card">
        {/* Decorative Badge */}
        <div className="location-icon-wrapper">
          <IconShield size={36} className="text-forest-gold" />
        </div>

        <div className="location-badge-pill">
          <span className="pulsing-radar-dot"></span>
          Verifikasi Akses Lokasi Wajib
        </div>

        <h2 className="location-modal-title">
          Keamanan & Pemantauan Gladiol
        </h2>

        <p className="location-modal-desc">
          Untuk menjaga keamanan penghuni, ketertiban operasional kos, dan mencatat log aktivitas login penghuni baru maupun lama, <strong>website ini mewajibkan izin akses lokasi</strong> perangkat Anda.
        </p>

        {/* Location Target Info */}
        <div className="location-target-box">
          <div className="location-target-header">
            <IconMapPin size={18} className="text-primary-green" />
            <span className="font-semibold text-gray-800">Gladiola Guest House</span>
          </div>
          <p className="location-target-address">
            {GLADIOLA_COORDS.address}
          </p>
          <div className="location-target-coords">
            Koordinat Resmi: <code>{GLADIOLA_COORDS.lat}, {GLADIOLA_COORDS.lng}</code>
          </div>
          <a
            href={GLADIOLA_COORDS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="location-maps-link"
          >
            <span>Buka di Google Maps</span>
            <IconExternalLink size={14} />
          </a>
        </div>

        {/* Status display */}
        {userLocation.status === 'granted' ? (
          <div className="location-status-badge success">
            <IconCheck size={18} />
            <span>Lokasi Terverifikasi ({userLocation.distanceKm} km dari Kos)</span>
          </div>
        ) : (
          <div className="location-status-badge pending">
            <IconCompass size={18} />
            <span>Menunggu izin GPS browser...</span>
          </div>
        )}

        {/* Actions */}
        <div className="location-modal-actions">
          <button
            type="button"
            className="btn-primary-location"
            onClick={handleRequest}
            disabled={isRequesting}
          >
            <IconCompass size={18} />
            {isRequesting ? 'Mendeteksi Koordinat...' : 'Izinkan & Lacak Lokasi Saya'}
          </button>

          <button
            type="button"
            className="btn-secondary-location"
            onClick={() => simulateLocationDefault("Verifikasi Area Gladiola Malang")}
          >
            Verifikasi Cepat (Sekitar Jl. Gladiol No. 1)
          </button>
        </div>

        <p className="location-footer-note">
          Data lokasi terlindungi & otomatis dicatat ke Super Admin Activity Log sesuai standar operasional Kos Eksklusif Gladiola.
        </p>
      </div>
    </div>
  );
};
