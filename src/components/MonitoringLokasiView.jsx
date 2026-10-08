import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GLADIOLA_COORDS } from '../data/initialData';
import {
  IconRadar,
  IconMapPin,
  IconMonitor,
  IconSmartphone,
  IconTablet,
  IconRefresh,
  IconExternalLink,
  IconSearch,
  IconWifi,
  IconCpu,
  IconLayers,
  IconGlobe,
  IconClock,
  IconShield,
  IconUsers
} from './Icons';

export const MonitoringLokasiView = () => {
  const {
    activeSessions,
    refreshActiveSessions,
    userLocation,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'inside' | 'outside' | 'mobile' | 'desktop'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [expandedUserAgent, setExpandedUserAgent] = useState({});

  const toggleUserAgent = (id) => {
    setExpandedUserAgent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSessions = activeSessions.filter((sess) => {
    const matchesSearch =
      sess.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.roleLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sess.device?.model && sess.device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sess.device?.os && sess.device.os.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filterMode === 'inside') matchesFilter = sess.isInsideKos;
    else if (filterMode === 'outside') matchesFilter = !sess.isInsideKos;
    else if (filterMode === 'mobile') matchesFilter = sess.device?.type?.includes('Smartphone') || sess.device?.type?.includes('Tablet');
    else if (filterMode === 'desktop') matchesFilter = sess.device?.type?.includes('Desktop') || sess.device?.type?.includes('PC');

    return matchesSearch && matchesFilter;
  });

  const totalActive = activeSessions.length;
  const countInside = activeSessions.filter((s) => s.isInsideKos).length;
  const countOutside = activeSessions.filter((s) => !s.isInsideKos).length;
  const countMobile = activeSessions.filter((s) => s.device?.type?.includes('Smartphone') || s.device?.type?.includes('Tablet')).length;

  return (
    <div className="monitoring-lokasi-page">
      {/* Page Header */}
      <div className="section-toolbar mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <IconRadar size={26} className="text-primary-green" />
              <span>Dashboard Monitoring Lokasi & Perangkat</span>
            </h2>
            <span className="live-pulse-badge">
              <span className="live-pulse-dot"></span>
              Live Geolocation
            </span>
          </div>
          <p className="card-subheadline">
            Pemantauan langsung lokasi pengguna aktif sistem dan spesifikasi perangkat yang digunakan secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={refreshActiveSessions}
            title="Pindai ulang koordinat GPS dan perangkat"
          >
            <IconRefresh size={16} />
            <span>Perbarui Sinyal GPS</span>
          </button>

          <a
            href={GLADIOLA_COORDS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <IconExternalLink size={16} />
            <span>Peta Gladiola</span>
          </a>
        </div>
      </div>

      {/* Top Telemetry Stats */}
      <div className="stats-row mb-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pengguna Aktif</span>
            <div className="stat-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <IconUsers size={20} />
            </div>
          </div>
          <div className="stat-value text-emerald-600 flex items-center gap-2">
            <span className="live-pulse-dot"></span>
            {totalActive} Sesi
          </div>
          <div className="stat-hint">Terhubung ke sistem saat ini</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Di Dalam Kos (&lt;50m)</span>
            <div className="stat-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <IconMapPin size={20} />
            </div>
          </div>
          <div className="stat-value text-green-700">{countInside} User</div>
          <div className="stat-hint">Area Gladiola Guest House</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Di Luar Kos (Remote)</span>
            <div className="stat-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
              <IconGlobe size={20} />
            </div>
          </div>
          <div className="stat-value text-amber-600">{countOutside} User</div>
          <div className="stat-hint">Kampus / Luar area kos</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Perangkat Mobile</span>
            <div className="stat-icon-wrap" style={{ background: '#f8fafc', color: '#475569' }}>
              <IconSmartphone size={20} />
            </div>
          </div>
          <div className="stat-value">{countMobile} HP / Tablet</div>
          <div className="stat-hint">{totalActive - countMobile} Desktop / PC</div>
        </div>
      </div>

      {/* Radar & Gladiola Radius Visualizer */}
      <div className="radar-visual-card mb-6">
        <div className="radar-card-header">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <IconRadar size={18} className="text-primary-green" />
              <span>Radar Geolocation • Pusat Gladiola Guest House</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Titik Pusat: {GLADIOLA_COORDS.lat}, {GLADIOLA_COORDS.lng} • Jl. Gladiol No. 1, Malang
            </span>
          </div>

          <div className="radar-legend-row">
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: '#22c55e' }}></span>
              <span>Zona Kos (&lt;50m)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: '#eab308' }}></span>
              <span>Radius Sekitar (500m)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: '#3b82f6' }}></span>
              <span>Luar Kota / Jauh (&gt;1km)</span>
            </div>
          </div>
        </div>

        {/* Circular Radar Screen */}
        <div className="radar-screen-wrapper">
          <div className="radar-circle-outer">
            {/* Concentric rings */}
            <div className="radar-ring ring-3" title="Radius 2.5 km (Malang Raya)">
              <span className="ring-label">Radius 2.5 km</span>
            </div>
            <div className="radar-ring ring-2" title="Radius 500 meter (Lowokwaru)">
              <span className="ring-label">500 m</span>
            </div>
            <div className="radar-ring ring-1" title="Radius 50 meter (Gladiola Kos)">
              <span className="ring-label">50 m</span>
            </div>

            {/* Crosshair grid lines */}
            <div className="radar-crosshair horizontal"></div>
            <div className="radar-crosshair vertical"></div>

            {/* Sweep radar animation line */}
            <div className="radar-sweep"></div>

            {/* Center Pin: Gladiola Kos */}
            <div className="radar-center-pin" title="Pusat: Gladiola Guest House (Lowokwaru, Malang)">
              <div className="center-pulse-ring"></div>
              <div className="center-pin-core">
                <IconMapPin size={16} />
              </div>
              <span className="center-pin-label">GLADIOLA</span>
            </div>

            {/* Dynamic Active User Blips on Radar */}
            {activeSessions.map((sess, idx) => {
              // Calculate radar blip position based on distance
              // 0-50m => inner ring (radius 10-25%)
              // 500m-1.5km => middle ring (radius 35-65%)
              // 2km+ => outer ring (radius 75-90%)
              let distancePercent = 20;
              if (sess.distanceMeters <= 50) {
                distancePercent = 12 + (sess.distanceMeters / 50) * 15;
              } else if (sess.distanceMeters <= 1200) {
                distancePercent = 35 + (sess.distanceMeters / 1200) * 30;
              } else {
                distancePercent = 70 + Math.min(20, (sess.distanceMeters / 3000) * 20);
              }

              // Spread angles realistically
              const angles = [45, 130, 225, 310, 80, 190];
              const angleDeg = angles[idx % angles.length];
              const angleRad = (angleDeg * Math.PI) / 180;
              const xPos = 50 + distancePercent * Math.cos(angleRad);
              const yPos = 50 + distancePercent * Math.sin(angleRad);

              const isSelected = selectedSessionId === sess.id;

              return (
                <div
                  key={sess.id}
                  className={`radar-user-blip ${sess.isInsideKos ? 'blip-inside' : 'blip-outside'} ${sess.isCurrent ? 'blip-current' : ''} ${isSelected ? 'blip-selected' : ''}`}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  onClick={() => setSelectedSessionId(sess.id)}
                  title={`${sess.name} (${sess.roleLabel}) • Jarak: ${sess.distanceMeters}m`}
                >
                  <div className="blip-pulse-wave"></div>
                  <img src={sess.avatar} alt={sess.name} className="blip-avatar" />
                  <div className="blip-label-card">
                    <strong>{sess.name}</strong>
                    <span>{sess.distanceMeters}m {sess.isInsideKos ? '• Di Kos' : '• Luar Kos'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="section-toolbar mb-4">
        <div className="toolbar-search-group flex-wrap">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari nama, perangkat, sistem operasi, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-pill-group">
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Semua ({totalActive})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'inside' ? 'active' : ''}`}
              onClick={() => setFilterMode('inside')}
            >
              Di Dalam Kos ({countInside})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'outside' ? 'active' : ''}`}
              onClick={() => setFilterMode('outside')}
            >
              Di Luar Kos ({countOutside})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setFilterMode('mobile')}
            >
              Mobile / HP ({countMobile})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setFilterMode('desktop')}
            >
              Desktop / PC ({totalActive - countMobile})
            </button>
          </div>
        </div>
      </div>

      {/* User Sessions & Device Telemetry Grid */}
      <div className="session-cards-grid">
        {filteredSessions.map((sess) => {
          const isCurrent = sess.isCurrent || (currentUser && currentUser.username === sess.username);
          const dev = sess.device || {};
          const isMobileDevice = dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

          return (
            <div
              key={sess.id}
              className={`session-telemetry-card ${sess.isInsideKos ? 'inside-border' : 'outside-border'} ${isCurrent ? 'current-active-card' : ''}`}
            >
              {/* Card Header: User Identity */}
              <div className="session-card-header">
                <div className="session-user-profile">
                  <div className="relative">
                    <img src={sess.avatar} alt={sess.name} className="session-user-avatar" />
                    <span
                      className={`avatar-online-dot ${sess.status === 'Online' ? 'bg-green-500' : 'bg-amber-400'}`}
                      title={sess.status}
                    ></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base">{sess.name}</h4>
                      {isCurrent && (
                        <span className="current-user-tag">Perangkat Anda</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`badge-role-pill ${
                          sess.role === 'super_admin'
                            ? 'role-super'
                            : sess.role === 'operator'
                            ? 'role-operator'
                            : sess.role === 'owner'
                            ? 'role-owner'
                            : 'role-tenant'
                        }`}
                      >
                        {sess.roleLabel}
                      </span>
                      {sess.room && (
                        <span className="room-indicator-pill">{sess.room}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="session-status-badge-wrap">
                  <span className={`status-pill ${sess.status === 'Online' ? 'online' : 'idle'}`}>
                    <span className="live-pulse-dot"></span>
                    {sess.status}
                  </span>
                  <span className="text-xs text-gray-400 block mt-1 font-mono text-right">
                    {sess.lastActive}
                  </span>
                </div>
              </div>

              {/* Geolocation Section */}
              <div className="telemetry-subcard geo-subcard">
                <div className="subcard-title-row">
                  <IconMapPin size={15} className="text-primary-green" />
                  <span className="subcard-title">Data Lokasi Geografis & GPS</span>
                  <span
                    className={`geofence-chip ${sess.isInsideKos ? 'inside' : 'outside'}`}
                  >
                    {sess.isInsideKos ? '✓ Di Dalam Kos (<50m)' : `⚠️ Di Luar Kos (${sess.distanceMeters > 1000 ? `${(sess.distanceMeters/1000).toFixed(1)} km` : `${sess.distanceMeters} m`})`}
                  </span>
                </div>

                <div className="geo-location-address">
                  <strong>{sess.locationName}</strong>
                </div>

                <div className="geo-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Koordinat GPS:</span>
                    <div className="flex items-center gap-1">
                      <code className="meta-code">
                        {sess.coords.lat.toFixed(6)}, {sess.coords.lng.toFixed(6)}
                      </code>
                      <a
                        href={`https://www.google.com/maps?q=${sess.coords.lat},${sess.coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-ext-btn"
                        title="Buka titik koordinat di Google Maps"
                      >
                        <IconExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Akurasi Sinyal GPS:</span>
                    <span className="meta-val">±{sess.coords.accuracy} meter (High Precision)</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Jarak ke Gladiol:</span>
                    <span className="meta-val font-semibold text-emerald-800">
                      {sess.distanceMeters} meter ({sess.distanceMeters <= 50 ? 'Area Kos' : 'Luar Properti'})
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Waktu Masuk (Login):</span>
                    <span className="meta-val font-mono">{sess.loginTime}</span>
                  </div>
                </div>
              </div>

              {/* Device Telemetry Section */}
              <div className="telemetry-subcard device-subcard">
                <div className="subcard-title-row">
                  {isMobileDevice ? (
                    <IconSmartphone size={15} className="text-blue-600" />
                  ) : (
                    <IconMonitor size={15} className="text-blue-600" />
                  )}
                  <span className="subcard-title">Data Spesifikasi Perangkat</span>
                  <span className="device-type-badge">
                    {dev.type || 'Desktop / PC'}
                  </span>
                </div>

                {/* Device Model Highlight */}
                <div className="device-model-highlight">
                  <div className="device-model-name">
                    <strong>{dev.model || 'Perangkat Standar'}</strong>
                  </div>
                  <span className="device-os-tag">{dev.os || 'OS Terdeteksi'}</span>
                </div>

                {/* Technical Specs Grid */}
                <div className="device-specs-grid">
                  <div className="spec-row">
                    <span className="spec-label">
                      <IconGlobe size={13} className="text-gray-400" />
                      <span>Browser Web:</span>
                    </span>
                    <span className="spec-val font-medium">{dev.browser || 'Browser Standar'}</span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">
                      <IconLayers size={13} className="text-gray-400" />
                      <span>Resolusi Layar:</span>
                    </span>
                    <span className="spec-val font-mono text-xs">
                      {dev.screenRes || '1920 × 1080'} ({dev.orientation || 'Landscape'})
                    </span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">
                      <IconWifi size={13} className="text-gray-400" />
                      <span>Koneksi & Jaringan:</span>
                    </span>
                    <span className="spec-val font-medium text-emerald-700">
                      {dev.networkType || 'WiFi Gladiol 5G'}
                    </span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">
                      <IconShield size={13} className="text-gray-400" />
                      <span>IP Address & ISP:</span>
                    </span>
                    <span className="spec-val font-mono text-xs">
                      {dev.ipAddress || '103.145.22.84'} • {dev.isp || 'Biznet Malang'}
                    </span>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">
                      <IconCpu size={13} className="text-gray-400" />
                      <span>Hardware Telemetri:</span>
                    </span>
                    <span className="spec-val text-xs">
                      {dev.cpuCores || 8} Cores CPU • RAM {dev.memory || 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Collapsible User Agent */}
                <div className="ua-collapsible-wrap">
                  <button
                    type="button"
                    className="btn-toggle-ua"
                    onClick={() => toggleUserAgent(sess.id)}
                  >
                    <span>{expandedUserAgent[sess.id] ? '▲ Sembunyikan' : '▼ Lihat'} String User-Agent Lengkap</span>
                  </button>
                  {expandedUserAgent[sess.id] && (
                    <div className="ua-content-box">
                      <code className="text-xs break-all font-mono text-gray-600">
                        {dev.userAgent || navigator.userAgent}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
