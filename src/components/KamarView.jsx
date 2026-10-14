import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconRoom,
  IconCheck,
  IconUsers,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconLightning
} from './Icons';

const AVAILABLE_FACILITIES = [
  "AC Split",
  "Kamar Mandi Dalam",
  "Water Heater",
  "Spring Bed Queen",
  "Lemari Jati",
  "Meja Belajar",
  "Smart Lock",
  "TV Android",
  "WiFi 5G",
  "Balkon Pribadi",
  "Jendela Hadap Taman",
  "Kulkas Mini"
];

// Helper to generate a realistic 20-digit PLN electricity token
const generateRandomToken = () => {
  const part = () => Math.floor(1000 + Math.random() * 9000);
  return `${part()}-${part()}-${part()}-${part()}-${part()}`;
};

export const KamarView = () => {
  const {
    rooms,
    tenants,
    currentUser,
    handleSaveRoom,
    handleDeleteRoom,
    addToast
  } = useApp();

  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'Bulanan' | 'Harian'
  const [searchTerm, setSearchTerm] = useState('');

  // 'list' or 'form' (Dedicated full-page CRUD view)
  const [viewMode, setViewMode] = useState('list');
  const [editingRoom, setEditingRoom] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    number: '',
    floor: 1,
    type: 'Deluxe Taman (AC + KM Dalam)',
    category: 'Bulanan', // 'Bulanan' | 'Harian'
    dailyPrice: 250000,
    price: 1600000,
    status: 'Kosong',
    currentTenant: '',
    electricityToken: '',
    meterId: '',
    electricityRate: 1650,
    facilities: [
      'AC Split',
      'Spring Bed Queen',
      'Kamar Mandi Dalam',
      'Water Heater',
      'Lemari Jati',
      'Meja Belajar',
      'Smart Lock'
    ]
  });

  const isOwnerReadOnly = currentUser.role === 'owner';

  const openAddForm = () => {
    if (isOwnerReadOnly) {
      addToast('Owner hanya memiliki hak akses memantau kamar!', 'error');
      return;
    }
    setEditingRoom(null);
    setFormData({
      number: '',
      floor: 1,
      type: 'Deluxe Taman (AC + KM Dalam)',
      category: 'Bulanan',
      dailyPrice: 250000,
      price: 1600000,
      status: 'Kosong',
      currentTenant: '',
      electricityToken: generateRandomToken(),
      meterId: `PLN-14${Math.floor(10000000 + Math.random() * 90000000)}`,
      electricityRate: 1650,
      facilities: [
        'AC Split',
        'Spring Bed Queen',
        'Kamar Mandi Dalam',
        'Water Heater',
        'Lemari Jati',
        'Meja Belajar',
        'Smart Lock'
      ]
    });
    setViewMode('form');
  };

  const openEditForm = (room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      floor: room.floor || 1,
      type: room.type || 'Deluxe Taman (AC + KM Dalam)',
      category: room.category || 'Bulanan',
      dailyPrice: room.dailyPrice || (room.type?.includes('Executive') ? 275000 : 250000),
      price: room.price || 1600000,
      status: room.status || 'Kosong',
      currentTenant: room.currentTenant || '',
      electricityToken: room.electricityToken || generateRandomToken(),
      meterId: room.meterId || `PLN-14${Math.floor(10000000 + Math.random() * 90000000)}`,
      electricityRate: room.electricityRate || 1650,
      facilities: Array.isArray(room.facilities) && room.facilities.length > 0
        ? [...room.facilities]
        : ['AC Split', 'Spring Bed Queen', 'Kamar Mandi Dalam', 'Smart Lock']
    });
    setViewMode('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOwnerReadOnly) return;

    if (!formData.number.trim()) {
      addToast('Nomor kamar wajib diisi!', 'error');
      return;
    }

    const result = handleSaveRoom({
      ...(editingRoom ? { id: editingRoom.id } : {}),
      number: formData.number.trim(),
      floor: Number(formData.floor),
      type: formData.type,
      category: formData.category || 'Bulanan',
      dailyPrice: Number(formData.dailyPrice) || 250000,
      price: Number(formData.price),
      status: formData.status,
      currentTenant: formData.status === 'Kosong' ? null : (formData.currentTenant?.trim() || null),
      electricityToken: formData.electricityToken?.trim() || '',
      meterId: formData.meterId?.trim() || '',
      electricityRate: Number(formData.electricityRate) || 1650,
      facilities: formData.facilities
    });

    if (result !== false) {
      setViewMode('list');
    }
  };

  const handleDelete = (roomId) => {
    if (isOwnerReadOnly) return;
    if (window.confirm(`Yakin ingin menghapus Kamar ${formData.number}? Tindakan ini tidak dapat dibatalkan.`)) {
      handleDeleteRoom(roomId);
      setViewMode('list');
    }
  };

  // Filtered rooms for the grid view
  const filteredRooms = rooms.filter((r) => {
    const matchFloor = filterFloor === 'all' || r.floor === parseInt(filterFloor);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchCategory = filterCategory === 'all' || (r.category || 'Bulanan') === filterCategory;
    const matchSearch =
      r.number.includes(searchTerm) ||
      (r.currentTenant && r.currentTenant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFloor && matchStatus && matchCategory && matchSearch;
  });

  const occupiedCount = rooms.filter((r) => r.status === 'Terisi').length;
  const bookingCount = rooms.filter((r) => r.status === 'Booking').length;
  const vacantCount = rooms.filter((r) => r.status === 'Kosong').length;
  const harianCount = rooms.filter((r) => r.category === 'Harian').length;
  const bulananCount = rooms.filter((r) => r.category !== 'Harian').length;

  // =========================================================================
  // DEDICATED FULL-PAGE CRUD FORM VIEW (PINDAH HALAMAN)
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
            <span>Kembali ke Daftar Kamar</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">
              {editingRoom ? `Kelola & Edit Kamar ${editingRoom.number}` : 'Pendaftaran Unit Kamar Baru'}
            </h2>
            <p className="form-page-subheading">
              {editingRoom
                ? `Perbarui rincian spesifikasi, penetapan tarif, status ketersediaan, penghuni, dan fasilitas Kamar ${editingRoom.number}`
                : 'Lengkapi spesifikasi unit kamar baru untuk didaftarkan ke sistem Gladiola Guest House'}
            </p>
          </div>
        </div>

        {/* Dedicated Full Form Card */}
        <div className="form-page-card">
          <form onSubmit={handleSubmit} className="form-page-content">
            {/* Section 1: Informasi Unit Kamar */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconRoom size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Informasi Dasar & Lokasi Unit</h3>
                  <p className="form-section-subtitle">
                    Nomor unit kamar, lantai, tipe ruangan, dan tarif sewa bulanan
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Nomor Kamar *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="Contoh: 101, 205, 315"
                    required
                    disabled={isOwnerReadOnly}
                  />
                  <span className="field-hint">Nomor unik unit kamar Gladiola</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Lantai Unit *</label>
                  <select
                    className="form-select"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    disabled={isOwnerReadOnly}
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                  </select>
                  <span className="field-hint">Lokasi lantai gedung Gladiola Guest House</span>
                </div>

                {/* Kategori Kamar: Kos Bulanan vs Sewa Harian */}
                <div className="form-group">
                  <label className="form-label">Kategori Peruntukan Kamar *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={isOwnerReadOnly}
                  >
                    <option value="Bulanan">🏡 Kos Bulanan (Penyewa Kos Tetap)</option>
                    <option value="Harian">⚡ Sewa Harian (Disewakan Per Hari / Guest House)</option>
                  </select>
                  <span className="field-hint">
                    {formData.category === 'Harian'
                      ? 'Kamar ini disewakan harian & otomatis tersedia di sistem booking tanggal'
                      : 'Kamar ini diperuntukkan untuk anak kos bulanan reguler'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipe Kamar *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let defaultPrice = formData.price;
                      let defaultDailyPrice = formData.dailyPrice;
                      if (newType.includes('Executive')) {
                        defaultPrice = 2100000;
                        defaultDailyPrice = 275000;
                      } else if (newType.includes('Standard')) {
                        defaultPrice = 1500000;
                        defaultDailyPrice = 200000;
                      } else {
                        defaultPrice = 1600000;
                        defaultDailyPrice = 250000;
                      }
                      setFormData({ ...formData, type: newType, price: defaultPrice, dailyPrice: defaultDailyPrice });
                    }}
                    disabled={isOwnerReadOnly}
                  >
                    <option value="Deluxe Taman (AC + KM Dalam)">Deluxe Taman (AC + KM Dalam)</option>
                    <option value="Executive Balcony">Executive Balcony</option>
                    <option value="Standard Sejuk">Standard Sejuk</option>
                  </select>
                  <span className="field-hint">Kategori tipe unit kamar</span>
                </div>

                {/* Input Tarif Sewa Harian jika Kategori Harian */}
                {formData.category === 'Harian' && (
                  <div className="form-group">
                    <label className="form-label">Tarif Sewa Harian per Malam (Rp) *</label>
                    <div className="input-with-prefix">
                      <span className="phone-prefix">Rp</span>
                      <input
                        type="number"
                        className="form-input-phone"
                        value={formData.dailyPrice}
                        onChange={(e) => setFormData({ ...formData, dailyPrice: parseInt(e.target.value) || 0 })}
                        step="25000"
                        min="50000"
                        required
                        disabled={isOwnerReadOnly}
                      />
                    </div>
                    <span className="field-hint">Tarif sewa per malam saat tamu memesan kamar harian ini</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {formData.category === 'Harian' ? 'Tarif Estimasi Bulanan (Rp)' : 'Tarif Sewa Bulanan (Rp) *'}
                  </label>
                  <div className="input-with-prefix">
                    <span className="phone-prefix">Rp</span>
                    <input
                      type="number"
                      className="form-input-phone"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      step="50000"
                      min="500000"
                      required
                      disabled={isOwnerReadOnly}
                    />
                  </div>
                  <span className="field-hint">
                    {formData.category === 'Harian'
                      ? 'Tarif bulanan referensi jika disewa jangka panjang'
                      : 'Harga sewa dasar bulanan kamar untuk anak kos'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Status & Penghuni */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconUsers size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Status Ketersediaan & Penghuni</h3>
                  <p className="form-section-subtitle">
                    Kondisi ketersediaan kamar dan data penghuni yang menempati unit ini
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Status Kamar *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData({
                        ...formData,
                        status: newStatus,
                        currentTenant: newStatus === 'Kosong' ? '' : formData.currentTenant
                      });
                    }}
                    disabled={isOwnerReadOnly}
                  >
                    <option value="Terisi">Terisi (Ditempati)</option>
                    <option value="Booking">Booking (Telah Dipesan)</option>
                    <option value="Kosong">Kosong (Tersedia untuk Disewa)</option>
                  </select>
                  <span className="field-hint">Status okupansi kamar saat ini</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Penghuni Saat Ini</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.currentTenant}
                    onChange={(e) => setFormData({ ...formData, currentTenant: e.target.value })}
                    placeholder={formData.status === 'Kosong' ? 'Kamar kosong & tersedia' : 'Contoh: Rizky Ramadhan'}
                    disabled={formData.status === 'Kosong' || isOwnerReadOnly}
                  />
                  <span className="field-hint">
                    {formData.status === 'Kosong'
                      ? 'Otomatis kosong karena status kamar diset Kosong'
                      : 'Nama penyewa aktif atau calon penghuni yang memesan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Kelistrikan & Token Listrik PLN Tetap */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconLightning size={20} className="text-forest-gold" />
                <div>
                  <h3 className="form-section-title">Kelistrikan & Nomor Token Listrik PLN Tetap</h3>
                  <p className="form-section-subtitle">
                    Kunci nomor token listrik PLN 20 digit atau nomor seri meteran khusus kamar ini agar otomatis sinkron ke tagihan utilitas & anak kos
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Nomor Token PLN Tetap *</span>
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>Terkunci Tetap (Fixed)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.electricityToken}
                      onChange={(e) => setFormData({ ...formData, electricityToken: e.target.value })}
                      placeholder="Contoh: 3819-2041-8812-9014-5521"
                      required
                      disabled={isOwnerReadOnly}
                      style={{ letterSpacing: '0.04em', fontWeight: 600, fontFamily: 'monospace' }}
                    />
                    {!isOwnerReadOnly && (
                      <button
                        type="button"
                        className="btn-secondary-sm"
                        onClick={() => setFormData({ ...formData, electricityToken: generateRandomToken() })}
                        title="Generate contoh 20 digit token PLN otomatis"
                        style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px', height: '42px', padding: '0 12px' }}
                      >
                        <IconLightning size={14} className="text-forest-gold" />
                        <span>Auto Token</span>
                      </button>
                    )}
                  </div>
                  <span className="field-hint">
                    Nomor token PLN ini terkunci tetap untuk Kamar {formData.number || 'ini'}. Saat generate tagihan utilitas bulanan, token otomatis terisi dari sini.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">No. ID Meter / Seri PLN (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.meterId}
                    onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                    placeholder="Contoh: PLN-142899120441"
                    disabled={isOwnerReadOnly}
                  />
                  <span className="field-hint">Nomor seri ID meteran PLN yang tertempel pada box kWh kamar</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tarif Listrik per kWh (Rp)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.electricityRate}
                      onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })}
                      placeholder="1650"
                      disabled={isOwnerReadOnly}
                      style={{ fontWeight: 600 }}
                    />
                  </div>
                  <span className="field-hint">
                    Biaya per kWh khusus unit ini (default Rp 1.650). Nilai ini juga dapat diedit sewaktu-waktu langsung di tabel Utilitas.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Fasilitas Kamar */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconCheck size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Fasilitas Unit Kamar</h3>
                  <p className="form-section-subtitle">
                    Pilih fasilitas yang tersedia di dalam unit kamar ini
                  </p>
                </div>
              </div>

              <div className="facilities-toggle-grid">
                {AVAILABLE_FACILITIES.map((facility, idx) => {
                  const isChecked = formData.facilities.includes(facility);
                  return (
                    <label
                      key={idx}
                      className={`facility-checkbox-label ${isChecked ? 'active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isOwnerReadOnly) return;
                          const nextFacilities = isChecked
                            ? formData.facilities.filter((f) => f !== facility)
                            : [...formData.facilities, facility];
                          setFormData({ ...formData, facilities: nextFacilities });
                        }}
                        disabled={isOwnerReadOnly}
                      />
                      <span>{facility}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="form-actions-bar">
              <div className="actions-left">
                {editingRoom && !isOwnerReadOnly && (
                  <button
                    type="button"
                    className="btn-danger-action"
                    onClick={() => handleDelete(editingRoom.id)}
                  >
                    <IconTrash size={16} />
                    <span>Hapus Kamar Ini</span>
                  </button>
                )}
              </div>

              <div className="actions-right">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setViewMode('list')}
                >
                  Batal
                </button>

                {!isOwnerReadOnly && (
                  <button type="submit" className="btn-primary-action">
                    <IconCheck size={18} />
                    <span>{editingRoom ? 'Simpan Perubahan Kamar' : 'Tambahkan Kamar Baru'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LIST VIEW: 50 ROOM CARDS GRID
  // =========================================================================
  return (
    <div className="kamar-container">
      {/* Floor & Status Statistics */}
      <div className="kamar-stat-pills-row">
        <div className="kamar-stat-pill">
          <span>Total Kamar:</span>
          <strong>{rooms.length} Unit</strong>
        </div>
        <div className="kamar-stat-pill green">
          <span className="dot green"></span>
          <span>Terisi: {occupiedCount} Unit ({Math.round((occupiedCount / (rooms.length || 50)) * 100)}%)</span>
        </div>
        <div className="kamar-stat-pill blue">
          <span className="dot blue"></span>
          <span>Booking: {bookingCount} Unit</span>
        </div>
        <div className="kamar-stat-pill sand">
          <span className="dot sand"></span>
          <span>Kosong: {vacantCount} Unit</span>
        </div>
        <div className="kamar-stat-pill" style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }}>
          <span>⚡ Sewa Harian: <strong>{harianCount} Unit</strong></span>
        </div>
        <div className="kamar-stat-pill" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
          <span>🏡 Kos Bulanan: <strong>{bulananCount} Unit</strong></span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari no kamar / nama penghuni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Kategori Peruntukan Kamar */}
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            title="Filter Kategori Peruntukan Kamar"
          >
            <option value="all">Semua Kategori (Bulanan & Harian)</option>
            <option value="Harian">⚡ Sewa Harian ({harianCount} Kamar)</option>
            <option value="Bulanan">🏡 Kos Bulanan ({bulananCount} Kamar)</option>
          </select>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Terisi">Terisi</option>
            <option value="Booking">Booking</option>
            <option value="Kosong">Kosong (Tersedia)</option>
          </select>

          <select
            className="filter-select"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="all">Semua Lantai</option>
            <option value="1">Lantai 1</option>
            <option value="2">Lantai 2</option>
          </select>
        </div>

        {!isOwnerReadOnly && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddForm}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <IconPlus size={16} />
            <span>Tambah Kamar Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Room Cards (Click to navigate to CRUD full-page view) */}
      <div className="room-cards-grid">
        {filteredRooms.map((room) => {
          const isHarian = room.category === 'Harian';
          return (
            <div
              key={room.id}
              className={`room-grid-card ${room.status.toLowerCase()}`}
              onClick={() => openEditForm(room)}
              title={`Klik untuk kelola & ubah data Kamar ${room.number} (${isHarian ? 'Sewa Harian' : 'Kos Bulanan'})`}
            >
              <div className="room-card-top-row">
                <span className="room-num-title">Kamar {room.number}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className={`badge-status ${
                      room.status === 'Terisi'
                        ? 'badge-success'
                        : room.status === 'Booking'
                        ? 'badge-info'
                        : 'badge-vacant'
                    }`}
                  >
                    {room.status}
                  </span>
                  {!isOwnerReadOnly && (
                    <button
                      type="button"
                      className="btn-card-quick-delete"
                      title={`Hapus Kamar ${room.number} & sinkronkan seluruh halaman`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Yakin ingin menghapus Kamar ${room.number}? Semua data penyewa, tagihan sewa, listrik, dan reservasi untuk kamar ini akan ikut terhapus di seluruh halaman.`)) {
                          handleDeleteRoom(room.id);
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <IconTrash size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Kategori Badge Chip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 6px 0', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isHarian ? '#f5f3ff' : '#f0fdf4',
                    color: isHarian ? '#7c3aed' : '#16a34a',
                    border: `1px solid ${isHarian ? '#ddd6fe' : '#bbf7d0'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isHarian ? '⚡ Sewa Harian' : '🏡 Kos Bulanan'}
                </span>
                {isHarian && (
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#4338ca' }}>
                    Rp {(room.dailyPrice || 250000).toLocaleString('id-ID')}/malam
                  </span>
                )}
              </div>

              <p className="room-card-type">{room.type}</p>

              <div className="room-card-occupant-row">
                <IconUsers size={14} className="text-gray-400" />
                <span className="room-tenant-name">
                  {room.currentTenant || 'Tersedia untuk disewa'}
                </span>
              </div>

              <div className="room-card-token-row">
                <IconLightning size={12} className="text-forest-gold" />
                <span className="room-card-token-text">
                  Token: <strong>{room.electricityToken ? `${room.electricityToken.slice(0, 9)}...` : 'Belum Ada'}</strong>
                </span>
              </div>

              <div className="room-card-bottom-row">
                <span className="room-floor-tag">Lt. {room.floor}</span>
                <span className="room-price-tag">
                  {isHarian
                    ? `Rp ${(room.dailyPrice || 250000).toLocaleString('id-ID')}/malam`
                    : `Rp ${(room.price / 1000000).toFixed(1)}jt/bln`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
