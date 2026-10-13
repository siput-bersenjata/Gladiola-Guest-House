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
  IconCalendar,
  IconRoom,
  IconArrowLeft,
  IconUsers
} from './Icons';

export const PembayaranView = () => {
  const {
    rooms,
    tenants,
    payments,
    dailyBookings,
    handleSaveDailyBooking,
    handleUpdateDailyBookingPayment,
    handleDeleteDailyBooking,
    setActiveTab,
    handleValidatePayment,
    handleValidateMultiMonthPayment,
    generateMonthlyBills,
    handleBulkValidateMonth,
    currentUser,
    bankInfo,
    addToast
  } = useApp();

  // Mode Tampilan: 'list' (Daftar Tagihan & Pembayaran) | 'booking_form' (Pindah Halaman Reservasi Kamar)
  const [viewMode, setViewMode] = useState('list');
  const [activeTabCategory, setActiveTabCategory] = useState('bulanan'); // 'bulanan' | 'harian'

  // Booking Form State (Formulir Reservasi Kamar Harian)
  const [bookingForm, setBookingForm] = useState({
    checkIn: '2026-10-14',
    checkOut: '2026-10-16',
    roomNumber: '201',
    guestName: '',
    guestPhone: '',
    guestCity: '',
    guestIdNumber: '',
    notes: '',
    paymentType: 'DP Lunas', // 'DP Lunas' | 'Lunas Penuh' (Sesuai Permintaan)
    paymentMethod: 'Transfer Bank BCA'
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [dailyPaymentFilter, setDailyPaymentFilter] = useState('all'); // 'all' | 'DP Lunas' | 'Lunas Penuh'
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

  // Clean deduplicated payments list (strictly enforces 1 bill per room per month)
  // Menampilkan HANYA kamar yang ada penghuni kos nya (jika kamar kos kosong, jangan tampilkan data tagihannya)
  const cleanPaymentsList = useMemo(() => {
    const deduped = deduplicatePayments(payments || []);
    return deduped.filter((p) => {
      if (!p || !p.roomNumber) return false;
      const roomNum = String(p.roomNumber).trim().toLowerCase();

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
          (p.tenantId && t.id === p.tenantId) ||
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
        (p.tenantName && p.tenantName.trim());

      if (!hasTenant) {
        return false;
      }

      return true;
    });
  }, [payments, rooms, tenants]);

  // Distinct list of all available months across clean payments and presets
  const availableMonths = useMemo(() => {
    const set = new Set(presetMonths);
    (cleanPaymentsList || []).forEach((p) => {
      if (p.month) set.add(p.month.trim());
    });
    return Array.from(set);
  }, [cleanPaymentsList]);

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

  // Financial metrics khusus sewa harian
  const dailyMetrics = useMemo(() => {
    const list = dailyBookings || [];
    const totalCount = list.length;
    const totalIncome = list.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalPaid = list.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const dpCount = list.filter((b) => b.paymentStatus === 'DP Lunas').length;
    const lunasCount = list.filter((b) => b.paymentStatus === 'Lunas Penuh').length;
    const remainingTotal = list.reduce((acc, b) => acc + (b.remainingAmount || 0), 0);
    return { totalCount, totalIncome, totalPaid, dpCount, lunasCount, remainingTotal };
  }, [dailyBookings]);

  // Data sewa harian terfilter untuk tabel pembayaran harian
  const filteredDailyBookings = useMemo(() => {
    return (dailyBookings || []).filter((b) => {
      const matchStatus = dailyPaymentFilter === 'all' || b.paymentStatus === dailyPaymentFilter;
      const matchSearch =
        !searchQuery ||
        b.roomNumber?.includes(searchQuery) ||
        b.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestPhone?.includes(searchQuery) ||
        b.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [dailyBookings, dailyPaymentFilter, searchQuery]);

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

  // =========================================================================
  // LOGIKA RESERVASI KAMAR HARIAN & CEK KETERSEDIAAN JADWAL
  // =========================================================================
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${months[monthIndex]} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const calculateNights = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    try {
      const d1 = new Date(startStr);
      const d2 = new Date(endStr);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  // Kamar yang dialokasikan khusus untuk Sewa Harian
  const dailyRooms = useMemo(() => {
    const directDaily = rooms.filter((r) => r.category === 'Harian');
    if (directDaily.length > 0) return directDaily;
    return rooms.filter((r) => ['201', '202', '203', '204', '205', '206'].includes(r.number));
  }, [rooms]);

  // Pemeriksaan bentrok jadwal reservasi pada kamar tertentu
  const getConflictingBooking = (roomNumber, checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    return (dailyBookings || []).find((b) => {
      if (b.roomNumber !== roomNumber) return false;
      if (b.stayStatus === 'Selesai' || b.stayStatus === 'Batal') return false;
      return !(checkOut <= b.checkIn || checkIn >= b.checkOut);
    });
  };

  const selectedDailyRoom = useMemo(() => {
    return dailyRooms.find((r) => r.number === bookingForm.roomNumber) || dailyRooms[0] || null;
  }, [dailyRooms, bookingForm.roomNumber]);

  const bookingNights = useMemo(() => {
    return calculateNights(bookingForm.checkIn, bookingForm.checkOut);
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const bookingDailyRate = useMemo(() => {
    if (!selectedDailyRoom) return 250000;
    return selectedDailyRoom.dailyPrice || (selectedDailyRoom.type?.includes('Executive') ? 275000 : 250000);
  }, [selectedDailyRoom]);

  const bookingTotalCost = bookingNights * bookingDailyRate;
  const bookingDpAmount = Math.round(bookingTotalCost * 0.5);
  const bookingPaidAmount = bookingForm.paymentType === 'DP Lunas' ? bookingDpAmount : bookingTotalCost;
  const bookingRemainingAmount = bookingForm.paymentType === 'DP Lunas' ? bookingTotalCost - bookingDpAmount : 0;

  // Submit Formulir Booking Kamar Harian
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!bookingForm.guestName.trim()) {
      addToast('Nama tamu / pemesan wajib diisi!', 'error');
      return;
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      addToast('Tanggal check-in dan check-out wajib dipilih!', 'error');
      return;
    }

    if (bookingForm.checkOut <= bookingForm.checkIn) {
      addToast('Tanggal check-out harus lebih besar dari tanggal check-in (minimal 1 malam)!', 'error');
      return;
    }

    const conflict = getConflictingBooking(bookingForm.roomNumber, bookingForm.checkIn, bookingForm.checkOut);
    if (conflict) {
      addToast(
        `Kamar ${bookingForm.roomNumber} sudah terisi oleh ${conflict.guestName} (${formatIndoDate(conflict.checkIn)} s/d ${formatIndoDate(conflict.checkOut)}). Silakan pilih kamar harian lain!`,
        'error'
      );
      return;
    }

    const newBooking = {
      roomNumber: bookingForm.roomNumber,
      floor: selectedDailyRoom?.floor || 3,
      roomType: selectedDailyRoom?.type || 'Executive Balcony',
      guestName: bookingForm.guestName.trim(),
      guestPhone: bookingForm.guestPhone.trim(),
      guestCity: bookingForm.guestCity.trim(),
      guestIdNumber: bookingForm.guestIdNumber.trim(),
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      nights: bookingNights,
      dailyPrice: bookingDailyRate,
      totalAmount: bookingTotalCost,
      paidAmount: bookingPaidAmount,
      remainingAmount: bookingRemainingAmount,
      paymentStatus: bookingForm.paymentType, // "DP Lunas" | "Lunas Penuh"
      paymentMethod: bookingForm.paymentMethod,
      stayStatus: 'Terkonfirmasi',
      notes: bookingForm.notes.trim()
    };

    handleSaveDailyBooking(newBooking);
    setViewMode('list');
    setActiveTabCategory('harian');
  };

  // =========================================================================
  // VIEW MODE: HALAMAN FORMULIR BOOKING KAMAR HARIAN (PINDAH HALAMAN)
  // =========================================================================
  if (viewMode === 'booking_form') {
    return (
      <div className="pembayaran-container">
        {/* Top Navigation Bar: Kembali ke Daftar Pembayaran */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={() => setViewMode('list')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <IconArrowLeft size={18} />
            <span>← Kembali ke Daftar Pembayaran</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-status badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              ⚡ Modul Reservasi Sewa Harian
            </span>
          </div>
        </div>

        {/* Form Card Utama */}
        <div className="dashboard-card" style={{ padding: '24px 28px' }}>
          <div className="form-section-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-card)', paddingBottom: '16px' }}>
            <div className="icon-badge-box bg-warm-tint">
              <IconRoom size={24} className="text-forest-gold" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--forest-900)', margin: 0 }}>
                Pemesanan Unit Kamar Sewa Harian
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Pilih tanggal menginap, periksa ketersediaan kamar harian secara real-time, dan tentukan metode pembayaran DP Lunas atau Lunas Penuh. Data otomatis terhubung ke Jadwal Kamar di Dashboard Utama.
              </p>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit}>
            {/* LANGKAH 1: PILIH JADWAL TANGGAL MENGINAP */}
            <div className="form-section-block" style={{ marginBottom: '24px' }}>
              <div className="form-section-header">
                <IconCalendar size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">1. Pilih Jadwal Tanggal Sewa (Cek Ketersediaan)</h3>
                  <p className="form-section-subtitle">
                    Tentukan tanggal Check-In & Check-Out untuk memeriksa kamar harian mana saja yang tersedia bebas bentrok
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Check-In *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    required
                  />
                  <span className="field-hint">Mulai menginap: {formatIndoDate(bookingForm.checkIn)}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Check-Out *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                    required
                  />
                  <span className="field-hint">Selesai menginap: {formatIndoDate(bookingForm.checkOut)}</span>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="form-label">Durasi Menginap Terkalkulasi</label>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--forest-50)',
                    border: '1px solid var(--forest-100)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '1.15rem' }}>🌙</span>
                    <div>
                      <strong style={{ color: 'var(--forest-900)', fontSize: '0.98rem' }}>
                        {bookingNights} Malam
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatIndoDate(bookingForm.checkIn)} — {formatIndoDate(bookingForm.checkOut)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LANGKAH 2: PILIH KAMAR SEWA HARIAN & CEK KETERSEDIAAN */}
            <div className="form-section-block" style={{ marginBottom: '24px' }}>
              <div className="form-section-header">
                <IconRoom size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">2. Pilih Kamar Sewa Harian (Live Availability Check)</h3>
                  <p className="form-section-subtitle">
                    Sistem mendeteksi jadwal reservasi di tanggal {formatIndoDate(bookingForm.checkIn)} s/d {formatIndoDate(bookingForm.checkOut)}. Kamar yang bentrok ditandai penuh.
                  </p>
                </div>
              </div>

              <div className="booking-rooms-grid">
                {dailyRooms.map((rm) => {
                  const conflict = getConflictingBooking(rm.number, bookingForm.checkIn, bookingForm.checkOut);
                  const isAvailable = !conflict;
                  const isSelected = bookingForm.roomNumber === rm.number;

                  return (
                    <div
                      key={rm.id || rm.number}
                      className={`booking-room-choice-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isAvailable) {
                          setBookingForm({ ...bookingForm, roomNumber: rm.number });
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="room-badge-small" style={{ fontSize: '0.86rem', padding: '4px 10px' }}>
                            Kamar {rm.number}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Lantai {rm.floor || 2}
                          </span>
                        </div>
                        {isAvailable ? (
                          <span className="badge-status badge-success" style={{ fontSize: '0.70rem' }}>
                            ✓ Tersedia
                          </span>
                        ) : (
                          <span className="badge-status badge-danger" style={{ fontSize: '0.70rem' }}>
                            ✕ Penuh
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.80rem', color: 'var(--text-main)', marginTop: '2px' }}>
                        <strong>{rm.type}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tarif Sewa:</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                            Rp {(rm.dailyPrice || (rm.type?.includes('Executive') ? 275000 : 250000)).toLocaleString('id-ID')}
                            <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-muted)' }}>/malam</span>
                          </div>
                        </div>

                        {isAvailable ? (
                          <input
                            type="radio"
                            name="selectedRoomRadio"
                            checked={isSelected}
                            onChange={() => setBookingForm({ ...bookingForm, roomNumber: rm.number })}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>
                            Tersewa ({conflict.guestName?.split(' ')[0]})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LANGKAH 3: DATA IDENTITAS TAMU / PEMESAN */}
            <div className="form-section-block" style={{ marginBottom: '24px' }}>
              <div className="form-section-header">
                <IconUsers size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">3. Data Identitas Tamu / Pemesan</h3>
                  <p className="form-section-subtitle">
                    Informasi kontak tamu untuk konfirmasi reservasi dan akses kamar sewa
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Tamu *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Hendro Wijaya"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    required
                  />
                  <span className="field-hint">Nama pemesan sesuai KTP/identitas resmi</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp / HP *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Contoh: 081234567890"
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    required
                  />
                  <span className="field-hint">Untuk pengiriman invoice dan instruksi check-in</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Kota / Daerah Asal</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Surabaya / Jakarta"
                    value={bookingForm.guestCity}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestCity: e.target.value })}
                  />
                  <span className="field-hint">Asal domisili tamu</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Late check-in, butuh extra selimut"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  />
                  <span className="field-hint">Permintaan khusus tamu selama menginap</span>
                </div>
              </div>
            </div>

            {/* LANGKAH 4: DUA METODE PEMBAYARAN (DP LUNAS VS LUNAS PENUH) */}
            <div className="form-section-block" style={{ marginBottom: '24px' }}>
              <div className="form-section-header">
                <IconPayment size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">4. Metode Pembayaran Sewa (Pilihan Pembayaran)</h3>
                  <p className="form-section-subtitle">
                    Pilih skema pembayaran: <strong>DP Lunas (50%)</strong> atau <strong>Lunas Penuh (100%)</strong> sesuai instruksi sistem
                  </p>
                </div>
              </div>

              {/* 2 Metode Pembayaran Cards */}
              <div className="booking-payment-type-grid">
                {/* Opsi 1: DP Lunas */}
                <div
                  className={`booking-payment-card ${bookingForm.paymentType === 'DP Lunas' ? 'active-dp' : ''}`}
                  onClick={() => setBookingForm({ ...bookingForm, paymentType: 'DP Lunas' })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💳</span>
                      <strong style={{ fontSize: '0.98rem', color: '#b45309' }}>DP Lunas (50%)</strong>
                    </div>
                    <span className="badge-status badge-warning" style={{ fontSize: '0.72rem' }}>
                      Uang Muka
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Tamu membayar uang muka tanda jadi 50% dari total sewa. Sisa pembayaran dilunasi saat check-in di Gladiola.
                  </p>

                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                      <span style={{ color: '#92400e' }}>Nominal DP (Dibayar Sekarang):</span>
                      <strong style={{ color: '#92400e' }}>Rp {bookingDpAmount.toLocaleString('id-ID')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: '3px' }}>
                      <span style={{ color: '#b45309' }}>Sisa Saat Check-In:</span>
                      <span style={{ color: '#b45309', fontWeight: 600 }}>Rp {(bookingTotalCost - bookingDpAmount).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Opsi 2: Lunas Penuh */}
                <div
                  className={`booking-payment-card ${bookingForm.paymentType === 'Lunas Penuh' ? 'active-lunas' : ''}`}
                  onClick={() => setBookingForm({ ...bookingForm, paymentType: 'Lunas Penuh' })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💰</span>
                      <strong style={{ fontSize: '0.98rem', color: '#15803d' }}>Lunas Penuh (100%)</strong>
                    </div>
                    <span className="badge-status badge-success" style={{ fontSize: '0.72rem' }}>
                      Lunas 100%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Tamu membayar penuh 100% biaya sewa di muka. Tidak ada tanggungan sisa tagihan saat check-in.
                  </p>

                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem' }}>
                      <span style={{ color: '#166534' }}>Nominal Lunas Penuh:</span>
                      <strong style={{ color: '#166534' }}>Rp {bookingTotalCost.toLocaleString('id-ID')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: '3px' }}>
                      <span style={{ color: '#15803d' }}>Sisa Tagihan:</span>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Rp 0 (LUNAS PENUH)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saluran Metode Pembayaran */}
              <div className="form-responsive-grid" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Saluran Pembayaran</label>
                  <select
                    className="form-select"
                    value={bookingForm.paymentMethod}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value })}
                  >
                    <option value="Transfer Bank BCA">Transfer Bank BCA ({bankInfo.accountNumber})</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="QRIS Gladiola">QRIS Gladiola (Instan)</option>
                    <option value="Tunai / Cash (Kasir)">Tunai / Cash (Bayar di Tempat)</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="form-label">Status Pembayaran yang Dicatat</label>
                  <div style={{ padding: '8px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                    <span className={`badge-status ${bookingForm.paymentType === 'Lunas Penuh' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
                      ✓ {bookingForm.paymentType}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      Akan tampil di kolom pembayaran jadwal dashboard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RINGKASAN BIAYA & SUBMIT ACTIONS */}
            <div style={{
              background: 'linear-gradient(135deg, var(--forest-900) 0%, var(--forest-800) 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '28px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ringkasan Booking Kamar {bookingForm.roomNumber} ({bookingNights} Malam)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
                  Total Sewa: Rp {bookingTotalCost.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '4px' }}>
                  Status: <strong>{bookingForm.paymentType}</strong> (Dibayar: Rp {bookingPaidAmount.toLocaleString('id-ID')} {bookingRemainingAmount > 0 ? `• Sisa: Rp ${bookingRemainingAmount.toLocaleString('id-ID')}` : ''})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setViewMode('list')}
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ background: '#d4af37', color: '#1b4332', fontWeight: 800 }}
                >
                  <IconCheck size={18} />
                  <span>Konfirmasi & Terbitkan Booking</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: DAFTAR TAGIHAN KOS BULANAN & SEWA HARIAN
  // =========================================================================
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
        <div className="bank-summary-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setViewMode('booking_form')}
            style={{
              background: '#15803d',
              color: '#ffffff',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}
            title="Buka Formulir Booking Kamar Sewa Harian & Cek Ketersediaan"
          >
            <IconPlus size={16} />
            <span>Booking Kamar (Harian)</span>
          </button>

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

      {/* Switcher Tab Kategori: Tagihan Kos Bulanan vs Pembayaran Sewa Harian */}
      <div className="tab-category-switcher">
        <button
          type="button"
          className={`tab-category-btn ${activeTabCategory === 'bulanan' ? 'active-bulanan' : ''}`}
          onClick={() => setActiveTabCategory('bulanan')}
        >
          <span>🏡 Tagihan Kos Bulanan ({cleanPaymentsList.length} Tagihan)</span>
        </button>

        <button
          type="button"
          className={`tab-category-btn ${activeTabCategory === 'harian' ? 'active-harian' : ''}`}
          onClick={() => setActiveTabCategory('harian')}
        >
          <span>⚡ Pembayaran & Booking Sewa Harian ({dailyBookings.length} Reservasi)</span>
        </button>

        <button
          type="button"
          className="btn-primary-sm"
          onClick={() => setViewMode('booking_form')}
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <IconPlus size={14} />
          <span>Buat Booking Kamar Baru</span>
        </button>
      </div>

      {/* RENDER KONTEN TAB: SEWA HARIAN VS KOS BULANAN */}
      {activeTabCategory === 'harian' ? (
        <>
          {/* Summary Metrics Cards Khusus Sewa Harian */}
          <div className="pembayaran-stats-grid">
            <div className="pembayaran-stat-card card-primary">
              <span className="stat-metric-label">Total Booking Sewa Harian</span>
              <span className="stat-metric-value">{dailyMetrics.totalCount} Reservasi</span>
              <span className="stat-metric-subtext">Omset: Rp {dailyMetrics.totalIncome.toLocaleString('id-ID')}</span>
            </div>

            <div className="pembayaran-stat-card card-success">
              <span className="stat-metric-label">Pembayaran Lunas Penuh (100%)</span>
              <span className="stat-metric-value">{dailyMetrics.lunasCount} Tamu Lunas</span>
              <span className="stat-metric-subtext">Diterima Penuh di Muka</span>
            </div>

            <div className="pembayaran-stat-card card-warning">
              <span className="stat-metric-label">Pembayaran DP Lunas (50%)</span>
              <span className="stat-metric-value">{dailyMetrics.dpCount} Booking DP</span>
              <span className="stat-metric-subtext">Uang Muka Diterima</span>
            </div>

            <div className="pembayaran-stat-card card-info">
              <span className="stat-metric-label">Sisa Tagihan Saat Check-In</span>
              <span className="stat-metric-value">Rp {dailyMetrics.remainingTotal.toLocaleString('id-ID')}</span>
              <span className="stat-metric-subtext">Dari {dailyMetrics.dpCount} tamu bertipe DP</span>
            </div>
          </div>

          {/* Filter Toolbar Sewa Harian */}
          <div className="section-toolbar">
            <div className="toolbar-search-group">
              <div className="search-box-pill">
                <IconSearch size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kamar / nama tamu / kode booking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Metode / Status Bayar: DP Lunas vs Lunas Penuh */}
              <select
                className="filter-select"
                value={dailyPaymentFilter}
                onChange={(e) => setDailyPaymentFilter(e.target.value)}
                title="Filter Status Pembayaran Sewa Harian"
              >
                <option value="all">Semua Status Bayar</option>
                <option value="DP Lunas">✓ DP Lunas (Uang Muka)</option>
                <option value="Lunas Penuh">✓ Lunas Penuh (100%)</option>
              </select>
            </div>

            <div className="toolbar-search-group">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setViewMode('booking_form')}
                style={{
                  background: '#15803d',
                  color: '#ffffff',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <IconPlus size={16} />
                <span>Booking Kamar Baru</span>
              </button>
            </div>
          </div>

          {/* Tabel Pembayaran & Reservasi Sewa Harian */}
          <div className="dashboard-card no-padding">
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode & Kamar</th>
                    <th>Tamu / Pemesan & Kontak</th>
                    <th>Tipe Kamar</th>
                    <th>Jadwal Sewa (Check-In & Out)</th>
                    <th>Tarif & Total Biaya</th>
                    <th>Status Pembayaran</th>
                    <th>Rincian Terbayar / Sisa</th>
                    <th>Metode Bayar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDailyBookings.length > 0 ? (
                    filteredDailyBookings.map((b) => (
                      <tr key={b.id}>
                        {/* Kode & Kamar */}
                        <td>
                          <div className="tenant-cell-info">
                            <span className="room-badge-small">Kamar {b.roomNumber}</span>
                            <div>
                              <strong className="text-gray-900">{b.bookingCode}</strong>
                              <span className="tenant-subtext">Lantai {b.floor || 2}</span>
                            </div>
                          </div>
                        </td>

                        {/* Tamu & Kontak */}
                        <td>
                          <div>
                            <strong className="text-gray-900">{b.guestName}</strong>
                            <span className="tenant-subtext">
                              {b.guestPhone || '-'} {b.guestCity ? `• ${b.guestCity}` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Tipe Kamar */}
                        <td>
                          <span className="text-xs text-gray-700">{b.roomType}</span>
                        </td>

                        {/* Jadwal Check-In & Out */}
                        <td>
                          <div className="table-date-due">
                            <strong className="text-gray-900">
                              {formatIndoDate(b.checkIn)} - {formatIndoDate(b.checkOut)}
                            </strong>
                            <span className="due-pill" style={{ marginTop: '3px' }}>
                              📅 {b.nights} Malam
                            </span>
                          </div>
                        </td>

                        {/* Tarif & Total Biaya */}
                        <td>
                          <strong className="text-gray-900">
                            Rp {(b.totalAmount || 0).toLocaleString('id-ID')}
                          </strong>
                          <span className="tenant-subtext">
                            @{b.dailyPrice?.toLocaleString('id-ID')}/malam
                          </span>
                        </td>

                        {/* STATUS PEMBAYARAN: DP LUNAS ATAU LUNAS PENUH */}
                        <td>
                          <span
                            className={`badge-status ${
                              b.paymentStatus === 'Lunas Penuh' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            ✓ {b.paymentStatus}
                          </span>
                        </td>

                        {/* Rincian Terbayar & Sisa */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#15803d' }}>
                              Dibayar: Rp {(b.paidAmount || 0).toLocaleString('id-ID')}
                            </span>
                            {b.remainingAmount > 0 ? (
                              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#b45309' }}>
                                Sisa: Rp {(b.remainingAmount || 0).toLocaleString('id-ID')}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>
                                Lunas Penuh (Rp 0 Sisa)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Metode Bayar */}
                        <td>
                          <div className="text-xs text-gray-700">
                            <strong>{b.paymentMethod || 'Transfer BCA'}</strong>
                            <div className="text-gray-400 font-mono" style={{ fontSize: '0.68rem' }}>
                              {b.createdAt}
                            </div>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td>
                          <div className="action-buttons-row">
                            {b.paymentStatus === 'DP Lunas' && (
                              <button
                                type="button"
                                className="btn-validate-approve"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Lunaskan sisa pembayaran Rp ${(b.remainingAmount || 0).toLocaleString('id-ID')} untuk Kamar ${b.roomNumber} (${b.guestName})?`
                                    )
                                  ) {
                                    handleUpdateDailyBookingPayment(b.id, {
                                      paymentStatus: 'Lunas Penuh',
                                      paidAmount: b.totalAmount,
                                      remainingAmount: 0
                                    });
                                  }
                                }}
                                title="Tandai pembayaran telah dilunasi penuh saat tamu check-in"
                              >
                                <IconCheck size={14} />
                                <span>Lunasi Sisa</span>
                              </button>
                            )}

                            {b.guestPhone && (
                              <a
                                href={`https://wa.me/${b.guestPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp-staff"
                                style={{ padding: '6px 10px', fontSize: '0.74rem' }}
                                title="Kirim invoice / konfirmasi via WhatsApp"
                              >
                                💬 WA
                              </a>
                            )}

                            {currentUser?.role !== 'owner' && (
                              <button
                                type="button"
                                className="btn-validate-reject"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Batalkan dan hapus reservasi Kamar ${b.roomNumber} a/n ${b.guestName}?`
                                    )
                                  ) {
                                    handleDeleteDailyBooking(b.id);
                                  }
                                }}
                                title="Batalkan reservasi kamar ini"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        Belum ada reservasi sewa harian untuk filter ini. Klik "Booking Kamar Baru" untuk mendaftarkan tamu baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
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
                    Tidak ada data tagihan sewa untuk kamar berpenghuni pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

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
