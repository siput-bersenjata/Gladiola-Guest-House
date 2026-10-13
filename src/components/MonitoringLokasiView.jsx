import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GLADIOLA_COORDS } from '../data/initialData';
import {
  IconUsers,
  IconMapPin,
  IconMonitor,
  IconSmartphone,
  IconTablet,
  IconRefresh,
  IconExternalLink,
  IconSearch,
  IconWifi,
  IconClock,
  IconShield,
  IconGlobe,
  IconArrowLeft,
  IconActivity,
  IconCheck,
  IconLayers
} from './Icons';

export const MonitoringLokasiView = () => {
  const {
    activeSessions = [],
    sessionHistory = [],
    activityLogs = [],
    refreshActiveSessions,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'inside' | 'outside' | 'mobile' | 'desktop'
  const [selectedUser, setSelectedUser] = useState(null);
  const [logSearchTerm, setLogSearchTerm] = useState('');

  // Filter Active Sessions (Only real live sessions)
  const filteredActiveSessions = activeSessions.filter((sess) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (sess.name && sess.name.toLowerCase().includes(term)) ||
      (sess.roleLabel && sess.roleLabel.toLowerCase().includes(term)) ||
      (sess.locationName && sess.locationName.toLowerCase().includes(term)) ||
      (sess.lastAccessedPage && sess.lastAccessedPage.toLowerCase().includes(term)) ||
      (sess.device?.model && sess.device.model.toLowerCase().includes(term)) ||
      (sess.device?.os && sess.device.os.toLowerCase().includes(term));

    let matchesFilter = true;
    if (filterMode === 'inside') matchesFilter = sess.isInsideKos;
    else if (filterMode === 'outside') matchesFilter = !sess.isInsideKos;
    else if (filterMode === 'mobile')
      matchesFilter = sess.device?.type?.includes('Smartphone') || sess.device?.type?.includes('Tablet');
    else if (filterMode === 'desktop')
      matchesFilter = sess.device?.type?.includes('Desktop') || sess.device?.type?.includes('PC');

    return matchesSearch && matchesFilter;
  });

  // Filter Session History
  const filteredSessionHistory = sessionHistory.filter((hist) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (hist.name && hist.name.toLowerCase().includes(term)) ||
      (hist.roleLabel && hist.roleLabel.toLowerCase().includes(term)) ||
      (hist.locationName && hist.locationName.toLowerCase().includes(term)) ||
      (hist.lastAccessedPage && hist.lastAccessedPage.toLowerCase().includes(term)) ||
      (hist.device?.model && hist.device.model.toLowerCase().includes(term)) ||
      (hist.device?.os && hist.device.os.toLowerCase().includes(term));

    let matchesFilter = true;
    if (filterMode === 'inside') matchesFilter = hist.isInsideKos;
    else if (filterMode === 'outside') matchesFilter = !hist.isInsideKos;
    else if (filterMode === 'mobile')
      matchesFilter = hist.device?.type?.includes('Smartphone') || hist.device?.type?.includes('Tablet');
    else if (filterMode === 'desktop')
      matchesFilter = hist.device?.type?.includes('Desktop') || hist.device?.type?.includes('PC');

    return matchesSearch && matchesFilter;
  });

  // Accurate Quick Stats
  const totalActive = activeSessions.length;
  const countInside = activeSessions.filter((s) => s.isInsideKos).length;
  const countOutside = activeSessions.filter((s) => !s.isInsideKos).length;
  const totalHistory = sessionHistory.length;

  // Render Individual User Log View when a user row is clicked
  if (selectedUser) {
    const userLogs = activityLogs.filter((log) => {
      const matchId =
        log.userId &&
        (log.userId === selectedUser.userId ||
          log.userId === selectedUser.id ||
          log.userId === selectedUser.username);
      const matchName =
        log.user &&
        (log.user.toLowerCase().includes(selectedUser.name.toLowerCase()) ||
          selectedUser.name.toLowerCase().includes(log.user.toLowerCase()));
      const matchPhone = selectedUser.phone && log.user && log.user.includes(selectedUser.phone);
      return matchId || matchName || matchPhone;
    });

    const displayLogs =
      userLogs.length > 0
        ? userLogs
        : [
            {
              id: `log-live-${selectedUser.id}`,
              userId: selectedUser.userId || selectedUser.id,
              user: selectedUser.name,
              role: selectedUser.role,
              action: selectedUser.lastAction || 'Sesi Pengguna Aktif',
              pageAccessed: selectedUser.lastAccessedPage || 'Dashboard Ringkasan',
              details: `Sesi terhubung dari ${selectedUser.locationName || 'Gladiola Guest House'}`,
              timestamp: selectedUser.loginTime ? `2026-10-13 ${selectedUser.loginTime}` : '2026-10-13 10:00:00',
              time: selectedUser.loginTime || '10:00 WIB',
              coords: selectedUser.coords || GLADIOLA_COORDS,
              locationName: selectedUser.locationName || 'Gladiola Guest House Area, Malang',
              distanceMeters: selectedUser.distanceMeters || 8,
              distanceText:
                selectedUser.distanceMeters <= 50
                  ? `${selectedUser.distanceMeters || 8} meter • Di Dalam Kos`
                  : `${((selectedUser.distanceMeters || 8) / 1000).toFixed(1)} km • Di Luar Kos`,
              isInsideKos: selectedUser.isInsideKos,
              deviceModel: selectedUser.device?.model || 'Perangkat Pengguna',
              ipAddress: selectedUser.device?.ipAddress || '103.145.22.84'
            }
          ];

    const filteredUserLogs = displayLogs.filter((log) => {
      if (!logSearchTerm) return true;
      const term = logSearchTerm.toLowerCase();
      return (
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.pageAccessed && log.pageAccessed.toLowerCase().includes(term)) ||
        (log.locationName && log.locationName.toLowerCase().includes(term)) ||
        (log.details && log.details.toLowerCase().includes(term)) ||
        (log.timestamp && log.timestamp.toLowerCase().includes(term))
      );
    });

    const isCurrent =
      selectedUser.isCurrent || (currentUser && currentUser.username === selectedUser.username);
    const dev = selectedUser.device || {};
    const isMobile = dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

    return (
      <div className="monitoring-lokasi-page individual-user-view">
        {/* Back Navigation Bar */}
        <div className="user-view-topbar">
          <button
            type="button"
            className="btn-back-nav"
            onClick={() => setSelectedUser(null)}
          >
            <IconArrowLeft size={16} />
            <span>Kembali ke Daftar Tabel Monitoring</span>
          </button>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            <span>Monitoring User</span>
            <span style={{ margin: '0 6px' }}>/</span>
            <strong style={{ color: 'var(--forest-900)' }}>{selectedUser.name}</strong>
          </div>
        </div>

        {/* User Profile Hero Header Card */}
        <div className="user-hero-card">
          <div className="user-hero-header">
            <div className="user-hero-profile">
              <div className="user-hero-avatar-wrap">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="user-hero-avatar"
                />
                <span
                  className={`avatar-status-dot ${
                    selectedUser.status === 'Online' ? 'online' : 'offline'
                  }`}
                  style={{ width: '14px', height: '14px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="user-hero-name">{selectedUser.name}</h3>
                  {isCurrent && <span className="current-user-tag">Perangkat Anda Saat Ini</span>}
                  <span
                    className={`badge-role-pill ${
                      selectedUser.status === 'Online' ? 'role-tenant' : 'role-operator'
                    }`}
                  >
                    ● {selectedUser.status || 'Aktif'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span
                    className={`badge-role-pill ${
                      selectedUser.role === 'super_admin'
                        ? 'role-super'
                        : selectedUser.role === 'operator'
                        ? 'role-operator'
                        : selectedUser.role === 'owner'
                        ? 'role-owner'
                        : 'role-tenant'
                    }`}
                  >
                    {selectedUser.roleLabel}
                  </span>

                  {selectedUser.room && (
                    <span className="room-indicator-pill" style={{ marginTop: 0 }}>
                      {selectedUser.room}
                    </span>
                  )}

                  {selectedUser.phone && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      📞 {selectedUser.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <a
                href={
                  selectedUser.coords
                    ? `https://www.google.com/maps?q=${selectedUser.coords.lat},${selectedUser.coords.lng}`
                    : GLADIOLA_COORDS.mapsUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '8px 16px' }}
              >
                <IconExternalLink size={14} />
                <span>Buka Posisi GPS di Google Maps</span>
              </a>
            </div>
          </div>

          {/* 4 Telemetry Quick Info Cards */}
          <div className="user-metrics-grid">
            {/* 1. Lokasi Akses Terkini */}
            <div className="user-metric-box">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <IconMapPin size={15} style={{ color: 'var(--forest-600)' }} />
                  <span>Lokasi Akses Terkini</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
                  {selectedUser.locationName || 'Gladiola Guest House, Malang'}
                </div>
              </div>
              {selectedUser.coords && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '8px' }}>
                  GPS: {selectedUser.coords.lat?.toFixed(5)}, {selectedUser.coords.lng?.toFixed(5)}
                </div>
              )}
            </div>

            {/* 2. Jarak ke Gladiola */}
            <div className="user-metric-box">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <IconGlobe size={15} style={{ color: selectedUser.isInsideKos ? 'var(--forest-600)' : '#d97706' }} />
                  <span>Jarak ke Gladiola</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    className={`distance-pill ${
                      selectedUser.isInsideKos ? 'dist-inside' : 'dist-outside'
                    }`}
                    style={{ fontSize: '0.82rem', padding: '4px 10px' }}
                  >
                    {selectedUser.isInsideKos ? '✓' : '⚠️'}{' '}
                    {selectedUser.distanceMeters <= 50
                      ? `${selectedUser.distanceMeters || 8} Meter`
                      : `${((selectedUser.distanceMeters || 8) / 1000).toFixed(2)} km`}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {selectedUser.isInsideKos ? 'Area Dalam Properti' : 'Luar Area Properti'}
              </div>
            </div>

            {/* 3. Terakhir Akses Halaman */}
            <div className="user-metric-box">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <IconActivity size={15} style={{ color: '#0284c7' }} />
                  <span>Terakhir Akses Halaman</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>
                  {selectedUser.lastAccessedPage || 'Dashboard Ringkasan'}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedUser.lastAction || 'Navigasi sistem Gladiola'}
              </div>
            </div>

            {/* 4. Perangkat & Jam Masuk */}
            <div className="user-metric-box">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {isMobile ? <IconSmartphone size={15} style={{ color: '#7c3aed' }} /> : <IconMonitor size={15} style={{ color: '#7c3aed' }} />}
                  <span>Perangkat & Jam Masuk</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dev.model || dev.type || 'Perangkat Standar'}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '8px' }}>
                🕒 {selectedUser.loginTime || 'Hari ini'}
              </div>
            </div>
          </div>

          {/* Technical Telemetry Strip */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span><strong style={{ color: 'var(--text-main)' }}>OS:</strong> {dev.os || 'OS Terdeteksi'}</span>
              <span><strong style={{ color: 'var(--text-main)' }}>Browser:</strong> {dev.browser || 'Browser Standar'}</span>
              <span><strong style={{ color: 'var(--text-main)' }}>IP:</strong> {dev.ipAddress || '103.145.22.84'}</span>
              <span><strong style={{ color: 'var(--text-main)' }}>Jaringan:</strong> {dev.networkType || dev.isp || 'WiFi Gladiol 5G'}</span>
            </div>
            <div style={{ fontFamily: 'monospace', color: 'var(--text-subtle)' }}>
              Resolusi: {dev.screenRes || '1920 × 1080'}
            </div>
          </div>
        </div>

        {/* Individual User Logs Section */}
        <div className="monitoring-table-card">
          <div className="monitoring-table-header">
            <div>
              <div className="monitoring-header-title">
                <IconClock size={18} style={{ color: 'var(--forest-600)' }} />
                <span>Riwayat Log Lokasi & Aktivitas Akses User</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Rekaman geolokasi, jam akses, jarak, dan halaman web yang diakses oleh <strong>{selectedUser.name}</strong>
              </div>
            </div>

            <div className="monitoring-search-box" style={{ maxWidth: '320px', padding: '6px 14px' }}>
              <IconSearch size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari aksi, halaman, lokasi..."
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="monitoring-table-responsive">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                  <th style={{ width: '130px' }}>Waktu & Jam</th>
                  <th style={{ width: '240px' }}>Lokasi Akses</th>
                  <th style={{ width: '160px' }}>Jarak ke Gladiola</th>
                  <th style={{ width: '200px' }}>Halaman Website</th>
                  <th>Rincian Aktivitas / Aksi</th>
                  <th style={{ width: '160px' }}>Perangkat & IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredUserLogs.length > 0 ? (
                  filteredUserLogs.map((log, idx) => {
                    const isInside =
                      log.isInsideKos !== undefined
                        ? log.isInsideKos
                        : (log.distanceMeters !== undefined && log.distanceMeters <= 50);

                    return (
                      <tr key={log.id || idx}>
                        {/* No */}
                        <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>

                        {/* Waktu & Jam Akses */}
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                            {log.time || log.timestamp?.split(' ')[1] || '10:00 WIB'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            {log.timestamp?.split(' ')[0] || '2026-10-13'}
                          </div>
                        </td>

                        {/* Lokasi Akses */}
                        <td>
                          <div className="geo-cell">
                            <div className="geo-address-text">
                              <IconMapPin size={14} style={{ color: 'var(--forest-600)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{log.locationName || 'Gladiola Guest House, Malang'}</span>
                            </div>
                            {log.coords && (
                              <div className="geo-coords-tag">
                                <span>{log.coords.lat?.toFixed(5)}, {log.coords.lng?.toFixed(5)}</span>
                                <a
                                  href={`https://www.google.com/maps?q=${log.coords.lat},${log.coords.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="map-ext-link"
                                  title="Buka di Maps"
                                >
                                  <IconExternalLink size={11} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Jarak User dengan Gladiola */}
                        <td>
                          <span className={`distance-pill ${isInside ? 'dist-inside' : 'dist-outside'}`}>
                            {isInside ? '✓' : '⚠️'}{' '}
                            {log.distanceText ||
                              (log.distanceMeters !== undefined
                                ? log.distanceMeters <= 50
                                  ? `${log.distanceMeters} m (Di Kos)`
                                  : `${(log.distanceMeters / 1000).toFixed(1)} km (Luar)`
                                : '8 m (Di Kos)')}
                          </span>
                        </td>

                        {/* Terakhir Akses Halaman */}
                        <td>
                          <span className="page-access-pill">
                            <IconLayers size={13} />
                            <span>{log.pageAccessed || 'Dashboard Ringkasan'}</span>
                          </span>
                        </td>

                        {/* Rincian Aktivitas */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                            {log.action}
                          </div>
                          {log.details && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {log.details}
                            </div>
                          )}
                        </td>

                        {/* Perangkat & IP */}
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-main)' }}>
                            {log.deviceModel || selectedUser.device?.model || 'Perangkat Standar'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            IP: {log.ipAddress || selectedUser.device?.ipAddress || '103.145.22.84'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Tidak ada log yang cocok dengan pencarian "{logSearchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', background: 'var(--forest-50)', borderTop: '1px solid var(--border-card)', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>
              Menampilkan {filteredUserLogs.length} rekaman akses untuk <strong>{selectedUser.name}</strong>
            </span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-subtle)' }}>
              Sinkronisasi Cloud Real-Time Aktif
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: Symmetrical Tables for Active Users & Session History
  // =========================================================================
  return (
    <div className="monitoring-lokasi-page">
      {/* Page Header */}
      <div className="section-toolbar" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <IconUsers size={26} style={{ color: 'var(--forest-700)' }} />
              <span>Monitoring Pengguna Aktif & Riwayat Akses</span>
            </h2>
            <span className="live-pulse-badge">
              <span className="live-pulse-dot"></span>
              Live Geolocation
            </span>
          </div>
          <p className="card-subheadline" style={{ marginTop: '6px' }}>
            Tabel pemantauan presisi pengguna aktif saat ini, riwayat sesi akses, koordinat GPS, jarak ke Gladiola Guest House, dan rincian log aktivitas. Klik baris pengguna untuk melihat log lengkap.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={refreshActiveSessions}
            title="Pindai ulang koordinat GPS dan perangkat"
          >
            <IconRefresh size={15} />
            <span>Perbarui Sinyal GPS</span>
          </button>

          <a
            href={GLADIOLA_COORDS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <IconExternalLink size={15} />
            <span>Peta Gladiola</span>
          </a>
        </div>
      </div>

      {/* Top 4 Telemetry Stats Cards (Symmetrical Grid) */}
      <div className="stats-row" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pengguna Aktif Saat Ini</span>
            <div className="stat-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <IconUsers size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-pulse-dot"></span>
            {totalActive} Sesi
          </div>
          <div className="stat-hint">
            {totalActive > 0 ? 'Terhubung ke sistem saat ini' : 'Belum ada sesi aktif lain'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Riwayat Sesi Tercatat</span>
            <div className="stat-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <IconClock size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{totalHistory} Sesi</div>
          <div className="stat-hint">Riwayat akses yang telah selesai</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Di Dalam Kos (&lt;50m)</span>
            <div className="stat-icon-wrap" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <IconMapPin size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{countInside} User</div>
          <div className="stat-hint">Area Gladiola Guest House</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Di Luar Kos (Remote)</span>
            <div className="stat-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
              <IconGlobe size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>{countOutside} User</div>
          <div className="stat-hint">Kampus / Luar area properti</div>
        </div>
      </div>

      {/* Symmetrical Segmented Pill Tab Switcher */}
      <div className="monitoring-tabs-wrapper">
        <button
          type="button"
          className={`monitoring-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <IconUsers size={16} />
          <span>Tabel Pengguna Aktif Saat Ini</span>
          <span className="monitoring-tab-badge">{totalActive}</span>
        </button>

        <button
          type="button"
          className={`monitoring-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <IconClock size={16} />
          <span>Tabel Riwayat User Aktif</span>
          <span className="monitoring-tab-badge">{totalHistory}</span>
        </button>
      </div>

      {/* Symmetrical Filter and Search Toolbar */}
      <div className="monitoring-filter-toolbar">
        <div className="monitoring-search-box">
          <IconSearch size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari nama, peran, kamar, perangkat, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="monitoring-filter-pills">
          <button
            type="button"
            className={`monitoring-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Semua ({activeTab === 'active' ? totalActive : totalHistory})
          </button>
          <button
            type="button"
            className={`monitoring-filter-btn ${filterMode === 'inside' ? 'active' : ''}`}
            onClick={() => setFilterMode('inside')}
          >
            Di Dalam Kos (&lt;50m)
          </button>
          <button
            type="button"
            className={`monitoring-filter-btn ${filterMode === 'outside' ? 'active' : ''}`}
            onClick={() => setFilterMode('outside')}
          >
            Di Luar Kos
          </button>
          <button
            type="button"
            className={`monitoring-filter-btn ${filterMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setFilterMode('mobile')}
          >
            Mobile / HP
          </button>
          <button
            type="button"
            className={`monitoring-filter-btn ${filterMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setFilterMode('desktop')}
          >
            Desktop / PC
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: TABEL PENGGUNA AKTIF SAAT INI (NO DUMMY DATA)
          =================================================================== */}
      {activeTab === 'active' && (
        <div className="monitoring-table-card">
          <div className="monitoring-table-header">
            <div className="monitoring-header-title">
              <span className="live-pulse-dot"></span>
              <span>Daftar Sesi Pengguna yang Sedang Terhubung (Live Sessions)</span>
            </div>
            <div className="monitoring-header-hint">
              Klik baris pengguna untuk melihat log lokasi & aktivitas detail
            </div>
          </div>

          {filteredActiveSessions.length > 0 ? (
            <div className="monitoring-table-responsive">
              <table className="monitoring-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>Pengguna</th>
                    <th style={{ width: '150px' }}>Peran & Kamar</th>
                    <th style={{ width: '260px' }}>Lokasi Akses Terkini</th>
                    <th style={{ width: '160px' }}>Jarak ke Gladiola</th>
                    <th style={{ width: '220px' }}>Terakhir Akses Halaman</th>
                    <th style={{ width: '190px' }}>Perangkat & Jaringan</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Aksi Log</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveSessions.map((sess) => {
                    const isCurrent =
                      sess.isCurrent || (currentUser && currentUser.username === sess.username);
                    const dev = sess.device || {};
                    const isMobile =
                      dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

                    return (
                      <tr
                        key={sess.id}
                        onClick={() => setSelectedUser(sess)}
                        style={{ cursor: 'pointer' }}
                        title={`Klik untuk melihat detail log aktivitas ${sess.name}`}
                      >
                        {/* Pengguna & Avatar (Strictly 42x42px Symmetrical) */}
                        <td>
                          <div className="user-identity-cell">
                            <div className="user-avatar-wrap">
                              <img
                                src={sess.avatar}
                                alt={sess.name}
                                className="user-avatar-img"
                              />
                              <span
                                className={`avatar-status-dot ${
                                  sess.status === 'Online' ? 'online' : 'offline'
                                }`}
                              />
                            </div>
                            <div className="user-meta-column">
                              <div className="user-name-title">
                                <span>{sess.name}</span>
                                {isCurrent && <span className="current-user-tag">Anda</span>}
                              </div>
                              <div className="user-time-mono">
                                🕒 Masuk: {sess.loginTime || '10:00 WIB'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Peran & Kamar */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
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
                        </td>

                        {/* Lokasi Akses Terkini */}
                        <td>
                          <div className="geo-cell">
                            <div className="geo-address-text">
                              <IconMapPin size={14} style={{ color: 'var(--forest-600)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{sess.locationName || 'Gladiola Guest House, Malang'}</span>
                            </div>
                            {sess.coords && (
                              <div className="geo-coords-tag">
                                <span>
                                  {sess.coords.lat?.toFixed(5)}, {sess.coords.lng?.toFixed(5)}
                                </span>
                                <a
                                  href={`https://www.google.com/maps?q=${sess.coords.lat},${sess.coords.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="map-ext-link"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Buka di Google Maps"
                                >
                                  <IconExternalLink size={11} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Jarak ke Gladiola */}
                        <td>
                          <span
                            className={`distance-pill ${
                              sess.isInsideKos ? 'dist-inside' : 'dist-outside'
                            }`}
                          >
                            {sess.isInsideKos ? '✓' : '⚠️'} {sess.distanceMeters || 8} meter{' '}
                            {sess.isInsideKos ? '(Di Kos)' : '(Luar Kos)'}
                          </span>
                        </td>

                        {/* Terakhir Akses Halaman */}
                        <td>
                          <div className="page-access-pill">
                            <IconLayers size={13} />
                            <span>{sess.lastAccessedPage || 'Dashboard Ringkasan'}</span>
                          </div>
                          <div className="page-access-action">
                            {sess.lastAction || 'Sedang aktif di sistem'}
                          </div>
                        </td>

                        {/* Perangkat & Jaringan */}
                        <td>
                          <div className="device-telemetry-cell">
                            <div className="device-model-row">
                              {isMobile ? (
                                <IconSmartphone size={14} style={{ color: '#0284c7' }} />
                              ) : (
                                <IconMonitor size={14} style={{ color: '#475569' }} />
                              )}
                              <span>{dev.model || dev.type || 'Desktop PC'}</span>
                            </div>
                            <div className="device-meta-mono">
                              {dev.os || 'Windows PC'} • {dev.networkType || dev.isp || 'WiFi / 4G'}
                            </div>
                          </div>
                        </td>

                        {/* Aksi Log */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-view-log"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(sess);
                            }}
                          >
                            Lihat Log →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Clean Symmetrical Empty State when no active users (NO DUMMY DATA) */
            <div className="monitoring-empty-state">
              <div className="empty-state-icon-box">
                <IconUsers size={28} />
              </div>
              <div className="empty-state-title">
                {searchTerm
                  ? 'Tidak Ada Sesi yang Cocok dengan Filter'
                  : 'Belum Ada Pengguna Lain yang Terhubung'}
              </div>
              <div className="empty-state-desc">
                {searchTerm
                  ? `Tidak ditemukan hasil untuk kata kunci "${searchTerm}". Silakan coba kata kunci lain atau bersihkan filter.`
                  : 'Sistem sedang berjalan dalam mode live. Sesi pengguna akan otomatis muncul pada tabel ini secara presisi saat ada pengguna yang login ke website.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          TAB 2: TABEL RIWAYAT USER AKTIF (SESSION HISTORY)
          =================================================================== */}
      {activeTab === 'history' && (
        <div className="monitoring-table-card">
          <div className="monitoring-table-header">
            <div className="monitoring-header-title">
              <IconClock size={18} style={{ color: 'var(--forest-600)' }} />
              <span>Riwayat Sesi Pengguna Terdahulu (User Session History)</span>
            </div>
            <div className="monitoring-header-hint">
              Klik baris riwayat pengguna untuk melihat rekaman log akses lengkap
            </div>
          </div>

          {filteredSessionHistory.length > 0 ? (
            <div className="monitoring-table-responsive">
              <table className="monitoring-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>Pengguna</th>
                    <th style={{ width: '150px' }}>Peran & Kamar</th>
                    <th style={{ width: '180px' }}>Waktu Sesi & Durasi</th>
                    <th style={{ width: '250px' }}>Lokasi Akses Terakhir</th>
                    <th style={{ width: '160px' }}>Jarak ke Gladiola</th>
                    <th style={{ width: '210px' }}>Terakhir Akses Halaman</th>
                    <th style={{ width: '170px' }}>Perangkat & IP</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Aksi Log</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessionHistory.map((hist) => {
                    const dev = hist.device || {};
                    const isMobile =
                      dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

                    return (
                      <tr
                        key={hist.id}
                        onClick={() => setSelectedUser(hist)}
                        style={{ cursor: 'pointer' }}
                        title={`Klik untuk melihat detail riwayat log ${hist.name}`}
                      >
                        {/* Pengguna */}
                        <td>
                          <div className="user-identity-cell">
                            <div className="user-avatar-wrap">
                              <img
                                src={hist.avatar}
                                alt={hist.name}
                                className="user-avatar-img"
                              />
                            </div>
                            <div className="user-meta-column">
                              <div className="user-name-title">
                                <span>{hist.name}</span>
                              </div>
                              <div className="user-time-mono">
                                Sesi Selesai (Logout)
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Peran & Kamar */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span
                              className={`badge-role-pill ${
                                hist.role === 'super_admin'
                                  ? 'role-super'
                                  : hist.role === 'operator'
                                  ? 'role-operator'
                                  : hist.role === 'owner'
                                  ? 'role-owner'
                                  : 'role-tenant'
                              }`}
                            >
                              {hist.roleLabel}
                            </span>
                            {hist.room && (
                              <span className="room-indicator-pill">{hist.room}</span>
                            )}
                          </div>
                        </td>

                        {/* Waktu Sesi & Durasi */}
                        <td>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                            {hist.loginTime}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            s/d {hist.logoutTime || 'Selesai'} ({hist.sessionDuration || '30 m'})
                          </div>
                        </td>

                        {/* Lokasi Akses Terakhir */}
                        <td>
                          <div className="geo-cell">
                            <div className="geo-address-text">
                              <IconMapPin size={14} style={{ color: 'var(--forest-600)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{hist.locationName || 'Gladiola Guest House, Malang'}</span>
                            </div>
                            {hist.coords && (
                              <div className="geo-coords-tag">
                                <span>
                                  {hist.coords.lat?.toFixed(5)}, {hist.coords.lng?.toFixed(5)}
                                </span>
                                <a
                                  href={`https://www.google.com/maps?q=${hist.coords.lat},${hist.coords.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="map-ext-link"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Buka di Maps"
                                >
                                  <IconExternalLink size={11} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Jarak ke Gladiola */}
                        <td>
                          <span
                            className={`distance-pill ${
                              hist.isInsideKos ? 'dist-inside' : 'dist-outside'
                            }`}
                          >
                            {hist.isInsideKos ? '✓' : '⚠️'}{' '}
                            {hist.distanceMeters <= 50
                              ? `${hist.distanceMeters} m (Di Kos)`
                              : `${(hist.distanceMeters / 1000).toFixed(1)} km (Luar)`}
                          </span>
                        </td>

                        {/* Terakhir Akses Halaman */}
                        <td>
                          <div className="page-access-pill">
                            <IconLayers size={13} />
                            <span>{hist.lastAccessedPage || 'Portal Akses'}</span>
                          </div>
                          <div className="page-access-action">
                            {hist.lastAction || 'Aktivitas sesi tercatat'}
                          </div>
                        </td>

                        {/* Perangkat & IP */}
                        <td>
                          <div className="device-telemetry-cell">
                            <div className="device-model-row">
                              {isMobile ? (
                                <IconSmartphone size={14} style={{ color: '#0284c7' }} />
                              ) : (
                                <IconMonitor size={14} style={{ color: '#475569' }} />
                              )}
                              <span>{dev.model || dev.type || 'Perangkat Standar'}</span>
                            </div>
                            <div className="device-meta-mono">
                              IP: {dev.ipAddress || '103.145.22.84'}
                            </div>
                          </div>
                        </td>

                        {/* Aksi Log */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-view-log"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(hist);
                            }}
                          >
                            Lihat Log →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="monitoring-empty-state">
              <div className="empty-state-icon-box">
                <IconClock size={28} />
              </div>
              <div className="empty-state-title">Tidak Ada Riwayat Sesi</div>
              <div className="empty-state-desc">
                {searchTerm
                  ? `Tidak ditemukan riwayat sesi yang cocok dengan kata kunci "${searchTerm}".`
                  : 'Belum ada riwayat sesi yang tersimpan dalam sistem Gladiola.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
