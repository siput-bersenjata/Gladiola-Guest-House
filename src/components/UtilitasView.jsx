import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconLightning,
  IconPlus,
  IconCheck,
  IconClock,
  IconSearch,
  IconArrowLeft,
  IconRoom,
  IconCopy,
  IconEdit
} from './Icons';
import { SearchableRoomSelect } from './SearchableRoomSelect';

export const UtilitasView = () => {
  const {
    electricityBills,
    rooms,
    tenants,
    handleSaveElectricityBill,
    generateMonthlyElectricityBills,
    handleUpdateElectricityToken,
    handleQuickUpdateElectricity,
    currentUser,
    addToast
  } = useApp();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [filterMonth, setFilterMonth] = useState('Oktober 2026');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTokenIds, setEditingTokenIds] = useState({});
  const [tokenInputMap, setTokenInputMap] = useState({});
  const [editingMeterId, setEditingMeterId] = useState(null);
  const [meterEndInput, setMeterEndInput] = useState('');
  const [isCustomMonthModalOpen, setIsCustomMonthModalOpen] = useState(false);
  const [customMonthInput, setCustomMonthInput] = useState('');

  // Form state for manual calculation
  const [formData, setFormData] = useState({
    roomNumber: '102',
    tenantName: 'Rizky Ramadhan',
    tenantPhone: '081233445566',
    month: 'Oktober 2026',
    meterStart: 1240,
    meterEnd: 1320,
    ratePerKwh: 1650,
    token: '',
    status: 'Belum Bayar'
  });

  const kwhUsage = Math.max(0, formData.meterEnd - formData.meterStart);
  const totalBill = kwhUsage * formData.ratePerKwh;

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

  // Distinct list of available months
  const availableMonths = useMemo(() => {
    const set = new Set(presetMonths);
    electricityBills.forEach((b) => {
      if (b.month) set.add(b.month.trim());
    });
    return Array.from(set);
  }, [electricityBills]);

  // When filterMonth changes and is not 'all', automatically generate bills for all active tenants!
  useEffect(() => {
    if (filterMonth && filterMonth !== 'all' && filterMonth !== '__custom__') {
      const added = generateMonthlyElectricityBills(filterMonth);
      if (added > 0) {
        addToast(
          `${added} tagihan listrik baru bulan ${filterMonth} berhasil diterbitkan untuk semua penghuni aktif! Kolom token siap diisi.`,
          'success'
        );
      }
    }
  }, [filterMonth]);

  // Helper to generate a realistic 20-digit PLN token
  const generateRandomPlnToken = () => {
    const part = () => Math.floor(1000 + Math.random() * 9000);
    return `${part()}-${part()}-${part()}-${part()}-${part()}`;
  };

  const handleRoomChange = (roomNum) => {
    const tenant = tenants.find((t) => t.roomNumber === roomNum);
    const prevBill = electricityBills.find((b) => b.roomNumber === roomNum && b.meterEnd);
    const startVal = prevBill ? prevBill.meterEnd : 1240;

    setFormData({
      ...formData,
      roomNumber: roomNum,
      tenantName: tenant ? tenant.name : `Penghuni Kamar ${roomNum}`,
      tenantPhone: tenant ? tenant.phone : '-',
      meterStart: startVal,
      meterEnd: startVal + 75
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
      token: formData.token ? formData.token.trim() : '',
      status: formData.status,
      paidAt: formData.status === 'Lunas' ? new Date().toLocaleString('id-ID') : null
    });
    setViewMode('list');
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
    const added = generateMonthlyElectricityBills(cleanMonth);
    addToast(
      `Bulan ${cleanMonth} dipilih! ${added > 0 ? `${added} tagihan diterbitkan.` : 'Tagihan siap diisi kolom tokennya.'}`,
      'success'
    );
    setCustomMonthInput('');
    setIsCustomMonthModalOpen(false);
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

  // Auto-fill realistic 20-digit token for a single row
  const handleAutoFillToken = (billId) => {
    const generated = generateRandomPlnToken();
    setTokenInputMap((prev) => ({ ...prev, [billId]: generated }));
  };

  // Bulk fill demo tokens for all empty rooms in the selected month
  const handleBulkFillDemoTokens = () => {
    if (filterMonth === 'all') {
      addToast('Pilih bulan spesifik di dropdown sebelum generate token massal.', 'info');
      return;
    }
    const targetBills = electricityBills.filter(
      (b) =>
        (b.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
          b.month.toLowerCase().includes(filterMonth.toLowerCase().trim())) &&
        !b.token
    );

    if (targetBills.length === 0) {
      addToast(`Semua tagihan untuk bulan ${filterMonth} sudah memiliki token listrik!`, 'info');
      return;
    }

    targetBills.forEach((b) => {
      const token = generateRandomPlnToken();
      handleUpdateElectricityToken(b.id, token, 'Lunas');
    });

    addToast(`Berhasil mengisikan token listrik PLN untuk seluruh (${targetBills.length}) kamar!`, 'success');
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

  // Toggle bill status
  const handleToggleStatus = (bill) => {
    const newStatus = bill.status === 'Lunas' ? 'Belum Bayar' : 'Lunas';
    handleQuickUpdateElectricity(bill.id, {
      status: newStatus,
      paidAt: newStatus === 'Lunas' ? new Date().toLocaleString('id-ID') : null
    });
  };

  // Filtered bills
  const filteredBills = useMemo(() => {
    return electricityBills
      .filter((b) => {
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
          (b.tenantPhone && b.tenantPhone.toLowerCase().includes(q));

        return matchMonth && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        const numA = parseInt(a.roomNumber) || 999;
        const numB = parseInt(b.roomNumber) || 999;
        return numA - numB;
      });
  }, [electricityBills, filterMonth, filterStatus, searchQuery]);

  // Metrics for active month
  const metrics = useMemo(() => {
    const targetBills =
      filterMonth === 'all'
        ? electricityBills
        : electricityBills.filter(
            (b) =>
              b.month.toLowerCase().trim() === filterMonth.toLowerCase().trim() ||
              b.month.toLowerCase().includes(filterMonth.toLowerCase().trim())
          );

    const totalKwh = targetBills.reduce((acc, curr) => acc + (curr.kwhUsage || 0), 0);
    const totalRupiah = targetBills.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);
    const totalCount = targetBills.length;
    const filledTokenCount = targetBills.filter((b) => b.token && b.token.trim().length > 0).length;
    const emptyTokenCount = totalCount - filledTokenCount;
    const lunasCount = targetBills.filter((b) => b.status === 'Lunas').length;

    return {
      totalKwh,
      totalRupiah,
      totalCount,
      filledTokenCount,
      emptyTokenCount,
      lunasCount
    };
  }, [electricityBills, filterMonth]);

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
              Catat stand meter awal & akhir kWh per kamar penghuni untuk menghitung total tagihan dan masukkan token listrik.
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
                  <span className="field-hint">
                    Penghuni terhubung otomatis: <strong>{formData.tenantName}</strong> ({formData.tenantPhone})
                  </span>
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

            {/* Section 2: Angka Meteran, Token & Tarif */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconLightning size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Stand Meteran Listrik, Token & Tarif</h3>
                  <p className="form-section-subtitle">
                    Kalkulasi otomatis pemakaian kWh, pengisian kode token PLN prabayar dan total tagihan
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
                  <label className="form-label">Nomor Token Listrik PLN (Opsional)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: 3819-2041-8849-2194-0012"
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn-auto-token-gen"
                      onClick={() => setFormData({ ...formData, token: generateRandomPlnToken() })}
                      title="Generate contoh 20 digit token PLN"
                    >
                      ⚡ Auto
                    </button>
                  </div>
                  <span className="field-hint">Penghuni kos dapat melihat dan menyalin token ini di portal mereka</span>
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
                    <option value="Lunas">Lunas (Sudah Dibayarkan / Token Terisi)</option>
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
  return (
    <div className="utilitas-container">
      {/* Metric Cards */}
      <div className="pembayaran-stats-grid">
        <div className="pembayaran-stat-card card-primary">
          <span className="stat-metric-label">Total Pemakaian ({filterMonth === 'all' ? 'Semua' : filterMonth})</span>
          <span className="stat-metric-value">{metrics.totalKwh.toLocaleString('id-ID')} kWh</span>
          <span className="stat-metric-subtext">Dari {metrics.totalCount} kamar terdata</span>
        </div>

        <div className="pembayaran-stat-card card-warning">
          <span className="stat-metric-label">Total Tagihan Listrik</span>
          <span className="stat-metric-value">Rp {metrics.totalRupiah.toLocaleString('id-ID')}</span>
          <span className="stat-metric-subtext">{metrics.lunasCount} kamar Lunas</span>
        </div>

        <div className="pembayaran-stat-card card-success">
          <span className="stat-metric-label">Status Token Listrik PLN</span>
          <span className="stat-metric-value">{metrics.filledTokenCount} Terisi</span>
          <span className="stat-metric-subtext">{metrics.emptyTokenCount} kamar menunggu input token</span>
        </div>

        <div className="pembayaran-stat-card card-info">
          <span className="stat-metric-label">Tarif Flat per kWh</span>
          <span className="stat-metric-value">Rp 1.650</span>
          <span className="stat-metric-subtext">Tarif kos eksklusif Gladiola</span>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          {/* Search Box */}
          <div className="search-box-pill">
            <IconSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari kamar / nama / token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Month Selector */}
          <select
            className="filter-select"
            value={filterMonth}
            onChange={handleMonthChange}
            title="Pilih Bulan Utilitas"
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
            <option value="Lunas">Lunas</option>
            <option value="Belum Bayar">Belum Bayar</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="toolbar-search-group">
          {filterMonth !== 'all' && (
            <button
              type="button"
              className="btn-generate-bills"
              onClick={() => {
                const added = generateMonthlyElectricityBills(filterMonth);
                if (added > 0) {
                  addToast(`Berhasil menerbitkan ${added} baris tagihan listrik bulan ${filterMonth}!`, 'success');
                } else {
                  addToast(`Semua kamar aktif sudah terdaftar di tagihan listrik ${filterMonth}.`, 'info');
                }
              }}
              title="Terbitkan tagihan listrik bulan ini untuk semua penghuni"
            >
              <IconLightning size={16} />
              <span>Terbitkan Utilitas {filterMonth}</span>
            </button>
          )}

          {filterMonth !== 'all' && metrics.emptyTokenCount > 0 && (
            <button
              type="button"
              className="btn-bulk-validate"
              onClick={handleBulkFillDemoTokens}
              title="Otomatis isi contoh 20 digit token PLN untuk semua kamar yang kosong"
            >
              <IconLightning size={16} />
              <span>Isi Token Semua Kamar ({metrics.emptyTokenCount})</span>
            </button>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={openInputForm}
            title="Input stand meteran listrik baru"
          >
            <IconPlus size={16} />
            <span>+ Input Stand Meter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Kamar & Penghuni</th>
                <th style={{ minWidth: '240px' }}>⚡ Kolom Token Listrik (PLN)</th>
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
                filteredBills.map((b) => {
                  const isEditingToken = editingTokenIds[b.id] || !b.token;
                  const currentTokenVal =
                    tokenInputMap[b.id] !== undefined ? tokenInputMap[b.id] : (b.token || '');

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong className="text-gray-900">{b.month}</strong>
                        <span className="tenant-subtext">{b.id}</span>
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

                      {/* HERO COLUMN: KOLOM TOKEN LISTRIK */}
                      <td>
                        {isEditingToken ? (
                          <div className="token-cell-wrapper">
                            <div className="token-input-group">
                              <input
                                type="text"
                                className="token-input-field"
                                placeholder="Ketik 20 digit token..."
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
                                onClick={() => handleAutoFillToken(b.id)}
                                title="Auto-fill 20 digit token PLN"
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

                      <td>{b.meterStart} kWh</td>

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
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(b)}
                          title="Klik untuk ganti status (Lunas / Belum Bayar)"
                        >
                          {b.status === 'Lunas' ? '✓ Lunas' : b.status}
                        </span>
                      </td>

                      <td className="text-xs text-gray-500">{b.recordedBy}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    Belum ada data pencatatan meteran listrik pada filter ini.
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
                <h3 className="modal-title">Terbitkan Tagihan Utilitas Bulan Baru</h3>
                <p className="modal-subtitle">
                  Masukkan bulan dan tahun penagihan listrik untuk seluruh penghuni kos aktif.
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
                  Sistem akan otomatis membuat tagihan listrik untuk seluruh {tenants.filter((t) => t.status === 'Aktif').length} kamar penghuni aktif, sehingga petugas tinggal memasukkan kolom tokennya.
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
    </div>
  );
};
