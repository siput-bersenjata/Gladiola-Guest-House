import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconUsers,
  IconLeaf,
  IconPayment,
  IconLightning,
  IconMapPin,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconShield
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

  // Compute live statistics
  const totalOccupied = rooms.filter((r) => r.status === 'Terisi').length;
  const totalBooking = rooms.filter((r) => r.status === 'Booking').length;
  const totalVacant = rooms.filter((r) => r.status === 'Kosong').length;
  const totalRoomsCount = rooms.length;
  const occupancyRate = Math.round((totalOccupied / totalRoomsCount) * 100);

  // Total verified payments this month (Rp in Millions)
  const currentMonthRentSum = payments
    .filter((p) => p.month.includes('Oktober') && p.status === 'Tervalidasi')
    .reduce((sum, p) => sum + p.amount, 0);

  // Total electricity this month
  const currentMonthElecSum = electricityBills
    .filter((b) => b.month.includes('Oktober'))
    .reduce((sum, b) => sum + b.totalBill, 0);

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
      {/* 4 Stat Cards Row - Exactly as in reference image */}
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
            <span className="stat-card-value">48</span>
          </div>
          <div className="stat-delta-row green">
            <span className="delta-arrow">▲</span>
            <span>+3 penyewa bulan ini</span>
          </div>
        </div>

        {/* Card 2: Tingkat Okupansi */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box bg-green-tint">
              <IconLeaf size={22} className="text-primary-green" />
            </div>
          </div>
          <span className="stat-card-label">TINGKAT OKUPANSI</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">{occupancyRate}%</span>
          </div>
          <div className="stat-delta-row blue">
            <span className="delta-arrow">▲</span>
            <span>+5% dari bulan lalu</span>
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
            <span className="stat-card-value">Rp 22,5jt</span>
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
            <span className="stat-card-value">Rp 3,2jt</span>
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
            <strong>Total: Rp 22,5jt</strong>
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
