import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { deduplicateElectricityBills } from '../data/initialData';
import {
  IconLightning,
  IconCheck,
  IconSearch,
  IconCopy,
  IconEdit
} from './Icons';

export const UtilitasView = () => {
  const {
    electricityBills,
    rooms,
    tenants,
    generateMonthlyElectricityBills,
    handleUpdateElectricityToken,
    handleQuickUpdateElectricity,
    handleBulkValidateElectricityMonth,
    currentUser,
    addToast
  } = useApp();

  const [filterMonth, setFilterMonth] = useState('Oktober 2026');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTokenIds, setEditingTokenIds] = useState({});
  const [tokenInputMap, setTokenInputMap] = useState({});
  const [editingMeterId, setEditingMeterId] = useState(null);
  const [meterEndInput, setMeterEndInput] = useState('');
  const [isCustomMonthModalOpen, setIsCustomMonthModalOpen] = useState(false);
  const [customMonthInput, setCustomMonthInput] = useState('');

  // Table Sorting State (ASC / DESC on column headers)
  const [sortConfig, setSortConfig] = useState({
    key: 'roomNumber',
    direction: 'asc'
  });

  const canValidate =
    currentUser.role === 'operator' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'owner';

  // Preset billing months
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

  // Clean deduplicated bills list (strictly enforces 1 bill per room per month)
  // Menampilkan HANYA kamar yang ada penghuni kos nya (jika kamar kos kosong, jangan tampilkan data tagihannya)
  const cleanBillsList = useMemo(() => {
    const deduped = deduplicateElectricityBills(electricityBills || []);
    return deduped.filter((b) => {
      if (!b || !b.roomNumber) return false;
      const roomNum = String(b.roomNumber).trim().toLowerCase();

      // 1. Cek unit kamar di daftar master rooms
      const roomObj = (rooms || []).find(
        (r) => String(r.number).trim().toLowerCase() === roomNum
      );

      // Jika kamar berstatus Kosong atau belum ada nama penghuni, sembunyikan tagihannya
      if (roomObj) {
        if (roomObj.status === 'Kosong' || !roomObj.currentTenant || !roomObj.currentTenant.trim()) {
          return false;
        }
      }

      // 2. Cek tenant di daftar master tenants
      const tenantObj = (tenants || []).find(
        (t) =>
          (b.tenantId && t.id === b.tenantId) ||
          (t.roomNumber && String(t.roomNumber).trim().toLowerCase() === roomNum)
      );

      // Jika tenant berstatus nonaktif dan kamar tidak berstatus terisi
      if (tenantObj && tenantObj.status === 'Nonaktif' && (!roomObj || roomObj.status !== 'Terisi')) {
        return false;
      }

      // Pastikan ada nama penghuni (baik dari data master room, master tenant, atau tagihan)
      const hasTenant =
        (roomObj && roomObj.currentTenant && roomObj.currentTenant.trim()) ||
        (tenantObj && tenantObj.status === 'Aktif' && tenantObj.name && tenantObj.name.trim()) ||
        (b.tenantName && b.tenantName.trim());

      if (!hasTenant) {
        return false;
      }

      return true;
    });
  }, [electricityBills, rooms, tenants]);

  // Distinct list of available months across active clean bills and presets
  const availableMonths = useMemo(() => {
    const set = new Set(presetMonths);
    (cleanBillsList || []).forEach((b) => {
      if (b.month) set.add(b.month.trim());
    });
    return Array.from(set);
  }, [cleanBillsList]);

  // When filterMonth changes and is not 'all', quietly ensure all active rooms have bills ready (seperti Pembayaran Kos)
  useEffect(() => {
    if (filterMonth && filterMonth !== 'all' && filterMonth !== '__custom__') {
      generateMonthlyElectricityBills(filterMonth);
    }
  }, [filterMonth]);

  // Helper to generate a realistic 20-digit PLN token
  const generateRandomPlnToken = () => {
    const part = () => Math.floor(1000 + Math.random() * 9000);
    return `${part()}-${part()}-${part()}-${part()}-${part()}`;
  };

  // Month selector change
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
      addToast('Silakan masukkan nama bulan dan tahun (contoh: November 2026)', 'error');
      return;
    }
    const cleanMonth = customMonthInput.trim();
    setFilterMonth(cleanMonth);
    generateMonthlyElectricityBills(cleanMonth);
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

  // Save single token inline
  const handleSaveTokenInline = (bill) => {
    const inputVal = tokenInputMap[bill.id] !== undefined ? tokenInputMap[bill.id] : bill.token;
    if (!inputVal || !inputVal.trim()) {
      addToast('Silakan ketik atau isi nomor token terlebih dahulu!', 'warning');
      return;
    }
    handleUpdateElectricityToken(bill.id, inputVal.trim(), 'Lunas');
    setEditingTokenIds((prev) => ({ ...prev, [bill.id]: false }));
  };

  // Auto-fill realistic 20-digit token for a single row (prioritize room fixed token)
  const handleAutoFillToken = (billId, roomNumber) => {
    const roomObj = rooms.find((r) => r.number === roomNumber);
    const generated = roomObj?.electricityToken || generateRandomPlnToken();
    setTokenInputMap((prev) => ({ ...prev, [billId]: generated }));
  };

  // Save quick meter end edit
  const handleSaveMeterEnd = (bill) => {
    const endVal = parseInt(meterEndInput);
    if (isNaN(endVal) || endVal < bill.meterStart) {
      addToast('Stand meter akhir tidak boleh lebih kecil dari meter awal!', 'error');
      return;
    }
    handleQuickUpdateElectricity(bill.id, { meterEnd: endVal });
    setEditingMeterId(null);
    setMeterEndInput('');
  };

  // Validasi tagihan listrik per baris (persis seperti Pembayaran Kos)
  const handleValidateBill = (bill) => {
    const roomObj = (rooms || []).find((r) => String(r.number).trim() === String(bill.roomNumber).trim());
    const tokenVal = bill.token || roomObj?.electricityToken || generateRandomPlnToken();
    handleQuickUpdateElectricity(bill.id, {
      status: 'Lunas',
      token: tokenVal,
      paidAt: new Date().toLocaleString('id-ID'),
      recordedBy: currentUser?.name || 'Operator Taman'
    });
    addToast(`Tagihan listrik Kamar ${bill.roomNumber} berhasil divalidasi Lunas!`, 'success');
  };

  // Batalkan validasi per baris (kembali ke Belum Bayar)
  const handleRevertValidation = (bill) => {
    if (window.confirm(`Batalkan status lunas untuk tagihan listrik Kamar ${bill.roomNumber}?`)) {
      handleQuickUpdateElectricity(bill.id, {
        status: 'Belum Bayar',
        paidAt: null
      });
      addToast(`Status tagihan listrik Kamar ${bill.roomNumber} dikembalikan ke Belum Bayar.`, 'info');
    }
  };

  // Filtered bills
  const filteredBills = useMemo(() => {
    return cleanBillsList.filter((b) => {
      const matchMonth =
        filterMonth === 'all' ||
        b.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
        b.month.toLowerCase().includes(filterMonth.toLowerCase().trim());

      const matchStatus = filterStatus === 'all' || b.status === filterStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (b.roomNumber && b.roomNumber.toLowerCase().includes(q)) ||
        (b.tenantName && b.tenantName.toLowerCase().includes(q)) ||
        (b.token && b.token.toLowerCase().includes(q)) ||
        (b.tenantPhone && b.tenantPhone.toLowerCase().includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q));

      return matchMonth && matchStatus && matchSearch;
    });
  }, [cleanBillsList, filterMonth, filterStatus, searchQuery]);

  // Sort bills dynamically
  const sortedBills = useMemo(() => {
    const list = [...filteredBills];
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
      if (key === 'meterStart') {
        return ((a.meterStart || 0) - (b.meterStart || 0)) * modifier;
      }
      if (key === 'meterEnd') {
        return ((a.meterEnd || 0) - (b.meterEnd || 0)) * modifier;
      }
      if (key === 'kwhUsage') {
        return ((a.kwhUsage || 0) - (b.kwhUsage || 0)) * modifier;
      }
      if (key === 'totalBill') {
        return ((a.totalBill || 0) - (b.totalBill || 0)) * modifier;
      }
      if (key === 'status') {
        const score = { Lunas: 1, 'Belum Bayar': 2 };
        const scoreA = score[a.status] || 99;
        const scoreB = score[b.status] || 99;
        return (scoreA - scoreB) * modifier;
      }
      if (key === 'token') {
        const hasA = a.token ? 1 : 0;
        const hasB = b.token ? 1 : 0;
        return (hasA - hasB) * modifier;
      }
      return 0;
    });

    return list;
  }, [filteredBills, sortConfig]);

  // Metrics for active month
  const metrics = useMemo(() => {
    const targetBills =
      filterMonth === 'all'
        ? cleanBillsList
        : cleanBillsList.filter(
            (b) =>
              b.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
              b.month.toLowerCase().includes(filterMonth.toLowerCase().trim())
          );

    const totalCount = targetBills.length;
    const totalKwh = targetBills.reduce((acc, curr) => acc + (curr.kwhUsage || 0), 0);
    const totalRupiah = targetBills.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);

    const lunasBills = targetBills.filter((b) => b.status === 'Lunas');
    const lunasCount = lunasBills.length;
    const lunasRupiah = lunasBills.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);

    const unpaidBills = targetBills.filter((b) => b.status === 'Belum Bayar');
    const unpaidCount = unpaidBills.length;
    const unpaidRupiah = unpaidBills.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);

    const filledTokenCount = targetBills.filter((b) => b.token && b.token.trim().length > 0).length;
    const emptyTokenCount = totalCount - filledTokenCount;
    const percentage = totalCount > 0 ? Math.round((lunasCount / totalCount) * 100) : 0;

    return {
      totalCount,
      totalKwh,
      totalRupiah,
      lunasCount,
      lunasRupiah,
      unpaidCount,
      unpaidRupiah,
      filledTokenCount,
      emptyTokenCount,
      percentage
    };
  }, [cleanBillsList, filterMonth]);

  // Bulk validate confirmation (persis seperti Pembayaran Kos)
  const handleBulkValidateConfirm = () => {
    if (filterMonth === 'all') {
      addToast('Pilih bulan spesifik di dropdown sebelum validasi massal.', 'info');
      return;
    }
    if (metrics.unpaidCount === 0) {
      addToast(`Semua tagihan listrik untuk bulan ${filterMonth} sudah Lunas.`, 'info');
      return;
    }

    if (
      window.confirm(
        `Validasi dan lunaskan seluruh ${metrics.unpaidCount} tagihan listrik bulan ${filterMonth}?`
      )
    ) {
      handleBulkValidateElectricityMonth(filterMonth);
    }
  };

  return (
    <div className="utilitas-container">
      {/* Metric Cards (Sesuai Gaya Kartu Pembayaran Kos) */}
      <div className="pembayaran-stats-grid">
        <div className="pembayaran-stat-card card-primary">
          <span className="stat-metric-label">Total Tagihan Listrik ({filterMonth === 'all' ? 'Semua' : filterMonth})</span>
          <span className="stat-metric-value">{metrics.totalCount} Kamar</span>
          <span className="stat-metric-subtext">Rp {metrics.totalRupiah.toLocaleString('id-ID')} ({metrics.totalKwh.toLocaleString('id-ID')} kWh)</span>
        </div>

        <div className="pembayaran-stat-card card-success">
          <span className="stat-metric-label">Tervalidasi (Lunas)</span>
          <span className="stat-metric-value">{metrics.lunasCount} Lunas ({metrics.percentage}%)</span>
          <span className="stat-metric-subtext">Rp {metrics.lunasRupiah.toLocaleString('id-ID')}</span>
        </div>

        <div className="pembayaran-stat-card card-info">
          <span className="stat-metric-label">Belum Bayar</span>
          <span className="stat-metric-value">{metrics.unpaidCount} Kamar</span>
          <span className="stat-metric-subtext">Rp {metrics.unpaidRupiah.toLocaleString('id-ID')}</span>
        </div>

        <div className="pembayaran-stat-card card-warning">
          <span className="stat-metric-label">Status Token Listrik PLN</span>
          <span className="stat-metric-value">{metrics.filledTokenCount} Terisi</span>
          <span className="stat-metric-subtext">{metrics.emptyTokenCount} kamar menunggu token • Rp 1.650/kWh</span>
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
              placeholder="Cari kamar / nama / nomor HP / token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Month Selector */}
          <select
            className="filter-select"
            value={filterMonth}
            onChange={handleMonthChange}
            title="Pilih Bulan Utilitas & Listrik"
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
            <option value="Lunas">Lunas</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>

        {/* Action Buttons: Tombol Terbitkan, Isi Token, & Input Stand Meter DIHAPUS sesuai permintaan; Diganti Validasi Semua seperti Pembayaran Kos */}
        {canValidate && (
          <div className="toolbar-search-group">
            {filterMonth !== 'all' && metrics.unpaidCount > 0 && (
              <button
                type="button"
                className="btn-bulk-validate"
                onClick={handleBulkValidateConfirm}
                title="Validasi seluruh tagihan listrik yang belum lunas dalam 1 klik"
              >
                <IconCheck size={16} />
                <span>Validasi Semua ({metrics.unpaidCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table with Clickable Sortable Headers (ASC / DESC) */}
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

                {/* 3. Token Listrik (PLN) */}
                <th
                  onClick={() => handleSort('token')}
                  className={`sortable-th ${sortConfig.key === 'token' ? 'active-sort' : ''}`}
                  style={{ minWidth: '240px' }}
                  title="Klik untuk sortir Token Listrik (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>⚡ Token Listrik (PLN)</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'token' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 4. Meter Awal */}
                <th
                  onClick={() => handleSort('meterStart')}
                  className={`sortable-th ${sortConfig.key === 'meterStart' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Meter Awal (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Meter Awal</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'meterStart' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 5. Meter Akhir */}
                <th
                  onClick={() => handleSort('meterEnd')}
                  className={`sortable-th ${sortConfig.key === 'meterEnd' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Meter Akhir (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Meter Akhir</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'meterEnd' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 6. Pemakaian */}
                <th
                  onClick={() => handleSort('kwhUsage')}
                  className={`sortable-th ${sortConfig.key === 'kwhUsage' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Pemakaian kWh (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Pemakaian</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'kwhUsage' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 7. Tarif/kWh */}
                <th>Tarif/kWh</th>

                {/* 8. Total Tagihan */}
                <th
                  onClick={() => handleSort('totalBill')}
                  className={`sortable-th ${sortConfig.key === 'totalBill' ? 'active-sort' : ''}`}
                  title="Klik untuk sortir Total Tagihan (ASC / DESC)"
                >
                  <div className="th-sort-wrapper">
                    <span>Total Tagihan</span>
                    <span className="sort-indicator">
                      {sortConfig.key === 'totalBill' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>

                {/* 9. Status */}
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

                {/* 10. Dicatat Oleh */}
                <th>Dicatat Oleh</th>

                {/* 11. Tindakan Operator */}
                {canValidate && <th>Tindakan Operator</th>}
              </tr>
            </thead>
            <tbody>
              {sortedBills.length > 0 ? (
                sortedBills.map((b) => {
                  const isEditingToken = editingTokenIds[b.id] || !b.token;
                  const currentTokenVal =
                    tokenInputMap[b.id] !== undefined ? tokenInputMap[b.id] : (b.token || '');

                  const roomObj = (rooms || []).find((r) => String(r.number).trim() === String(b.roomNumber).trim());
                  const displayName = b.tenantName || roomObj?.currentTenant || 'Penghuni';

                  return (
                    <tr key={b.id}>
                      {/* Bulan & ID */}
                      <td>
                        <div>
                          <strong className="text-gray-900">{b.month}</strong>
                          <span className="tenant-subtext">{b.id}</span>
                        </div>
                      </td>

                      {/* Penghuni & Kamar */}
                      <td>
                        <div className="tenant-cell-info">
                          <span className="room-badge-small">Kmr {b.roomNumber}</span>
                          <div>
                            <strong className="text-gray-900">{displayName}</strong>
                            <span className="tenant-subtext">{b.tenantPhone || '-'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Token Listrik */}
                      <td>
                        {isEditingToken ? (
                          <div className="token-cell-wrapper">
                            <div className="token-input-group">
                              <input
                                type="text"
                                className="token-input-field"
                                placeholder={roomObj?.electricityToken ? `Tetap: ${roomObj.electricityToken.slice(0, 14)}...` : 'Ketik 20 digit token...'}
                                value={currentTokenVal}
                                onChange={(e) =>
                                  setTokenInputMap({ ...tokenInputMap, [b.id]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTokenInline(b);
                                }}
                              />
                              <button
                                type="button"
                                className="btn-auto-token-gen"
                                onClick={() => handleAutoFillToken(b.id, b.roomNumber)}
                                title="Ambil nomor token PLN tetap kamar ini"
                              >
                                ⚡ Auto
                              </button>
                            </div>
                            <button
                              type="button"
                              className="btn-save-token-inline"
                              onClick={() => handleSaveTokenInline(b)}
                              title="Simpan Token"
                            >
                              <IconCheck size={14} />
                              <span>Simpan</span>
                            </button>
                          </div>
                        ) : (
                          <div className="token-cell-wrapper">
                            <span className="token-display-pill" title="Token Listrik PLN">
                              <IconLightning size={14} />
                              <span>{b.token}</span>
                            </span>
                            <button
                              type="button"
                              className="btn-copy-token"
                              onClick={() => {
                                navigator.clipboard.writeText(b.token);
                                addToast(`Token Kamar ${b.roomNumber} disalin!`, 'info');
                              }}
                              title="Salin Token"
                            >
                              <IconCopy size={13} />
                              <span>Salin</span>
                            </button>
                            <button
                              type="button"
                              className="btn-edit-token-icon"
                              onClick={() => {
                                setEditingTokenIds({ ...editingTokenIds, [b.id]: true });
                                setTokenInputMap({ ...tokenInputMap, [b.id]: b.token });
                              }}
                              title="Edit Token"
                            >
                              <IconEdit size={14} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Meter Awal */}
                      <td>{b.meterStart} kWh</td>

                      {/* Meter Akhir (dengan Inline Edit) */}
                      <td>
                        {editingMeterId === b.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '80px', padding: '4px 6px', fontSize: '0.8rem' }}
                              value={meterEndInput}
                              onChange={(e) => setMeterEndInput(e.target.value)}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="btn-save-token-inline"
                              onClick={() => handleSaveMeterEnd(b)}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{b.meterEnd} kWh</span>
                            <button
                              type="button"
                              className="btn-edit-token-icon"
                              onClick={() => {
                                setEditingMeterId(b.id);
                                setMeterEndInput(String(b.meterEnd));
                              }}
                              title="Ubah stand meter akhir"
                            >
                              <IconEdit size={12} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Pemakaian */}
                      <td>
                        <span className="badge-pill-outline">{b.kwhUsage} kWh</span>
                      </td>

                      {/* Tarif */}
                      <td>Rp {b.ratePerKwh.toLocaleString('id-ID')}</td>

                      {/* Total Tagihan */}
                      <td className="font-bold text-gray-900">
                        Rp {b.totalBill.toLocaleString('id-ID')}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge-status ${
                            b.status === 'Lunas' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {b.status === 'Lunas' && '✓ '}
                          {b.status}
                        </span>
                      </td>

                      {/* Dicatat Oleh */}
                      <td className="text-xs text-gray-500">
                        <div>
                          <strong>{b.recordedBy || 'Petugas'}</strong>
                          {b.paidAt && <div className="text-gray-400 font-mono">{b.paidAt}</div>}
                        </div>
                      </td>

                      {/* Tindakan Operator (Persis Seperti Pembayaran Kos) */}
                      {canValidate && (
                        <td>
                          <div className="action-buttons-row">
                            {b.status !== 'Lunas' ? (
                              <button
                                type="button"
                                className="btn-validate-approve"
                                onClick={() => handleValidateBill(b)}
                                title="Validasi: Menandai tagihan listrik lunas & pastikan token terisi"
                              >
                                <IconCheck size={14} />
                                <span>Validasi</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-revert-validation"
                                onClick={() => handleRevertValidation(b)}
                                title="Batalkan pelunasan tagihan listrik (kembalikan ke Belum Bayar)"
                              >
                                <span>↺ Batal</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canValidate ? 11 : 10} className="text-center py-8 text-gray-500">
                    Tidak ada data tagihan utilitas & listrik untuk kamar berpenghuni pada filter ini.
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
                <h3 className="modal-title">Buka Tagihan Utilitas & Listrik Bulan Baru</h3>
                <p className="modal-subtitle">
                  Masukkan nama bulan dan tahun penagihan listrik untuk kamar-kamar yang berpenghuni.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddCustomMonth}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Nama Bulan & Tahun *</label>
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
                  Sistem akan otomatis menyiapkan tagihan listrik per bulan hanya untuk kamar yang memiliki penghuni kos aktif.
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
                  <span>Buka Tagihan Bulan Ini</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
