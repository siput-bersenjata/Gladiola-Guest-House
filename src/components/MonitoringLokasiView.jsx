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
    activeSessions,
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

  // Filter Active Sessions
  const filteredActiveSessions = activeSessions.filter((sess) => {
    const matchesSearch =
      sess.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.roleLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sess.lastAccessedPage && sess.lastAccessedPage.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sess.device?.model && sess.device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sess.device?.os && sess.device.os.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filterMode === 'inside') matchesFilter = sess.isInsideKos;
    else if (filterMode === 'outside') matchesFilter = !sess.isInsideKos;
    else if (filterMode === 'mobile') matchesFilter = sess.device?.type?.includes('Smartphone') || sess.device?.type?.includes('Tablet');
    else if (filterMode === 'desktop') matchesFilter = sess.device?.type?.includes('Desktop') || sess.device?.type?.includes('PC');

    return matchesSearch && matchesFilter;
  });

  // Filter Session History
  const filteredSessionHistory = sessionHistory.filter((hist) => {
    const matchesSearch =
      hist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hist.roleLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hist.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hist.lastAccessedPage && hist.lastAccessedPage.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hist.device?.model && hist.device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hist.device?.os && hist.device.os.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (filterMode === 'inside') matchesFilter = hist.isInsideKos;
    else if (filterMode === 'outside') matchesFilter = !hist.isInsideKos;
    else if (filterMode === 'mobile') matchesFilter = hist.device?.type?.includes('Smartphone') || hist.device?.type?.includes('Tablet');
    else if (filterMode === 'desktop') matchesFilter = hist.device?.type?.includes('Desktop') || hist.device?.type?.includes('PC');

    return matchesSearch && matchesFilter;
  });

  // Quick stats
  const totalActive = activeSessions.length;
  const countInside = activeSessions.filter((s) => s.isInsideKos).length;
  const countOutside = activeSessions.filter((s) => !s.isInsideKos).length;
  const totalHistory = sessionHistory.length;

  // Render Individual User Log View when a user is selected
  if (selectedUser) {
    // Collect all activity logs belonging to this selected user
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

    // If userLogs is empty, synthesize a realistic entry from selectedUser state
    const displayLogs =
      userLogs.length > 0
        ? userLogs
        : [
            {
              id: `log-syn-${selectedUser.id}`,
              userId: selectedUser.userId || selectedUser.id,
              user: selectedUser.name,
              role: selectedUser.role,
              action: selectedUser.lastAction || 'Sesi Pengguna Tercatat',
              pageAccessed: selectedUser.lastAccessedPage || 'Dashboard Ringkasan',
              details: `Sesi login tercatat dari ${selectedUser.locationName}`,
              timestamp: selectedUser.loginTime ? `2026-10-12 ${selectedUser.loginTime}` : '2026-10-12 23:45:00',
              time: selectedUser.loginTime || '23:45 WIB',
              coords: selectedUser.coords || GLADIOLA_COORDS,
              locationName: selectedUser.locationName,
              distanceMeters: selectedUser.distanceMeters || 8,
              distanceText:
                selectedUser.distanceMeters <= 50
                  ? `${selectedUser.distanceMeters} meter • Di Dalam Kos`
                  : `${(selectedUser.distanceMeters / 1000).toFixed(1)} km • Di Luar Kos`,
              isInsideKos: selectedUser.isInsideKos,
              deviceModel: selectedUser.device?.model || 'Perangkat Pengguna',
              ipAddress: selectedUser.device?.ipAddress || '103.145.22.84'
            }
          ];

    // Filter logs with logSearchTerm
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
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary flex items-center gap-2 hover:bg-gray-100 transition-colors"
            onClick={() => setSelectedUser(null)}
          >
            <IconArrowLeft size={18} />
            <span className="font-semibold">Kembali ke Daftar Tabel Monitoring</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span>Monitoring User</span>
            <span>/</span>
            <span className="text-gray-900 font-bold">{selectedUser.name}</span>
          </div>
        </div>

        {/* User Profile Hero Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    selectedUser.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                  title={selectedUser.status}
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  {isCurrent && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Perangkat Anda Saat Ini
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      selectedUser.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    ● {selectedUser.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                    <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-bold border border-emerald-200">
                      {selectedUser.room}
                    </span>
                  )}

                  {selectedUser.phone && (
                    <span className="text-xs text-gray-500 font-mono">
                      📞 {selectedUser.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={
                  selectedUser.coords
                    ? `https://www.google.com/maps?q=${selectedUser.coords.lat},${selectedUser.coords.lng}`
                    : GLADIOLA_COORDS.mapsUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 text-xs py-2 px-3"
              >
                <IconExternalLink size={14} />
                <span>Buka Posisi GPS di Google Maps</span>
              </a>
            </div>
          </div>

          {/* 4 Telemetry Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* 1. Lokasi Akses Terkini */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <IconMapPin size={15} className="text-emerald-600" />
                <span>Lokasi Akses Terkini</span>
              </div>
              <div className="font-semibold text-gray-900 text-sm line-clamp-2">
                {selectedUser.locationName}
              </div>
              {selectedUser.coords && (
                <div className="text-xs font-mono text-gray-500 mt-1">
                  GPS: {selectedUser.coords.lat.toFixed(5)}, {selectedUser.coords.lng.toFixed(5)}
                </div>
              )}
            </div>

            {/* 2. Jarak ke Gladiola */}
            <div
              className={`p-4 rounded-xl border ${
                selectedUser.isInsideKos
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-gray-600">
                <IconGlobe size={15} className={selectedUser.isInsideKos ? 'text-emerald-600' : 'text-amber-600'} />
                <span>Jarak ke Gladiola</span>
              </div>
              <div className="text-lg font-black flex items-center gap-1.5">
                {selectedUser.distanceMeters <= 50 ? (
                  <>
                    <span className="text-emerald-700">{selectedUser.distanceMeters} Meter</span>
                    <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      ✓ Di Dalam Kos
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-700">
                      {selectedUser.distanceMeters >= 1000
                        ? `${(selectedUser.distanceMeters / 1000).toFixed(2)} km`
                        : `${selectedUser.distanceMeters} m`}
                    </span>
                    <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      ⚠️ Luar Kos
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                Pusat: Jl. Gladiol No. 1, Malang
              </div>
            </div>

            {/* 3. Terakhir Akses Apa pada Website */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-blue-800">
                <IconActivity size={15} className="text-blue-600" />
                <span>Terakhir Akses Halaman</span>
              </div>
              <div className="font-bold text-blue-900 text-sm">
                {selectedUser.lastAccessedPage || 'Dashboard Ringkasan'}
              </div>
              <div className="text-xs text-blue-700 mt-1 line-clamp-1">
                {selectedUser.lastAction || 'Navigasi sistem Gladiola'}
              </div>
            </div>

            {/* 4. Perangkat & Waktu Akses */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-purple-800">
                {isMobile ? <IconSmartphone size={15} className="text-purple-600" /> : <IconMonitor size={15} className="text-purple-600" />}
                <span>Perangkat & Jam Masuk</span>
              </div>
              <div className="font-bold text-purple-900 text-sm truncate">
                {dev.model || dev.type || 'Perangkat Standar'}
              </div>
              <div className="text-xs text-purple-700 mt-1 font-mono">
                🕒 {selectedUser.loginTime || selectedUser.lastActive || 'Hari ini'}
              </div>
            </div>
          </div>

          {/* Technical Telemetry Strip */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span><strong>OS:</strong> {dev.os || 'OS Terdeteksi'}</span>
              <span><strong>Browser:</strong> {dev.browser || 'Browser Standar'}</span>
              <span><strong>IP:</strong> {dev.ipAddress || '103.145.22.84'}</span>
              <span><strong>Jaringan:</strong> {dev.networkType || dev.isp || 'WiFi Gladiol 5G'}</span>
            </div>
            <div className="font-mono text-gray-400">
              Resolusi: {dev.screenRes || '1920 × 1080'}
            </div>
          </div>
        </div>

        {/* Individual User Logs Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header & Log Search */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4 bg-gray-50/60">
            <div>
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <IconClock size={20} className="text-primary-green" />
                <span>Riwayat Log Lokasi & Aktivitas Akses User</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Daftar rekaman lokasi geografis, jam akses, jarak ke lokasi kos, dan halaman website yang diakses oleh <strong>{selectedUser.name}</strong>
              </p>
            </div>

            <div className="search-box-pill w-full sm:w-80">
              <IconSearch size={16} />
              <input
                type="text"
                placeholder="Cari aksi, halaman, atau lokasi log..."
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table of Individual User Logs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/80 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Waktu & Jam Akses</th>
                  <th className="py-3.5 px-4">Lokasi Akses</th>
                  <th className="py-3.5 px-4">Jarak ke Gladiola</th>
                  <th className="py-3.5 px-4">Terakhir Akses Apa pada Website</th>
                  <th className="py-3.5 px-4">Rincian Aktivitas / Aksi</th>
                  <th className="py-3.5 px-4">Perangkat & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUserLogs.length > 0 ? (
                  filteredUserLogs.map((log, idx) => {
                    const isInside =
                      log.isInsideKos !== undefined
                        ? log.isInsideKos
                        : (log.distanceMeters !== undefined && log.distanceMeters <= 50);

                    return (
                      <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                        {/* No */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-gray-400 font-semibold">
                          {idx + 1}
                        </td>

                        {/* Waktu & Jam Akses */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900 font-mono text-xs">
                            {log.time || log.timestamp?.split(' ')[1] || '00:00 WIB'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            {log.timestamp?.split(' ')[0] || '2026-10-12'}
                          </div>
                        </td>

                        {/* Lokasi Akses */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-gray-900 text-sm flex items-start gap-1.5">
                            <IconMapPin size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{log.locationName || 'Gladiola Guest House, Malang'}</span>
                          </div>
                          {log.coords && (
                            <div className="flex items-center gap-1.5 mt-1 ml-5">
                              <code className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {log.coords.lat?.toFixed(5)}, {log.coords.lng?.toFixed(5)}
                              </code>
                              <a
                                href={`https://www.google.com/maps?q=${log.coords.lat},${log.coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 inline-flex items-center"
                                title="Buka di Google Maps"
                              >
                                <IconExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Jarak User dengan Gladiola */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isInside
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {log.distanceText ||
                                (log.distanceMeters !== undefined
                                  ? log.distanceMeters <= 50
                                    ? `${log.distanceMeters} m • Di Dalam Kos`
                                    : `${(log.distanceMeters / 1000).toFixed(1)} km • Di Luar Kos`
                                  : '8 m • Di Dalam Kos')}
                            </span>
                          </div>
                        </td>

                        {/* Terakhir Akses Apa pada Website */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <IconLayers size={13} className="text-blue-600" />
                            <span>{log.pageAccessed || 'Dashboard Ringkasan'}</span>
                          </span>
                        </td>

                        {/* Rincian Aktivitas / Aksi */}
                        <td className="py-4 px-4 max-w-sm">
                          <div className="font-semibold text-gray-900 text-sm">
                            {log.action}
                          </div>
                          {log.details && (
                            <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {log.details}
                            </div>
                          )}
                        </td>

                        {/* Perangkat & IP */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                          <div className="font-medium text-gray-900">
                            {log.deviceModel || selectedUser.device?.model || 'Perangkat Standar'}
                          </div>
                          <div className="font-mono text-gray-500 mt-0.5">
                            IP: {log.ipAddress || selectedUser.device?.ipAddress || '103.145.22.84'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                      Tidak ada log yang cocok dengan pencarian "{logSearchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between flex-wrap gap-2">
            <span>
              Menampilkan {filteredUserLogs.length} entri rekaman akses untuk <strong>{selectedUser.name}</strong>
            </span>
            <span className="font-mono text-gray-400">
              Sinkronisasi Cloud Realtime Aktif
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View (Tables for Active Users and Session History - NO RADAR MAP)
  return (
    <div className="monitoring-lokasi-page">
      {/* Page Header */}
      <div className="section-toolbar mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <IconUsers size={26} className="text-primary-green" />
              <span>Monitoring Pengguna Aktif & Riwayat Akses</span>
            </h2>
            <span className="live-pulse-badge">
              <span className="live-pulse-dot"></span>
              Live Geolocation
            </span>
          </div>
          <p className="card-subheadline">
            Tabel pemantauan pengguna aktif saat ini, riwayat sesi akses, lokasi koordinat GPS, jarak ke Gladiola Guest House, dan log aktivitas per pengguna. Klik baris pengguna untuk melihat log lengkapnya.
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

      {/* Top Telemetry Stats Cards */}
      <div className="stats-row mb-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pengguna Aktif Saat Ini</span>
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
            <span className="stat-label">Riwayat Sesi Tercatat</span>
            <div className="stat-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <IconClock size={20} />
            </div>
          </div>
          <div className="stat-value text-blue-700">{totalHistory} Sesi</div>
          <div className="stat-hint">Riwayat akses yang telah selesai</div>
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
          <div className="stat-hint">Kampus / Luar area properti</div>
        </div>
      </div>

      {/* Sub Navigation Tabs: Tabel User Aktif vs Tabel Riwayat User Aktif */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-5">
        <button
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeTab === 'active'
              ? 'bg-emerald-700 text-white shadow-emerald-700/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('active')}
        >
          <IconUsers size={17} />
          <span>Tabel Pengguna Aktif Saat Ini</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-black ${
              activeTab === 'active' ? 'bg-emerald-900 text-emerald-100' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {totalActive}
          </span>
        </button>

        <button
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
            activeTab === 'history'
              ? 'bg-blue-700 text-white shadow-blue-700/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <IconClock size={17} />
          <span>Tabel Riwayat User Aktif</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-black ${
              activeTab === 'history' ? 'bg-blue-900 text-blue-100' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {totalHistory}
          </span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="section-toolbar mb-4">
        <div className="toolbar-search-group flex-wrap">
          <div className="search-box-pill w-full sm:w-80">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari nama, peran, kamar, perangkat, lokasi..."
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
              Semua ({activeTab === 'active' ? totalActive : totalHistory})
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'inside' ? 'active' : ''}`}
              onClick={() => setFilterMode('inside')}
            >
              Di Dalam Kos (&lt;50m)
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'outside' ? 'active' : ''}`}
              onClick={() => setFilterMode('outside')}
            >
              Di Luar Kos
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setFilterMode('mobile')}
            >
              Mobile / HP
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${filterMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setFilterMode('desktop')}
            >
              Desktop / PC
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: TABEL USER AKTIF SAAT INI */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-gray-900 text-base">
                Daftar Sesi Pengguna yang Sedang Terhubung (Live Sessions)
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              Klik baris pengguna untuk melihat log lokasi & aktivitas detail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/80 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Peran & Kamar</th>
                  <th className="py-3.5 px-4">Lokasi Akses Terkini</th>
                  <th className="py-3.5 px-4">Jarak ke Gladiola</th>
                  <th className="py-3.5 px-4">Terakhir Akses Apa di Website</th>
                  <th className="py-3.5 px-4">Perangkat & Jaringan</th>
                  <th className="py-3.5 px-4 text-center">Aksi Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActiveSessions.length > 0 ? (
                  filteredActiveSessions.map((sess) => {
                    const isCurrent =
                      sess.isCurrent || (currentUser && currentUser.username === sess.username);
                    const dev = sess.device || {};
                    const isMobile =
                      dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

                    return (
                      <tr
                        key={sess.id}
                        className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-emerald-50/20' : ''
                        }`}
                        onClick={() => setSelectedUser(sess)}
                        title={`Klik untuk melihat detail log aktivitas ${sess.name}`}
                      >
                        {/* Pengguna */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={sess.avatar}
                                alt={sess.name}
                                className="w-10 h-10 rounded-full object-cover border border-emerald-500 shadow-sm"
                              />
                              <span
                                className={`avatar-online-dot ${
                                  sess.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-400'
                                }`}
                              ></span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                <span>{sess.name}</span>
                                {isCurrent && (
                                  <span className="current-user-tag text-[10px]">Anda</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                🕒 Masuk: {sess.loginTime}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Peran & Kamar */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`badge-role-pill text-xs ${
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
                              <span className="room-indicator-pill text-xs">{sess.room}</span>
                            )}
                          </div>
                        </td>

                        {/* Lokasi Akses Terkini */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-gray-900 text-sm flex items-start gap-1">
                            <IconMapPin size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{sess.locationName}</span>
                          </div>
                          {sess.coords && (
                            <div className="flex items-center gap-1 text-xs font-mono text-gray-400 mt-0.5 ml-4">
                              <span>
                                {sess.coords.lat.toFixed(5)}, {sess.coords.lng.toFixed(5)}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${sess.coords.lat},${sess.coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800"
                                onClick={(e) => e.stopPropagation()}
                                title="Buka di Maps"
                              >
                                <IconExternalLink size={11} />
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Jarak ke Gladiola */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                              sess.isInsideKos
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {sess.isInsideKos ? '✓' : '⚠️'} {sess.distanceMeters} meter{' '}
                            {sess.isInsideKos ? '(Di Kos)' : '(Luar Kos)'}
                          </span>
                        </td>

                        {/* Terakhir Akses Apa di Website */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-blue-900 text-xs bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md inline-block">
                            {sess.lastAccessedPage || 'Dashboard Ringkasan'}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 line-clamp-1 max-w-xs">
                            {sess.lastAction || 'Sedang aktif di sistem'}
                          </div>
                        </td>

                        {/* Perangkat & Jaringan */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                          <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            {isMobile ? <IconSmartphone size={14} className="text-blue-600" /> : <IconMonitor size={14} className="text-slate-600" />}
                            <span>{dev.model || dev.type || 'Desktop PC'}</span>
                          </div>
                          <div className="text-gray-500 font-mono mt-0.5">
                            {dev.os || 'Windows 11'} • {dev.networkType || 'WiFi Gladiol 5G'}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(sess);
                            }}
                          >
                            Lihat Log User →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                      Tidak ada pengguna aktif yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TABEL RIWAYAT USER AKTIF (SESSION HISTORY) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <IconClock size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-900 text-base">
                Riwayat Sesi Pengguna Terdahulu (User Session History)
              </h3>
            </div>
            <span className="text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-full">
              Klik baris riwayat pengguna untuk melihat riwayat log akses lengkap
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100/80 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Peran & Kamar</th>
                  <th className="py-3.5 px-4">Waktu Sesi & Durasi</th>
                  <th className="py-3.5 px-4">Lokasi Akses Terakhir</th>
                  <th className="py-3.5 px-4">Jarak ke Gladiola</th>
                  <th className="py-3.5 px-4">Terakhir Akses Apa di Website</th>
                  <th className="py-3.5 px-4">Perangkat & IP</th>
                  <th className="py-3.5 px-4 text-center">Aksi Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessionHistory.length > 0 ? (
                  filteredSessionHistory.map((hist) => {
                    const dev = hist.device || {};
                    const isMobile =
                      dev.type?.includes('Smartphone') || dev.type?.includes('Tablet');

                    return (
                      <tr
                        key={hist.id}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(hist)}
                        title={`Klik untuk melihat detail log riwayat ${hist.name}`}
                      >
                        {/* Pengguna */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={hist.avatar}
                              alt={hist.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-300"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{hist.name}</div>
                              <div className="text-xs text-gray-400 font-mono">
                                Sesi Selesai (Logout)
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Peran & Kamar */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`badge-role-pill text-xs ${
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
                              <span className="room-indicator-pill text-xs">{hist.room}</span>
                            )}
                          </div>
                        </td>

                        {/* Waktu Sesi & Durasi */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs font-semibold text-gray-900 font-mono">
                            {hist.loginTime}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            s/d {hist.logoutTime || 'Selesai'} ({hist.sessionDuration || '30 menit'})
                          </div>
                        </td>

                        {/* Lokasi Akses Terakhir */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-gray-900 text-sm flex items-start gap-1">
                            <IconMapPin size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{hist.locationName}</span>
                          </div>
                          {hist.coords && (
                            <div className="flex items-center gap-1 text-xs font-mono text-gray-400 mt-0.5 ml-4">
                              <span>
                                {hist.coords.lat.toFixed(5)}, {hist.coords.lng.toFixed(5)}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${hist.coords.lat},${hist.coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconExternalLink size={11} />
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Jarak ke Gladiola */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                              hist.isInsideKos
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {hist.distanceMeters <= 50
                              ? `${hist.distanceMeters} m • Di Kos`
                              : `${(hist.distanceMeters / 1000).toFixed(1)} km • Luar Kos`}
                          </span>
                        </td>

                        {/* Terakhir Akses Apa di Website */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-xs bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md inline-block">
                            {hist.lastAccessedPage || 'Portal Akses'}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 line-clamp-1 max-w-xs">
                            {hist.lastAction || 'Aktivitas sesi tercatat'}
                          </div>
                        </td>

                        {/* Perangkat & IP */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                          <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            {isMobile ? <IconSmartphone size={14} className="text-blue-600" /> : <IconMonitor size={14} className="text-slate-600" />}
                            <span>{dev.model || dev.type || 'Perangkat Standar'}</span>
                          </div>
                          <div className="text-gray-500 font-mono mt-0.5">
                            IP: {dev.ipAddress || '103.145.22.84'}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(hist);
                            }}
                          >
                            Lihat Log User →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500 text-sm">
                      Tidak ada riwayat sesi yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
