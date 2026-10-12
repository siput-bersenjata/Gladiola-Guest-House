import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconPayment,
  IconCheck,
  IconClock,
  IconSearch,
  IconCopy,
  IconExternalLink,
  IconShield,
  IconLightning,
  IconPlus,
  IconX
} from './Icons';

export const PembayaranView = () => {
  const {
    tenants,
    payments,
    handleValidatePayment,
    generateMonthlyBills,
    handleBulkValidateMonth,
    currentUser,
    bankInfo,
    addToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('Oktober 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProof, setPreviewProof] = useState(null);
  const [isCustomMonthModalOpen, setIsCustomMonthModalOpen] = useState(false);
  const [customMonthInput, setCustomMonthInput] = useState('');

  const canValidate =
    currentUser.role === 'operator' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'owner';

  // Preset list of active billing months
  const presetMonths = [
    'Oktober 2026',
    'November 2026',
    'Desember 2026',
    'Januari 2027',
    'Februari 2027',
    'Maret 2027',
    'September 2026',
    'Agustus 2026',
    'Juli 2026'
  ];

  // Distinct list of all available months across payments and presets
  const availableMonths = useMemo(() => {
    const set = new Set(presetMonths);
    payments.forEach((p) => {
      if (p.month) set.add(p.month.trim());
    });
    return Array.from(set);
  }, [payments]);

  // When filterMonth changes and is not 'all', automatically generate bills for all active tenants!
  useEffect(() => {
    if (filterMonth && filterMonth !== 'all' && filterMonth !== '__custom__') {
      const added = generateMonthlyBills(filterMonth);
      if (added > 0) {
        addToast(
          `${added} tagihan baru bulan ${filterMonth} berhasil diterbitkan untuk semua penghuni aktif!`,
          'success'
        );
      }
    }
  }, [filterMonth]);

  // Handle month dropdown change
  const handleMonthChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomMonthModalOpen(true);
    } else {
      setFilterMonth(val);
    }
  };

  // Submit custom month
  const handleAddCustomMonth = (e) => {
    e.preventDefault();
    if (!customMonthInput.trim()) {
      addToast('Silakan masukkan nama bulan dan tahun (contoh: April 2027)', 'error');
      return;
    }
    const cleanMonth = customMonthInput.trim();
    setFilterMonth(cleanMonth);
    const added = generateMonthlyBills(cleanMonth);
    addToast(
      `Bulan ${cleanMonth} dipilih! ${added > 0 ? `${added} tagihan diterbitkan.` : 'Tagihan siap divalidasi.'}`,
      'success'
    );
    setCustomMonthInput('');
    setIsCustomMonthModalOpen(false);
  };

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Status filter
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;

        // Month filter
        const matchMonth =
          filterMonth === 'all' ||
          p.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
          p.month.toLowerCase().includes(filterMonth.toLowerCase().trim());

        // Search query filter (room number, tenant name, phone, id)
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          (p.roomNumber && p.roomNumber.toLowerCase().includes(q)) ||
          (p.tenantName && p.tenantName.toLowerCase().includes(q)) ||
          (p.tenantPhone && p.tenantPhone.toLowerCase().includes(q)) ||
          (p.id && p.id.toLowerCase().includes(q));

        return matchStatus && matchMonth && matchSearch;
      })
      .sort((a, b) => {
        // Sort by room number numerically (101, 102, ... 201 ... 309)
        const numA = parseInt(a.roomNumber) || 999;
        const numB = parseInt(b.roomNumber) || 999;
        return numA - numB;
      });
  }, [payments, filterStatus, filterMonth, searchQuery]);

  // Financial and occupancy metrics for the active filter month
  const metrics = useMemo(() => {
    const monthBills =
      filterMonth === 'all'
        ? payments
        : payments.filter(
            (p) =>
              p.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
              p.month.toLowerCase().includes(filterMonth.toLowerCase().trim())
          );

    const totalCount = monthBills.length;
    const totalAmount = monthBills.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const verified = monthBills.filter((p) => p.status === 'Tervalidasi');
    const verifiedCount = verified.length;
    const verifiedAmount = verified.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const pending = monthBills.filter((p) => p.status === 'Menunggu Validasi');
    const pendingCount = pending.length;
    const pendingAmount = pending.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const unpaid = monthBills.filter((p) => p.status === 'Belum Bayar');
    const unpaidCount = unpaid.length;
    const unpaidAmount = unpaid.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const percentage = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalAmount,
      verifiedCount,
      verifiedAmount,
      pendingCount,
      pendingAmount,
      unpaidCount,
      unpaidAmount,
      percentage
    };
  }, [payments, filterMonth]);

  // Force trigger bill generation for current month
  const handleManualGenerate = () => {
    if (filterMonth === 'all') {
      addToast('Pilih bulan spesifik di dropdown untuk menerbitkan tagihan.', 'info');
      return;
    }
    const added = generateMonthlyBills(filterMonth);
    if (added > 0) {
      addToast(
        `Berhasil menerbitkan ${added} tagihan baru untuk bulan ${filterMonth}!`,
        'success'
      );
    } else {
      addToast(
        `Semua penghuni aktif sudah memiliki tagihan lengkap untuk bulan ${filterMonth}.`,
        'info'
      );
    }
  };

  // Bulk validate confirmation
  const handleBulkValidateConfirm = () => {
    if (filterMonth === 'all') {
      addToast('Pilih bulan spesifik di dropdown sebelum validasi massal.', 'info');
      return;
    }
    const unvalidatedCount = metrics.unpaidCount + metrics.pendingCount;
    if (unvalidatedCount === 0) {
      addToast(`Semua tagihan untuk bulan ${filterMonth} sudah berstatus Tervalidasi.`, 'info');
      return;
    }

    if (
      window.confirm(
        `Validasi dan lunaskan seluruh ${unvalidatedCount} tagihan sewa bulan ${filterMonth}?`
      )
    ) {
      handleBulkValidateMonth(filterMonth);
    }
  };

  return (
    <div className="pembayaran-container">
      {/* Header Info Banner */}
      <div className="bank-summary-card">
        <div className="bank-summary-left">
          <div className="icon-badge-box bg-warm-tint">
            <IconPayment size={24} className="text-warm-gold" />
          </div>
          <div>
            <h3 className="card-headline">Rekening Resmi Pembayaran Kos Gladiola</h3>
            <p className="card-subheadline">
              {bankInfo.bankName}: <strong>{bankInfo.accountNumber}</strong> a/n {bankInfo.accountHolder}
            </p>
          </div>
        </div>
        <div className="bank-summary-right">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => {
              navigator.clipboard.writeText(bankInfo.accountNumber);
              addToast('Nomor rekening berhasil disalin!', 'info');
            }}
          >
            <IconCopy size={15} />
            <span>Salin No. Rekening</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="pembayaran-stats-grid">
        <div className="pembayaran-stat-card card-primary">
          <span className="stat-metric-label">Total Tagihan ({filterMonth === 'all' ? 'Semua' : filterMonth})</span>
          <span className="stat-metric-value">{metrics.totalCount} Kamar</span>
          <span className="stat-metric-subtext">Rp {metrics.totalAmount.toLocaleString('id-ID')}</span>
        </div>

        <div className="pembayaran-stat-card card-success">
          <span className="stat-metric-label">Tervalidasi (Lunas)</span>
          <span className="stat-metric-value">{metrics.verifiedCount} Lunas ({metrics.percentage}%)</span>
          <span className="stat-metric-subtext">Rp {metrics.verifiedAmount.toLocaleString('id-ID')}</span>
        </div>

        <div className="pembayaran-stat-card card-warning">
          <span className="stat-metric-label">Menunggu Validasi</span>
          <span className="stat-metric-value">{metrics.pendingCount} Bukti</span>
          <span className="stat-metric-subtext">Rp {metrics.pendingAmount.toLocaleString('id-ID')}</span>
        </div>

        <div className="pembayaran-stat-card card-info">
          <span className="stat-metric-label">Belum Bayar</span>
          <span className="stat-metric-value">{metrics.unpaidCount} Kamar</span>
          <span className="stat-metric-subtext">Rp {metrics.unpaidAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          {/* Search Box */}
          <div className="search-box-pill">
            <IconSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari kamar / nama / nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Month Selector */}
          <select
            className="filter-select"
            value={filterMonth}
            onChange={handleMonthChange}
            title="Pilih Bulan Penagihan"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                Bulan: {m}
              </option>
            ))}
            <option value="all">Semua Bulan (Riwayat Lengkap)</option>
            <option value="__custom__">+ Tambah / Pilih Bulan Baru...</option>
          </select>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Tervalidasi">Tervalidasi (Lunas)</option>
            <option value="Menunggu Validasi">Menunggu Validasi</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>

        {/* Operator Quick Action Buttons */}
        {canValidate && (
          <div className="toolbar-search-group">
            {filterMonth !== 'all' && (
              <button
                type="button"
                className="btn-generate-bills"
                onClick={handleManualGenerate}
                title="Pastikan semua penghuni aktif memiliki tagihan di bulan ini"
              >
                <IconLightning size={16} />
                <span>Terbitkan Tagihan {filterMonth}</span>
              </button>
            )}

            {filterMonth !== 'all' && metrics.unpaidCount + metrics.pendingCount > 0 && (
              <button
                type="button"
                className="btn-bulk-validate"
                onClick={handleBulkValidateConfirm}
                title="Validasi seluruh tagihan yang belum lunas dalam 1 klik"
              >
                <IconCheck size={16} />
                <span>Validasi Semua ({metrics.unpaidCount + metrics.pendingCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan & ID</th>
                <th>Penghuni & Kamar</th>
                <th>Nominal Sewa</th>
                <th>Metode Bayar</th>
                <th>Waktu Bayar</th>
                <th>Bukti Transfer</th>
                <th>Status</th>
                <th>Validasi Oleh</th>
                {canValidate && <th>Tindakan Operator</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id}>
                    <td>
                      <div>
                        <strong className="text-gray-900">{pay.month}</strong>
                        <span className="tenant-subtext">{pay.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tenant-cell-info">
                        <span className="room-badge-small">Kamar {pay.roomNumber}</span>
                        <div>
                          <span className="font-semibold text-gray-900">{pay.tenantName}</span>
                          <span className="tenant-subtext">{pay.tenantPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="font-bold text-gray-900">
                      Rp {pay.amount.toLocaleString('id-ID')}
                    </td>
                    <td>{pay.paymentMethod || 'Belum Transfer'}</td>
                    <td className="text-sm text-gray-600">{pay.paidAt || '-'}</td>
                    <td>
                      {pay.proofUrl ? (
                        <button
                          type="button"
                          className="btn-view-proof"
                          onClick={() => setPreviewProof(pay)}
                        >
                          Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Tidak ada</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${
                          pay.status === 'Tervalidasi'
                            ? 'badge-success'
                            : pay.status === 'Menunggu Validasi'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {pay.status === 'Tervalidasi' && '✓ '}
                        {pay.status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-600">
                      {pay.validatedBy ? (
                        <div>
                          <strong>{pay.validatedBy}</strong>
                          <div className="text-gray-400">{pay.validatedAt}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    {canValidate && (
                      <td>
                        <div className="action-buttons-row">
                          {pay.status !== 'Tervalidasi' && (
                            <button
                              type="button"
                              className="btn-validate-approve"
                              onClick={() => handleValidatePayment(pay.id, 'Tervalidasi')}
                              title="Validasi & Setujui Pembayaran"
                            >
                              <IconCheck size={14} />
                              <span>Validasi</span>
                            </button>
                          )}

                          {pay.status === 'Menunggu Validasi' && (
                            <button
                              type="button"
                              className="btn-validate-reject"
                              onClick={() => handleValidatePayment(pay.id, 'Belum Bayar')}
                              title="Tolak Bukti Pembayaran"
                            >
                              Tolak
                            </button>
                          )}

                          {pay.status === 'Tervalidasi' && (
                            <button
                              type="button"
                              className="btn-revert-validation"
                              onClick={() => {
                                if (window.confirm(`Batalkan status validasi untuk Kamar ${pay.roomNumber}?`)) {
                                  handleValidatePayment(pay.id, 'Belum Bayar');
                                }
                              }}
                              title="Batalkan validasi (kembalikan ke Belum Bayar)"
                            >
                              <span>↺ Batal</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canValidate ? 9 : 8} className="text-center py-8 text-gray-500">
                    Tidak ada transaksi pembayaran pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Month Picker Modal */}
      {isCustomMonthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomMonthModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-section-header">
              <div>
                <h3 className="modal-title">Terbitkan Tagihan Bulan Baru</h3>
                <p className="modal-subtitle">
                  Masukkan bulan dan tahun penagihan sewa baru untuk seluruh penghuni kos aktif.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddCustomMonth}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Nama Bulan & Tahun</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: November 2026, Desember 2026, dll"
                  value={customMonthInput}
                  onChange={(e) => setCustomMonthInput(e.target.value)}
                  autoFocus
                  required
                />
                <span className="field-hint">
                  Sistem akan otomatis membuat tagihan sewa bagi seluruh {tenants.filter(t => t.status === 'Aktif').length} penghuni kos aktif.
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setIsCustomMonthModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  <IconLightning size={16} />
                  <span>Terbitkan Tagihan Bulan Ini</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {previewProof && (
        <div className="modal-overlay" onClick={() => setPreviewProof(null)}>
          <div className="modal-content-card proof-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Bukti Transfer Pembayaran Kos</h3>
            <p className="modal-subtitle">
              {previewProof.tenantName} — Kamar {previewProof.roomNumber} ({previewProof.month})
            </p>

            <div className="proof-img-wrapper">
              <img
                src={previewProof.proofUrl}
                alt="Bukti Transfer"
                className="proof-img-modal"
              />
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPreviewProof(null)}
              >
                Tutup
              </button>
              {canValidate && previewProof.status !== 'Tervalidasi' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    handleValidatePayment(previewProof.id, 'Tervalidasi');
                    setPreviewProof(null);
                  }}
                >
                  <IconCheck size={16} />
                  <span>Validasi & Setujui Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
