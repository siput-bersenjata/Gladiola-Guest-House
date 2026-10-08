import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconLightning,
  IconPlus,
  IconCheck,
  IconClock,
  IconSearch
} from './Icons';

export const UtilitasView = () => {
  const {
    electricityBills,
    rooms,
    tenants,
    handleSaveElectricityBill,
    currentUser
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(false);
  };

  const filteredBills = electricityBills.filter((b) => {
    const matchMonth = filterMonth === 'all' || b.month.includes(filterMonth);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchMonth && matchStatus;
  });

  const totalKwh = filteredBills.reduce((acc, b) => acc + b.kwhUsage, 0);
  const totalRupiah = filteredBills.reduce((acc, b) => acc + b.totalBill, 0);

  return (
    <div className="utilitas-container">
      {/* Summary Cards */}
      <div className="utilitas-summary-grid">
        <div className="stat-card">
          <span className="stat-card-label">TOTAL PENGGUNAAN LISTRIK</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value">{totalKwh.toLocaleString('id-ID')} kWh</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Tarif resmi subsidi kos: Rp 1.650 / kWh</p>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">TOTAL TAGIHAN LISTRIK BULAN INI</span>
          <div className="stat-card-val-row">
            <span className="stat-card-value text-primary-green">
              Rp {totalRupiah.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">Tercatat di meteran digital setiap kamar</p>
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
            <option value="Oktober">Oktober 2026</option>
            <option value="September">September 2026</option>
            <option value="Agustus">Agustus 2026</option>
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

        {currentUser.role !== 'owner' && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <IconPlus size={16} />
            <span>Input Meteran Listrik Baru</span>
          </button>
        )}
      </div>

      {/* Electricity Bills Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan & Periode</th>
                <th>Kamar & Penghuni</th>
                <th>Meter Awal</th>
                <th>Meter Akhir</th>
                <th>Pemakaian (kWh)</th>
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

      {/* Input Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <h3 className="modal-title">Input Meteran Listrik Bulanan</h3>
            <p className="modal-subtitle">
              Pencatatan angka kWh meteran kamar penghuni Gladiola Guest House
            </p>

            <form onSubmit={handleSubmit} className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Pilih Kamar *</label>
                <select
                  className="form-select"
                  value={formData.roomNumber}
                  onChange={(e) => handleRoomChange(e.target.value)}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.number}>
                      Kamar {r.number} ({r.currentTenant || 'Kosong'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Periode Bulan *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Angka Meter Awal (kWh) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.meterStart}
                  onChange={(e) => setFormData({ ...formData, meterStart: e.target.value })}
                  required
                />
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
              </div>

              <div className="form-group">
                <label className="form-label">Tarif per kWh (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.ratePerKwh}
                  onChange={(e) => setFormData({ ...formData, ratePerKwh: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status Pembayaran</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>

              {/* Live Calculation Preview */}
              <div className="calculation-preview-box full-width">
                <div className="calc-row">
                  <span>Pemakaian Bersih:</span>
                  <strong>{kwhUsage} kWh</strong>
                </div>
                <div className="calc-row">
                  <span>Total Tagihan Listrik:</span>
                  <strong className="text-primary-green">
                    Rp {totalBill.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <IconCheck size={16} />
                  <span>Simpan Tagihan Listrik</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
