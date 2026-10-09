import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconLightning,
  IconPlus,
  IconCheck,
  IconClock,
  IconSearch,
  IconArrowLeft,
  IconRoom
} from './Icons';
import { SearchableRoomSelect } from './SearchableRoomSelect';

export const UtilitasView = () => {
  const {
    electricityBills,
    rooms,
    tenants,
    handleSaveElectricityBill,
    currentUser
  } = useApp();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '102',
    tenantName: 'Rizky Ramadhan',
    tenantPhone: '081233445566',
    month: 'Oktober 2026',
    meterStart: 1240,
    meterEnd: 1320,
    ratePerKwh: 1650,
    status: 'Belum Bayar'
  });

  const kwhUsage = Math.max(0, formData.meterEnd - formData.meterStart);
  const totalBill = kwhUsage * formData.ratePerKwh;

  const handleRoomChange = (roomNum) => {
    const tenant = tenants.find((t) => t.roomNumber === roomNum);
    setFormData({
      ...formData,
      roomNumber: roomNum,
      tenantName: tenant ? tenant.name : `Penghuni Kamar ${roomNum}`,
      tenantPhone: tenant ? tenant.phone : '-'
    });
  };

  const openInputForm = () => {
    setViewMode('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveElectricityBill({
      roomNumber: formData.roomNumber,
      tenantName: formData.tenantName,
      tenantPhone: formData.tenantPhone,
      month: formData.month,
      meterStart: parseInt(formData.meterStart) || 0,
      meterEnd: parseInt(formData.meterEnd) || 0,
      kwhUsage,
      ratePerKwh: parseInt(formData.ratePerKwh) || 1650,
      totalBill,
      status: formData.status,
      paidAt: formData.status === 'Lunas' ? new Date().toLocaleString('id-ID') : null
    });
    setViewMode('list');
  };

  const filteredBills = electricityBills.filter((b) => {
    const matchMonth = filterMonth === 'all' || b.month.includes(filterMonth);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchMonth && matchStatus;
  });

  // =========================================================================
  // DEDICATED FULL-PAGE FORM VIEW (NO CUT-OFF POPUP MODAL)
  // =========================================================================
  if (viewMode === 'form') {
    return (
      <div className="form-page-container">
        {/* Top Navigation & Breadcrumb */}
        <div className="form-page-topbar">
          <button
            type="button"
            className="btn-back-nav"
            onClick={() => setViewMode('list')}
          >
            <IconArrowLeft size={18} />
            <span>Kembali ke Data Utilitas & Listrik</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">Input Pencatatan Meteran Listrik Bulanan</h2>
            <p className="form-page-subheading">
              Catat angka stand meter awal & akhir kWh per kamar penghuni untuk menghitung total tagihan otomatis.
            </p>
          </div>
        </div>

        {/* Dedicated Full Form Card */}
        <div className="form-page-card">
          <form onSubmit={handleSubmit} className="form-page-content">
            {/* Section 1: Pemilihan Kamar & Periode */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconRoom size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Kamar & Penghuni</h3>
                  <p className="form-section-subtitle">
                    Pilih nomor kamar target pencatatan meteran listrik
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Pilih Kamar * (Pencarian Cepat)</label>
                  <SearchableRoomSelect
                    rooms={rooms}
                    value={formData.roomNumber}
                    onChange={(roomNum) => handleRoomChange(roomNum)}
                    placeholder="Pilih atau cari nomor kamar..."
                  />
                  <span className="field-hint">Penghuni terhubung otomatis: <strong>{formData.tenantName}</strong> ({formData.tenantPhone})</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Periode Bulan Penagihan *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    placeholder="Contoh: Oktober 2026"
                    required
                  />
                  <span className="field-hint">Bulan buku pencatatan meteran</span>
                </div>
              </div>
            </div>

            {/* Section 2: Angka Meteran & Tarif */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconLightning size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Stand Meteran Listrik & Tarif</h3>
                  <p className="form-section-subtitle">
                    Kalkulasi otomatis pemakaian kWh dan total tagihan
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Angka Meter Awal (kWh) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.meterStart}
                    onChange={(e) => setFormData({ ...formData, meterStart: e.target.value })}
                    required
                  />
                  <span className="field-hint">Stand meter bulan sebelumnya</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Angka Meter Akhir (kWh) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.meterEnd}
                    onChange={(e) => setFormData({ ...formData, meterEnd: e.target.value })}
                    required
                  />
                  <span className="field-hint">Stand meter saat pencatatan hari ini</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tarif Listrik per kWh (Rp) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.ratePerKwh}
                    onChange={(e) => setFormData({ ...formData, ratePerKwh: e.target.value })}
                    required
                  />
                  <span className="field-hint">Tarif standar Gladiola: Rp 1.650 / kWh</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Pembayaran</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Belum Bayar">Belum Bayar (Menunggu Pelunasan)</option>
                    <option value="Lunas">Lunas (Sudah Dibayarkan)</option>
                  </select>
                </div>
              </div>

              {/* Live Calculation Preview Box */}
              <div className="calculation-preview-box mt-4">
                <div className="calc-row">
                  <span>Pemakaian Bersih Listrik:</span>
                  <strong className="text-base text-gray-900">{kwhUsage} kWh</strong>
                </div>
                <div className="calc-row">
                  <span>Total Tagihan Listrik:</span>
                  <strong className="text-xl text-primary-green">
                    Rp {totalBill.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="form-page-actions-bar">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setViewMode('list')}
              >
                Batal & Kembali
              </button>
              <button type="submit" className="btn-primary-action">
                <IconCheck size={18} />
                <span>Simpan Tagihan Listrik</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LIST VIEW
  // =========================================================================
  const totalKwh = electricityBills.reduce((acc, curr) => acc + curr.kwhUsage, 0);
  const totalRupiah = electricityBills.reduce((acc, curr) => acc + curr.totalBill, 0);

  return (
    <div className="utilitas-container">
      {/* Metric Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Pemakaian Listrik</span>
            <div className="stat-icon-wrap">
              <IconLightning size={20} />
            </div>
          </div>
          <div className="stat-value">{totalKwh.toLocaleString('id-ID')} kWh</div>
          <div className="stat-hint">Seluruh kamar terdata</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Tagihan Listrik</span>
            <div className="stat-icon-wrap">
              <IconLightning size={20} />
            </div>
          </div>
          <div className="stat-value">Rp {totalRupiah.toLocaleString('id-ID')}</div>
          <div className="stat-hint">Bulan Oktober 2026</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Tarif per kWh</span>
            <span className="badge-status badge-success">Standar</span>
          </div>
          <div className="stat-value">Rp 1.650</div>
          <div className="stat-hint">Tarif flat kos eksklusif</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          <select
            className="filter-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            <option value="Oktober 2026">Oktober 2026</option>
            <option value="September 2026">September 2026</option>
            <option value="Agustus 2026">Agustus 2026</option>
          </select>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openInputForm}
        >
          <IconPlus size={16} />
          <span>Input Meteran Listrik</span>
        </button>
      </div>

      {/* Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Kamar & Penghuni</th>
                <th>Meter Awal</th>
                <th>Meter Akhir</th>
                <th>Pemakaian</th>
                <th>Tarif/kWh</th>
                <th>Total Tagihan</th>
                <th>Status</th>
                <th>Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong className="text-gray-900">{b.month}</strong>
                    </td>
                    <td>
                      <div className="tenant-cell-info">
                        <span className="room-badge-small">Kmr {b.roomNumber}</span>
                        <div>
                          <strong className="text-gray-900">{b.tenantName}</strong>
                          <span className="tenant-subtext">{b.tenantPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td>{b.meterStart}</td>
                    <td>{b.meterEnd}</td>
                    <td>
                      <span className="badge-pill-outline">{b.kwhUsage} kWh</span>
                    </td>
                    <td>Rp {b.ratePerKwh.toLocaleString('id-ID')}</td>
                    <td className="font-bold text-gray-900">
                      Rp {b.totalBill.toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          b.status === 'Lunas' ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {b.status === 'Lunas' ? '✓ Lunas' : b.status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{b.recordedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    Belum ada data pencatatan meteran listrik pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
