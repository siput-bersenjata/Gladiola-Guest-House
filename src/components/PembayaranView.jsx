import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { deduplicatePayments, getNextMonthName } from '../data/initialData';
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
  IconX,
  IconCalendar
} from './Icons';

export const PembayaranView = () => {
  const {
    tenants,
    payments,
    handleValidatePayment,
    handleValidateMultiMonthPayment,
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

  // Multi-Month Validation Modal State
  const [multiMonthModal, setMultiMonthModal] = useState({
    isOpen: false,
    payment: null,
    monthsCount: 3,
    method: 'Transfer Bank BCA'
  });

  // Table Sorting State (ASC / DESC on column headers)
  const [sortConfig, setSortConfig] = useState({
    key: 'roomNumber',
    direction: 'asc'
  });

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
    (payments || []).forEach((p) => {
      if (p.month) set.add(p.month.trim());
    });
    return Array.from(set);
  }, [payments]);

  // Clean deduplicated payments list (strictly enforces 1 bill per room per month)
  const cleanPaymentsList = useMemo(() => {
    return deduplicatePayments(payments || []);
  }, [payments]);

  // When filterMonth changes and is not 'all', quietly ensure all active rooms have bills ready
  useEffect(() => {
    if (filterMonth && filterMonth !== 'all' && filterMonth !== '__custom__') {
      generateMonthlyBills(filterMonth);
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
    generateMonthlyBills(cleanMonth);
    setCustomMonthInput('');
    setIsCustomMonthModalOpen(false);
  };

  // Toggle sorting by column
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filter payments
  const filteredPayments = useMemo(() => {
    return cleanPaymentsList.filter((p) => {
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
    });
  }, [cleanPaymentsList, filterStatus, filterMonth, searchQuery]);

  // Sort payments dynamically based on active column and direction (ASC / DESC)
  const sortedPayments = useMemo(() => {
    const list = [...filteredPayments];
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (key === 'roomNumber') {
        const numA = parseInt(a.roomNumber) || 0;
        const numB = parseInt(b.roomNumber) || 0;
        if (numA !== numB) return (numA - numB) * modifier;
        return (a.roomNumber || '').localeCompare(b.roomNumber || '') * modifier;
      }
      if (key === 'month') {
        const monthComp = (a.month || '').localeCompare(b.month || '');
        if (monthComp !== 0) return monthComp * modifier;
        return (a.id || '').localeCompare(b.id || '') * modifier;
      }
      if (key === 'tenantName') {
        return (a.tenantName || '').localeCompare(b.tenantName || '') * modifier;
      }
      if (key === 'amount') {
        return ((a.amount || 0) - (b.amount || 0)) * modifier;
      }
      if (key === 'paymentMethod') {
        return (a.paymentMethod || '').localeCompare(b.paymentMethod || '') * modifier;
      }
      if (key === 'paidAt') {
        if (!a.paidAt && b.paidAt) return 1 * modifier;
        if (a.paidAt && !b.paidAt) return -1 * modifier;
        return (a.paidAt || '').localeCompare(b.paidAt || '') * modifier;
      }
      if (key === 'proofUrl') {
        const hasA = a.proofUrl ? 1 : 0;
        const hasB = b.proofUrl ? 1 : 0;
        return (hasA - hasB) * modifier;
      }
      if (key === 'status') {
        const score = { Tervalidasi: 1, 'Menunggu Validasi': 2, 'Belum Bayar': 3 };
        const scoreA = score[a.status] || 99;
        const scoreB = score[b.status] || 99;
        return (scoreA - scoreB) * modifier;
      }
      if (key === 'validatedBy') {
        if (!a.validatedBy && b.validatedBy) return 1 * modifier;
        if (a.validatedBy && !b.validatedBy) return -1 * modifier;
        return (a.validatedBy || '').localeCompare(b.validatedBy || '') * modifier;
      }
      return 0;
    });

    return list;
  }, [filteredPayments, sortConfig]);

  // Financial and occupancy metrics for the active filter month
  const metrics = useMemo(() => {
    const monthBills =
      filterMonth === 'all'
        ? cleanPaymentsList
        : cleanPaymentsList.filter(
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
  }, [cleanPaymentsList, filterMonth]);

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

  // Open Multi-Month Modal for a room
  const handleOpenMultiMonthModal = (payment) => {
    setMultiMonthModal({
      isOpen: true,
      payment,
      monthsCount: 3,
      method: payment.paymentMethod && payment.paymentMethod !== 'Belum Transfer' ? payment.paymentMethod : 'Transfer Bank BCA'
    });
  };

  // Compute preview list of consecutive months for multi-month payment
  const multiMonthPreviewList = useMemo(() => {
    if (!multiMonthModal.payment) return [];
    const startM = multiMonthModal.payment.month || filterMonth || 'Oktober 2026';
    const list = [startM];
    for (let i = 1; i < multiMonthModal.monthsCount; i++) {
      list.push(getNextMonthName(list[i - 1]));
    }
    return list;
  }, [multiMonthModal.payment, multiMonthModal.monthsCount, filterMonth]);

  // Confirm Multi-Month Payment Validation
  const handleConfirmMultiMonth = (e) => {
    e.preventDefault();
    if (!multiMonthModal.payment) return;
    handleValidateMultiMonthPayment(
      multiMonthModal.payment.id,
      multiMonthModal.monthsCount,
      multiMonthModal.payment.month,
      multiMonthModal.method
    );
    setMultiMonthModal({ isOpen: false, payment: null, monthsCount: 3, method: 'Transfer Bank BCA' });
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

      {/* Filter Toolbar & Actions (Tombol Terbitkan Tagihan Dihapus Sesuai Permintaan) */}
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
            <option value="__custom__">+ Tambah / Buka Bulan Baru...</option>
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

        {/* Operator Quick Actions (Only Validasi Semua when unvalidated bills exist) */}
        {canValidate && (
          <div className="toolbar-search-group">
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

      {/* Payments Table with Clickable Sortable Headers (ASC / DESC) */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {/* 1. Bulan & ID */}
                <th
                  onClick={() => handleSort('month')}
                  className={`sortable-th ${sortConfig.key === 'month' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Bulan & ID (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Bulan & ID</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'month' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 2. Penghuni & Kamar */}
                <th
                  onClick={() => handleSort('roomNumber')}
                  className={`sortable-th ${sortConfig.key === 'roomNumber' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Kamar (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Penghuni & Kamar</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'roomNumber' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 3. Nominal Sewa */}
                <th
                  onClick={() => handleSort('amount')}
                  className={`sortable-th ${sortConfig.key === 'amount' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Nominal Sewa (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Nominal Sewa</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 4. Metode Bayar */}
                <th
                  onClick={() => handleSort('paymentMethod')}
                  className={`sortable-th ${sortConfig.key === 'paymentMethod' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Metode Bayar (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Metode Bayar</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'paymentMethod' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 5. Waktu Bayar */}
                <th
                  onClick={() => handleSort('paidAt')}
                  className={`sortable-th ${sortConfig.key === 'paidAt' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Waktu Bayar (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Waktu Bayar</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'paidAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 6. Bukti Transfer */}
                <th
                  onClick={() => handleSort('proofUrl')}
                  className={`sortable-th ${sortConfig.key === 'proofUrl' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Bukti Transfer (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Bukti Transfer</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'proofUrl' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 7. Status */}
                <th
                  onClick={() => handleSort('status')}
                  className={`sortable-th ${sortConfig.key === 'status' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Status (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Status</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 8. Validasi Oleh */}
                <th
                  onClick={() => handleSort('validatedBy')}
                  className={`sortable-th ${sortConfig.key === 'validatedBy' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Petugas Validasi (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Validasi Oleh</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'validatedBy' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 9. Tindakan Operator */}
                {canValidate && <th>Tindakan Operator</th>}
              </tr>
            </thead>
            <tbody>
              {sortedPayments.length > 0 ? (
                sortedPayments.map((pay) => (
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
                    <td className="text-sm text-gray-600 font-mono">{pay.paidAt || '-'}</td>
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
                          <div className="text-gray-400 font-mono">{pay.validatedAt}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    {canValidate && (
                      <td>
                        <div className="action-buttons-row">
                          {pay.status !== 'Tervalidasi' && (
                            <>
                              <button
                                type="button"
                                className="btn-validate-approve"
                                onClick={() => handleValidatePayment(pay.id, 'Tervalidasi')}
                                title="Centang Validasi: Menandai tagihan lunas pada tanggal & jam saat ini"
                              >
                                <IconCheck size={14} />
                                <span>Validasi</span>
                              </button>

                              <button
                                type="button"
                                className="btn-multi-month"
                                onClick={() => handleOpenMultiMonthModal(pay)}
                                title="Penghuni bayar beberapa bulan sekaligus (otomatis lunas di tiap bulan terkait)"
                              >
                                <span>+ Multi-Bulan</span>
                              </button>
                            </>
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

      {/* Multi-Month Validation Modal */}
      {multiMonthModal.isOpen && multiMonthModal.payment && (
        <div
          className="modal-overlay"
          onClick={() => setMultiMonthModal({ isOpen: false, payment: null, monthsCount: 3, method: 'Transfer Bank BCA' })}
        >
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="form-section-header">
              <IconCalendar size={22} className="text-primary-green" />
              <div>
                <h3 className="modal-title">Pelunasan Pembayaran Multi-Bulan</h3>
                <p className="modal-subtitle">
                  Penghuni bayar sewa langsung beberapa bulan ke depan (1 kamar terekam per 1 bulan).
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmMultiMonth}>
              <div style={{ background: 'var(--forest-50)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontWeight: 800, color: 'var(--forest-900)', fontSize: '0.95rem' }}>
                  Kamar {multiMonthModal.payment.roomNumber} — {multiMonthModal.payment.tenantName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Mulai dari Bulan: <strong>{multiMonthModal.payment.month}</strong> • Tarif: Rp {multiMonthModal.payment.amount?.toLocaleString('id-ID')}/bulan
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Pilih Jumlah Bulan yang Dibayarkan</label>
                <select
                  className="form-select"
                  value={multiMonthModal.monthsCount}
                  onChange={(e) => setMultiMonthModal({ ...multiMonthModal, monthsCount: parseInt(e.target.value) || 1 })}
                >
                  <option value={2}>2 Bulan Sekaligus</option>
                  <option value={3}>3 Bulan Sekaligus (1 Triwulan)</option>
                  <option value={4}>4 Bulan Sekaligus</option>
                  <option value={6}>6 Bulan Sekaligus (1 Semester)</option>
                  <option value={12}>12 Bulan Sekaligus (1 Tahun Penuh)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Metode Pembayaran</label>
                <select
                  className="form-select"
                  value={multiMonthModal.method}
                  onChange={(e) => setMultiMonthModal({ ...multiMonthModal, method: e.target.value })}
                >
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                  <option value="Tunai / Cash (Kasir)">Tunai / Cash (Kasir)</option>
                  <option value="QRIS Gladiola">QRIS Gladiola</option>
                </select>
              </div>

              {/* Preview of Affected Months */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Bulan yang Akan Otomatis Dilunaskan:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {multiMonthPreviewList.map((m, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #86efac',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Total Diterima:{' '}
                  <strong style={{ color: 'var(--forest-900)' }}>
                    Rp {(multiMonthModal.payment.amount * multiMonthModal.monthsCount).toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setMultiMonthModal({ isOpen: false, payment: null, monthsCount: 3, method: 'Transfer Bank BCA' })}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-action">
                  <IconCheck size={16} />
                  <span>Validasi Lunas {multiMonthModal.monthsCount} Bulan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Month Picker Modal */}
      {isCustomMonthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomMonthModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="form-section-header">
              <div>
                <h3 className="modal-title">Buka / Pilih Bulan Baru</h3>
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
                  Sistem otomatis menyiapkan data tagihan sewa bagi seluruh penghuni kos aktif (1 kamar per 1 bulan).
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
                  <IconCheck size={16} />
                  <span>Buka Bulan Ini</span>
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
