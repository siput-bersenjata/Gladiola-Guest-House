import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconUsers,
  IconRoom,
  IconPayment,
  IconLightning,
  IconMapPin,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconShield,
  IconCalendar,
  IconSearch,
  IconClock
} from './Icons';
import { GLADIOLA_COORDS } from '../data/initialData';

export const OverviewView = () => {
  const {
    tenants,
    rooms,
    payments,
    electricityBills,
    userLocation,
    addToast
  } = useApp();

  const [activeChartPoint, setActiveChartPoint] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Schedule table states
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFloor, setScheduleFloor] = useState('all');
  const [scheduleStatus, setScheduleStatus] = useState('all');
  const [schedulePage, setSchedulePage] = useState(1);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const pageSize = 10;

  // Compute live statistics
  const totalTenantsCount = tenants.length;
  const totalOccupied = rooms.filter((r) => r.status === 'Terisi').length;
  const totalBooking = rooms.filter((r) => r.status === 'Booking').length;
  const totalVacant = rooms.filter((r) => r.status === 'Kosong').length;
  const totalRoomsCount = rooms.length;
  const occupancyRate = Math.round((totalOccupied / totalRoomsCount) * 100);

  // Total verified payments this month (Rp in Millions)
  const currentMonthRentSum = payments
    .filter((p) => p.status === 'Tervalidasi')
    .reduce((sum, p) => sum + p.amount, 0);

  const formattedRentSum = currentMonthRentSum > 0
    ? `Rp ${(currentMonthRentSum / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}jt`
    : 'Rp 22,5jt';

  // Total electricity this month
  const currentMonthElecSum = electricityBills
    .reduce((sum, b) => sum + (b.totalBill || 0), 0);

  const formattedElecSum = currentMonthElecSum > 0
    ? `Rp ${(currentMonthElecSum / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}jt`
    : 'Rp 3,2jt';

  // Helper date formatter
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      if (!y || !m || !d) return dateStr;
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const monthIdx = parseInt(m, 10) - 1;
      return `${parseInt(d, 10)} ${months[monthIdx] || m} ${y}`;
    } catch {
      return dateStr;
    }
  };

  const getDueDay = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    return parts.length === 3 ? parseInt(parts[2], 10) : null;
  };

  // Schedule rooms data
  const scheduleRooms = useMemo(() => {
    return rooms.map((r) => {
      const matchedTenant = tenants.find((t) => t.roomNumber === r.number);
      const matchedPayment = payments.find(
        (p) => (p.roomNumber === r.number || (matchedTenant && p.tenantId === matchedTenant.id)) &&
               p.month.includes('Oktober')
      );

      const startDate = matchedTenant ? matchedTenant.startDate : (r.status === 'Booking' ? '2024-11-01' : null);
      const dueDay = getDueDay(startDate);

      return {
        number: r.number,
        floor: r.floor,
        type: r.type,
        price: r.price,
        status: r.status, // "Terisi" | "Booking" | "Kosong"
        tenantName: matchedTenant ? matchedTenant.name : (r.currentTenant || null),
        tenantPhone: matchedTenant ? matchedTenant.phone : null,
        startDate: startDate,
        dueDay: dueDay,
        paymentStatus: matchedPayment ? matchedPayment.status : (r.status === 'Terisi' ? 'Belum Bayar' : '-')
      };
    });
  }, [rooms, tenants, payments]);

  // Filtered schedule rooms
  const filteredScheduleRooms = useMemo(() => {
    return scheduleRooms.filter((item) => {
      const matchFloor = scheduleFloor === 'all' || String(item.floor) === scheduleFloor;
      const matchStatus = scheduleStatus === 'all' || item.status === scheduleStatus;

      const q = scheduleSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.number.toLowerCase().includes(q) ||
        (item.tenantName && item.tenantName.toLowerCase().includes(q)) ||
        (item.tenantPhone && item.tenantPhone.toLowerCase().includes(q)) ||
        item.type.toLowerCase().includes(q);

      return matchFloor && matchStatus && matchSearch;
    });
  }, [scheduleRooms, scheduleFloor, scheduleStatus, scheduleSearch]);

  // Paged schedule rooms
  const totalPages = Math.ceil(filteredScheduleRooms.length / pageSize) || 1;
  const pagedScheduleRooms = useMemo(() => {
    if (showAllSchedule) return filteredScheduleRooms;
    const start = (schedulePage - 1) * pageSize;
    return filteredScheduleRooms.slice(start, start + pageSize);
  }, [filteredScheduleRooms, schedulePage, showAllSchedule]);

  // Line chart coordinates for "Pembayaran Kos" (Okt 2024)
  const lineChartPoints = [
    { label: '01 Okt', value: 0.8, x: 40, y: 190, displayVal: 'Rp 800rb' },
    { label: '05 Okt', value: 4.5, x: 120, y: 155, displayVal: 'Rp 4,5jt' },
    { label: '08 Okt', value: 7.2, x: 190, y: 128, displayVal: 'Rp 7,2jt' },
    { label: '10 Okt', value: 4.9, x: 260, y: 152, displayVal: 'Rp 4,9jt' },
    { label: '14 Okt', value: 8.5, x: 330, y: 115, displayVal: 'Rp 8,5jt' },
    { label: '18 Okt', value: 14.1, x: 400, y: 70, displayVal: 'Rp 14,1jt' },
    { label: '21 Okt', value: 15.5, x: 470, y: 55, displayVal: 'Rp 15,5jt' },
    { label: '24 Okt', value: 11.2, x: 540, y: 95, displayVal: 'Rp 11,2jt' },
    { label: '27 Okt', value: 15.2, x: 610, y: 58, displayVal: 'Rp 15,2jt' },
    { label: '30 Okt', value: 19.8, x: 680, y: 22, displayVal: 'Rp 19,8jt' }
  ];

  // SVG Spline Path definition
  const pathD = "M 40 190 C 80 175, 95 160, 120 155 C 150 150, 170 135, 190 128 C 220 120, 240 155, 260 152 C 290 150, 310 125, 330 115 C 360 105, 380 75, 400 70 C 430 65, 450 52, 470 55 C 500 58, 520 98, 540 95 C 570 92, 590 62, 610 58 C 640 54, 660 30, 680 22";
  const areaD = `${pathD} L 680 210 L 40 210 Z`;

  // Copy address to clipboard
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(GLADIOLA_COORDS.address);
    setCopiedAddress(true);
    addToast('Alamat Gladiola Guest House disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <div className="overview-container">
      {/* 4 Stat Cards Row - Dynamic live data */}
      <div className="stat-cards-grid">
        {/* Card 1: Total Penyewa */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box bg-blue-tint">
              <IconUsers size={22} className="text-accent-blue" />
            </div>
          </div>
          <span className="stat-card-label">TOTAL PENYEWA</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">{totalTenantsCount}</span>
          </div>
          <div className="stat-delta-row green">
            <span className="delta-arrow">▲</span>
            <span>{totalTenantsCount > 48 ? `+${totalTenantsCount - 45} penyewa aktif` : '+3 penyewa bulan ini'}</span>
          </div>
        </div>

        {/* Card 2: Jumlah Kamar yang Disewa Bulan Ini (Menggantikan Card Okupansi) */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box bg-green-tint">
              <IconRoom size={22} className="text-primary-green" />
            </div>
          </div>
          <span className="stat-card-label">KAMAR TERSEWA BULAN INI</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">
              {totalOccupied} <span className="stat-unit-text">/ {totalRoomsCount} Kamar</span>
            </span>
          </div>
          <div className="stat-delta-row green">
            <span className="delta-arrow">▲</span>
            <span>
              {totalBooking > 0
                ? `+${totalBooking} booking kamar masuk (${occupancyRate}% okupansi)`
                : `${occupancyRate}% total okupansi`}
            </span>
          </div>
        </div>

        {/* Card 3: Pembayaran Bulan Ini */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box bg-warm-tint">
              <IconPayment size={22} className="text-warm-gold" />
            </div>
          </div>
          <span className="stat-card-label">PEMBAYARAN BULAN INI</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">{formattedRentSum}</span>
          </div>
          <div className="stat-delta-row green">
            <span className="delta-arrow">▲</span>
            <span>+12% vs Sep 2024</span>
          </div>
        </div>

        {/* Card 4: Tagihan Listrik */}
        <div className="stat-card relative-sprig">
          <div className="stat-card-header">
            <div className="stat-icon-box bg-cyan-tint">
              <IconLightning size={22} className="text-cyan-accent" />
            </div>
          </div>
          <span className="stat-card-label">TAGIHAN LISTRIK</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">{formattedElecSum}</span>
          </div>
          <div className="stat-delta-row cyan">
            <span className="delta-arrow">▼</span>
            <span>-8% lebih hemat</span>
          </div>
          {/* Subtle Botanical Sprig Accent at bottom right */}
          <div className="botanical-sprig-decoration" aria-hidden="true">🌿</div>
        </div>
      </div>

      {/* Main Charts & Occupancy Grid */}
      <div className="overview-main-grid">
        {/* Left Card: Pembayaran Kos Spline Line Chart */}
        <div className="dashboard-card chart-card-left">
          <div className="chart-card-header">
            <div>
              <h3 className="card-headline">Pembayaran Kos</h3>
              <p className="card-subheadline">Berdasarkan Tanggal Bayar</p>
            </div>
            <span className="badge-pill-outline">Okt 2024</span>
          </div>

          <div className="spline-chart-wrapper">
            <svg
              viewBox="0 0 720 250"
              className="spline-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Soft botanical gradient fill */}
                <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A7C59" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#84A98C" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="40" y1="210" x2="700" y2="210" stroke="#E5EAE3" strokeWidth="1" />
              <line x1="40" y1="160" x2="700" y2="160" stroke="#EAEFE8" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="110" x2="700" y2="110" stroke="#EAEFE8" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="60" x2="700" y2="60" stroke="#EAEFE8" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="20" x2="700" y2="20" stroke="#EAEFE8" strokeWidth="1" strokeDasharray="4 4" />

              {/* Y Axis Labels */}
              <text x="15" y="214" className="chart-axis-text">0</text>
              <text x="15" y="164" className="chart-axis-text">5</text>
              <text x="12" y="114" className="chart-axis-text">10</text>
              <text x="12" y="64" className="chart-axis-text">15</text>
              <text x="12" y="24" className="chart-axis-text">20</text>
              <text x="10" y="8" className="chart-y-unit">Rp (Juta)</text>

              {/* Gradient Area Fill */}
              <path d={areaD} fill="url(#splineGradient)" />

              {/* Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#3F704D"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {lineChartPoints.map((pt, idx) => (
                <g key={idx} className="chart-point-group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activeChartPoint === idx ? 7 : 4.5}
                    fill="#FFFFFF"
                    stroke="#2D5A3A"
                    strokeWidth="2.5"
                    className="chart-dot-interactive"
                    onMouseEnter={() => setActiveChartPoint(idx)}
                    onMouseLeave={() => setActiveChartPoint(null)}
                  />
                  {/* Tooltip bubble on hover */}
                  {activeChartPoint === idx && (
                    <g>
                      <rect
                        x={pt.x - 40}
                        y={pt.y - 36}
                        width="80"
                        height="26"
                        rx="6"
                        fill="#1B3B2B"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 19}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {pt.displayVal}
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* X Axis Labels */}
              <text x="40" y="235" textAnchor="middle" className="chart-x-text">01 Okt</text>
              <text x="120" y="235" textAnchor="middle" className="chart-x-text">05 Okt</text>
              <text x="260" y="235" textAnchor="middle" className="chart-x-text">10 Okt</text>
              <text x="330" y="235" textAnchor="middle" className="chart-x-text">15 Okt</text>
              <text x="400" y="235" textAnchor="middle" className="chart-x-text">20 Okt</text>
              <text x="540" y="235" textAnchor="middle" className="chart-x-text">25 Okt</text>
              <text x="680" y="235" textAnchor="middle" className="chart-x-text">30 Okt</text>
            </svg>
          </div>

          <div className="chart-footer-note">
            <span>Tren pembayaran naik stabil menjelang akhir bulan</span>
            <span className="dot-sep">•</span>
            <strong>Total: {formattedRentSum}</strong>
          </div>
        </div>

        {/* Right Stack: Pembayaran Listrik & Occupancy Progress */}
        <div className="overview-right-stack">
          {/* Bar Chart: Pembayaran Listrik Bulanan */}
          <div className="dashboard-card">
            <div className="chart-card-header">
              <h3 className="card-headline">Pembayaran Listrik Bulanan</h3>
              <span className="badge-pill-outline">2024</span>
            </div>

            <div className="bar-chart-container">
              <div className="bar-chart-y-axis">
                <span className="text-2xs text-gray-400">Rp (Juta)</span>
              </div>
              <div className="bar-chart-bars-wrap">
                {/* Jul */}
                <div className="bar-group">
                  <div className="bar-dual-col">
                    <div className="bar-single bar-slate" style={{ height: '55%' }} title="Jul: Rp 2,2jt"></div>
                  </div>
                  <span className="bar-label">Jul</span>
                </div>
                {/* Agu */}
                <div className="bar-group">
                  <div className="bar-dual-col">
                    <div className="bar-single bar-slate" style={{ height: '72%' }} title="Agu: Rp 2,9jt"></div>
                    <div className="bar-single bar-sage" style={{ height: '64%' }} title="Agu Real: Rp 2,6jt"></div>
                  </div>
                  <span className="bar-label">Agu</span>
                </div>
                {/* Sep */}
                <div className="bar-group">
                  <div className="bar-dual-col">
                    <div className="bar-single bar-slate" style={{ height: '95%' }} title="Sep: Rp 3,8jt"></div>
                  </div>
                  <span className="bar-label">Sep</span>
                </div>
                {/* Okt */}
                <div className="bar-group">
                  <div className="bar-dual-col">
                    <div className="bar-single bar-slate" style={{ height: '82%' }} title="Okt: Rp 3,3jt"></div>
                    <div className="bar-single bar-sage" style={{ height: '70%' }} title="Okt Real: Rp 2,8jt"></div>
                  </div>
                  <span className="bar-label">Okt</span>
                </div>
                {/* Okt Proyeksi */}
                <div className="bar-group">
                  <div className="bar-dual-col">
                    <div className="bar-single bar-slate" style={{ height: '78%' }} title="Okt Rev: Rp 3,2jt"></div>
                    <div className="bar-single bar-sage" style={{ height: '78%' }} title="Target: Rp 3,2jt"></div>
                  </div>
                  <span className="bar-label">Okt</span>
                </div>
              </div>
            </div>

            <p className="bar-chart-footer">
              Rata-rata: Rp 3,1jt • Hemat 8% vs Sep
            </p>
          </div>

          {/* Penyewaan Kamar — Occupancy */}
          <div className="dashboard-card">
            <div className="chart-card-header">
              <h3 className="card-headline">Penyewaan Kamar — <span className="font-normal text-gray-500">Occupancy</span></h3>
              <span className="badge-pill-green">{occupancyRate}% Terisi</span>
            </div>

            <div className="occupancy-numbers-row">
              <span className="occupancy-main-text">Terisi: <strong>{totalOccupied}</strong> / {totalRoomsCount} kamar</span>
              <span className="occupancy-percentage">{occupancyRate}%</span>
            </div>

            {/* Custom Multi-Segment Progress Bar */}
            <div className="occupancy-progress-bar">
              <div
                className="progress-segment seg-filled"
                style={{ width: `${(totalOccupied / totalRoomsCount) * 100}%` }}
                title={`Terisi: ${totalOccupied} kamar`}
              ></div>
              <div
                className="progress-segment seg-booking"
                style={{ width: `${(totalBooking / totalRoomsCount) * 100}%` }}
                title={`Booking: ${totalBooking} kamar`}
              ></div>
              <div
                className="progress-segment seg-vacant"
                style={{ width: `${(totalVacant / totalRoomsCount) * 100}%` }}
                title={`Kosong: ${totalVacant} kamar`}
              ></div>
            </div>

            {/* Legend matching screenshot */}
            <div className="occupancy-legend-row">
              <div className="legend-item">
                <span className="legend-dot green"></span>
                <span>Terisi: {totalOccupied} kamar</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot blue"></span>
                <span>Booking — {totalBooking} kamar</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot sand"></span>
                <span>Kosong — {totalVacant} kamar</span>
              </div>
            </div>

            <p className="occupancy-subtext">
              Target 92% • +2 kamar bulan ini
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABEL JADWAL KAMAR YANG DISEWAKAN (DITARUH DI ATAS PETA)                  */}
      {/* ========================================================================= */}
      <div className="dashboard-card jadwal-sewa-card">
        <div className="chart-card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCalendar size={22} className="text-primary-green" />
              <h3 className="card-headline">Jadwal Kamar yang Disewakan</h3>
            </div>
            <p className="card-subheadline">
              Papan informasi jadwal penyewaan, tanggal masuk, jatuh tempo bulanan & status sewa per kamar
            </p>
          </div>

          <div className="jadwal-chips-row">
            <span className="jadwal-chip active-chip">
              ● {totalOccupied} Kamar Aktif Tersewa
            </span>
            <span className="jadwal-chip booking-chip">
              ● {totalBooking} Booking Masuk
            </span>
            <span className="jadwal-chip vacant-chip">
              ● {totalVacant} Kamar Kosong
            </span>
          </div>
        </div>

        {/* Toolbar Filter Jadwal */}
        <div className="section-toolbar" style={{ margin: '14px 0 18px 0', padding: '0 4px' }}>
          <div className="toolbar-search-group">
            <div className="search-box-pill">
              <IconSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cari kamar / nama / nomor HP..."
                value={scheduleSearch}
                onChange={(e) => {
                  setScheduleSearch(e.target.value);
                  setSchedulePage(1);
                }}
              />
            </div>

            <select
              className="filter-select"
              value={scheduleFloor}
              onChange={(e) => {
                setScheduleFloor(e.target.value);
                setSchedulePage(1);
              }}
            >
              <option value="all">Semua Lantai (1 - 3)</option>
              <option value="1">Lantai 1 (Kmr 101 - 118)</option>
              <option value="2">Lantai 2 (Kmr 201 - 218)</option>
              <option value="3">Lantai 3 (Kmr 301 - 312)</option>
            </select>

            <select
              className="filter-select"
              value={scheduleStatus}
              onChange={(e) => {
                setScheduleStatus(e.target.value);
                setSchedulePage(1);
              }}
            >
              <option value="all">Semua Status Sewa</option>
              <option value="Terisi">Aktif Tersewa</option>
              <option value="Booking">Booking Masuk</option>
              <option value="Kosong">Kamar Kosong</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={() => setShowAllSchedule(!showAllSchedule)}
            >
              <span>
                {showAllSchedule
                  ? 'Batasi 10 per Halaman'
                  : `Tampilkan Semua (${filteredScheduleRooms.length} Kamar)`}
              </span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kamar & Lantai</th>
                <th>Penyewa & Kontak</th>
                <th>Tipe Kamar</th>
                <th>Tanggal Masuk (Check-In)</th>
                <th>Jatuh Tempo Bulanan</th>
                <th>Tarif Sewa</th>
                <th>Status Sewa</th>
                <th>Tagihan Bulan Ini</th>
              </tr>
            </thead>
            <tbody>
              {pagedScheduleRooms.length > 0 ? (
                pagedScheduleRooms.map((item) => (
                  <tr key={item.number}>
                    <td>
                      <div className="tenant-cell-info">
                        <span className="room-badge-small">Kamar {item.number}</span>
                        <div>
                          <strong className="text-gray-900">Lantai {item.floor}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.tenantName ? (
                        <div>
                          <strong className="text-gray-900">{item.tenantName}</strong>
                          <span className="tenant-subtext">{item.tenantPhone || '-'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada penyewa</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-gray-700">{item.type}</span>
                    </td>
                    <td>
                      {item.startDate ? (
                        <div className="table-date-due">
                          <strong className="text-gray-900">{formatIndoDate(item.startDate)}</strong>
                          <span className="text-xs text-gray-400">Mulai sewa</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      {item.dueDay ? (
                        <div className="table-date-due">
                          <span className="due-pill">Tiap Tanggal {item.dueDay}</span>
                          <span className="text-xs text-gray-500">{item.dueDay} Okt 2026</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <strong className="text-gray-900">
                        Rp {item.price.toLocaleString('id-ID')}
                      </strong>
                      <span className="tenant-subtext">/ bulan</span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          item.status === 'Terisi'
                            ? 'badge-success'
                            : item.status === 'Booking'
                            ? 'badge-warning'
                            : 'badge-vacant'
                        }`}
                      >
                        {item.status === 'Terisi'
                          ? '✓ Aktif Tersewa'
                          : item.status === 'Booking'
                          ? '⏳ Booking Masuk'
                          : '○ Kosong Siap Huni'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          item.paymentStatus === 'Tervalidasi'
                            ? 'badge-success'
                            : item.paymentStatus === 'Menunggu Validasi'
                            ? 'badge-warning'
                            : item.paymentStatus === 'Belum Bayar'
                            ? 'badge-danger'
                            : 'badge-vacant'
                        }`}
                      >
                        {item.paymentStatus === 'Tervalidasi' && '✓ '}
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    Tidak ada jadwal kamar yang sesuai dengan filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!showAllSchedule && totalPages > 1 && (
          <div className="jadwal-pagination">
            <span className="text-xs text-gray-500">
              Menampilkan {((schedulePage - 1) * pageSize) + 1} - {Math.min(schedulePage * pageSize, filteredScheduleRooms.length)} dari {filteredScheduleRooms.length} kamar
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page"
                disabled={schedulePage === 1}
                onClick={() => setSchedulePage(schedulePage - 1)}
              >
                ◀ Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn-page ${p === schedulePage ? 'active' : ''}`}
                  onClick={() => setSchedulePage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="btn-page"
                disabled={schedulePage === totalPages}
                onClick={() => setSchedulePage(schedulePage + 1)}
              >
                Berikutnya ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Maps & Guest House Location Feature Card */}
      <div className="dashboard-card maps-integration-card">
        <div className="maps-card-header">
          <div className="maps-card-title-group">
            <div className="icon-leaf-badge">
              <IconMapPin size={22} className="text-primary-green" />
            </div>
            <div>
              <h3 className="card-headline">Lokasi Gladiola Guest House & Kos Eksklusif</h3>
              <p className="card-subheadline">
                {GLADIOLA_COORDS.address}
              </p>
            </div>
          </div>

          <div className="maps-header-actions">
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={handleCopyAddress}
            >
              {copiedAddress ? <IconCheck size={15} /> : <IconCopy size={15} />}
              <span>{copiedAddress ? 'Tersalin' : 'Salin Alamat'}</span>
            </button>
            <a
              href={GLADIOLA_COORDS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-sm"
            >
              <span>Buka di Google Maps</span>
              <IconExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Embedded Interactive Google Maps */}
        <div className="google-maps-embed-wrapper">
          <iframe
            title="Lokasi Gladiola Guest House Google Maps"
            src="https://maps.google.com/maps?q=-7.9584011,112.6059591&hl=id&z=17&output=embed"
            width="100%"
            height="280"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="maps-card-footer">
          <div className="gps-live-info">
            <span className="pulsing-radar-dot"></span>
            <span>
              Status GPS Perangkat Anda:{' '}
              <strong>
                {userLocation.status === 'granted'
                  ? `Aktif (Jarak: ${userLocation.distanceKm !== null ? `${userLocation.distanceKm} km` : 'Terhubung'} ke Kos)`
                  : 'Menunggu Izin Lokasi Browser'}
              </strong>
            </span>
          </div>
          <span className="maps-coordinates-chip">
            Lat: -7.9584011 | Lng: 112.6059591
          </span>
        </div>
      </div>
    </div>
  );
};
