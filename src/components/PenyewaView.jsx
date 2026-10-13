import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconPhone,
  IconRoom,
  IconShield,
  IconCheck,
  IconArrowLeft,
  IconCalendar,
  IconWhatsApp
} from './Icons';
import { SearchableRoomSelect } from './SearchableRoomSelect';

export const PenyewaView = () => {
  const {
    tenants,
    rooms,
    currentUser,
    handleSaveTenant,
    handleDeleteTenant
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all'); // 'all' | '1' | '2'
  
  // 'list' or 'form' (dedicated full-page view for editing/adding)
  const [viewMode, setViewMode] = useState('list');
  const [editingTenant, setEditingTenant] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roomNumber: '101',
    roomType: 'Deluxe Taman (AC + KM Dalam)',
    monthlyRent: 1750000,
    startDate: new Date().toISOString().split('T')[0],
    emergencyContact: '',
    notes: ''
  });

  const isOwnerReadOnly = currentUser.role === 'owner';

  const openAddForm = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      phone: '',
      roomNumber: '101',
      roomType: 'Deluxe Taman (AC + KM Dalam)',
      monthlyRent: 1750000,
      startDate: new Date().toISOString().split('T')[0],
      emergencyContact: '',
      notes: ''
    });
    setViewMode('form');
  };

  const openEditForm = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      roomNumber: tenant.roomNumber,
      roomType: tenant.roomType || 'Deluxe Taman (AC + KM Dalam)',
      monthlyRent: tenant.monthlyRent || 1750000,
      startDate: tenant.startDate || '',
      emergencyContact: tenant.emergencyContact || '',
      notes: tenant.notes || ''
    });
    setViewMode('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveTenant({
      ...(editingTenant ? { id: editingTenant.id } : {}),
      ...formData
    });
    setViewMode('list');
  };

  // Format tanggal Indonesia e.g. "2024-01-10" -> "10 Jan 2024"
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = String(dateStr).split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${months[monthIdx]} ${year}`;
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Avatar Initials (e.g. "Andi Pratama" -> "AP")
  const getInitials = (name) => {
    if (!name) return 'AK';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Parse emergency contact string: "081299001122 (Ayah)" -> { phone: "081299001122", relation: "Ayah" }
  const parseEmergency = (str) => {
    if (!str || str === '-') return { phone: '-', relation: '' };
    const match = str.match(/(.*?)\s*\((.*?)\)/);
    if (match) {
      return { phone: match[1].trim(), relation: match[2].trim() };
    }
    return { phone: str.trim(), relation: '' };
  };

  const filteredTenants = tenants.filter((t) => {
    // KONEKSI UTAMA: Kamar harus benar-benar ada di master data rooms (halaman kamar)!
    const roomExists = rooms.some((r) => String(r.number) === String(t.roomNumber));
    if (!roomExists) return false;

    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone && t.phone.includes(searchTerm)) ||
      (t.roomNumber && t.roomNumber.includes(searchTerm));
    const matchType =
      filterRoomType === 'all' || (t.roomType && t.roomType.includes(filterRoomType));
    const floor = String(t.roomNumber).startsWith('1') ? '1' : '2';
    const matchFloor = filterFloor === 'all' || floor === filterFloor;
    return matchSearch && matchType && matchFloor;
  });

  const validTenants = tenants.filter((t) => rooms.some((r) => String(r.number) === String(t.roomNumber)));
  const floor1Count = validTenants.filter((t) => String(t.roomNumber).startsWith('1')).length;
  const floor2Count = validTenants.filter((t) => String(t.roomNumber).startsWith('2')).length;

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
            <span>Kembali ke Daftar Penyewa</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">
              {editingTenant ? `Ubah Data Anak Kos: ${editingTenant.name}` : 'Pendaftaran Penghuni Kos Baru'}
            </h2>
            <p className="form-page-subheading">
              {editingTenant
                ? `Perbarui rincian sewa, kontak WhatsApp untuk login, dan informasi kamar ${editingTenant.roomNumber}`
                : 'Lengkapi identitas penghuni baru. Nomor handphone akan digunakan penghuni untuk login ke portal.'}
            </p>
          </div>
        </div>

        {/* Dedicated Full Form Card */}
        <div className="form-page-card">
          <form onSubmit={handleSubmit} className="form-page-content">
            {/* Section 1: Informasi Personal & Kontak */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconUsers size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Informasi Penghuni & Akun Portal</h3>
                  <p className="form-section-subtitle">
                    Data nama dan nomor handphone resmi yang didaftarkan pada kos Gladiola
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Penghuni *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Rizky Ramadhan"
                    required
                    autoFocus
                  />
                  <span className="field-hint">Nama sesuai KTP / identitas resmi</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Handphone (WhatsApp) *</label>
                  <div className="input-with-prefix">
                    <span className="phone-prefix">+62 / 08</span>
                    <input
                      type="tel"
                      className="form-input-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 081233445566"
                      required
                    />
                  </div>
                  <span className="field-hint">Wajib aktif! Nomor ini digunakan langsung untuk login portal kos tanpa password.</span>
                </div>
              </div>
            </div>

            {/* Section 2: Kamar & Rincian Sewa */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconRoom size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Data Kamar & Biaya Sewa</h3>
                  <p className="form-section-subtitle">
                    Penempatan unit kamar dan kesepakatan tarif sewa bulanan
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Pilih Nomor Kamar * (Pencarian Cepat)</label>
                  <SearchableRoomSelect
                    rooms={rooms}
                    value={formData.roomNumber}
                    onChange={(roomNum) => {
                      const matched = rooms.find((r) => String(r.number) === String(roomNum));
                      setFormData({
                        ...formData,
                        roomNumber: roomNum,
                        ...(matched ? { roomType: matched.type, monthlyRent: matched.price } : {})
                      });
                    }}
                    placeholder="Pilih atau cari nomor kamar..."
                  />
                  <span className="field-hint">Pilih dari 10 unit kamar (5 di Lantai 1 & 5 di Lantai 2) Gladiola</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipe Kamar</label>
                  <select
                    className="form-select"
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  >
                    <option value="Deluxe Taman (AC + KM Dalam)">Deluxe Taman (AC + KM Dalam)</option>
                    <option value="Executive Balcony">Executive Balcony</option>
                    <option value="Standard Sejuk">Standard Sejuk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tarif Sewa Bulanan (Rp) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Contoh: 1750000"
                    required
                  />
                  <span className="field-hint">Nominal tagihan sewa kamar yang akan divalidasi setiap bulan</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Mulai Masuk Kos</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <span className="field-hint">Tanggal check-in awal penghuni</span>
                </div>
              </div>
            </div>

            {/* Section 3: Kontak Darurat & Catatan */}
            <div className="form-section-block">
              <div className="form-section-header">
                <IconPhone size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Kontak Darurat & Catatan Tambahan</h3>
                  <p className="form-section-subtitle">
                    Informasi penting keluarga dan keterangan kendaraan bermotor
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid full-span">
                <div className="form-group">
                  <label className="form-label">Kontak Darurat (Orang Tua / Wali / Kerabat)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Contoh: 081299887766 (Ibu Rahayu - Surabaya)"
                  />
                  <span className="field-hint">Nomor yang dapat dihubungi saat situasi darurat</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan / Pekerjaan / Kendaraan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: Mahasiswa UB Jurusan Kedokteran, Sepeda Motor Honda Vario Hitam N 1234 AB"
                  />
                  <span className="field-hint">Keterangan plat nomor motor, kampus/kantor, atau catatan khusus</span>
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
                <span>{editingTenant ? 'Simpan Perubahan Data' : 'Daftarkan Penghuni Kos'}</span>
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
    <div className="penyewa-container">
      {/* Role Notice for Owner */}
      {isOwnerReadOnly && (
        <div className="owner-readonly-banner">
          <IconShield size={20} className="text-forest-gold" />
          <div>
            <strong className="block text-gray-800">Mode Akses Pemilik (Owner): Read-Only</strong>
            <span className="text-sm text-gray-600">
              Sesuai ketentuan, Owner dapat memantau data seluruh penghuni kos, namun tidak dapat menambah atau mengubah data penyewa.
            </span>
          </div>
        </div>
      )}

      {/* Toolbar Pencarian & Filter */}
      <div className="section-toolbar" style={{ margin: '14px 0 16px 0', padding: '0 2px' }}>
        <div className="toolbar-search-group" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="search-box-pill" style={{ minWidth: '260px' }}>
            <IconSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kamar, no HP anak kos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '12px' }}
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="filter-select"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="all">Semua Lantai (1-2)</option>
            <option value="1">Lantai 1</option>
            <option value="2">Lantai 2</option>
          </select>

          <select
            className="filter-select"
            value={filterRoomType}
            onChange={(e) => setFilterRoomType(e.target.value)}
          >
            <option value="all">Semua Tipe Kamar</option>
            <option value="Deluxe">Deluxe Taman</option>
            <option value="Executive">Executive Balcony</option>
            <option value="Standard">Standard Sejuk</option>
          </select>
        </div>

        {!isOwnerReadOnly && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              marginLeft: 'auto'
            }}
          >
            <IconPlus size={16} />
            <span>Tambah Anak Kos</span>
          </button>
        )}
      </div>

      {/* Tenants Table Card */}
      <div className="penyewa-table-card">
        {/* Table Header Strip */}
        <div className="penyewa-card-header">
          <div className="penyewa-card-title-group">
            <h3>
              <IconUsers size={18} className="text-forest-700" />
              Direktori Penghuni Kos Gladiola
            </h3>
            <p>
              Data identitas, kontak WhatsApp, nomor unit kamar, dan tarif sewa bulanan anak kos terdaftar
            </p>
          </div>

          <div className="penyewa-stats-chips">
            <span className="penyewa-stat-pill">
              🌿 Menampilkan: <strong>{filteredTenants.length}</strong> Anak Kos
            </span>
            <span className="penyewa-stat-pill">
              🏢 Lantai 1: <strong>{floor1Count}</strong>
            </span>
            <span className="penyewa-stat-pill">
              🍃 Lantai 2: <strong>{floor2Count}</strong>
            </span>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="penyewa-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Penghuni Kos</th>
                <th style={{ width: '13%' }}>Unit Kamar</th>
                <th style={{ width: '15%' }}>Tipe Kamar</th>
                <th style={{ width: '13%' }}>Tarif Sewa</th>
                <th style={{ width: '12%' }}>Tanggal Masuk</th>
                <th style={{ width: '13%' }}>Kontak Darurat</th>
                <th style={{ width: '14%' }}>Catatan / Kendaraan</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                {!isOwnerReadOnly && <th style={{ width: '7%', textAlign: 'center' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => {
                  const emergency = parseEmergency(tenant.emergencyContact);
                  const floorNum = String(tenant.roomNumber).startsWith('1') ? 1 : 2;
                  const waNumber = (tenant.phone || '').replace(/^0/, '62').replace(/\D/g, '');

                  return (
                    <tr key={tenant.id}>
                      {/* Penghuni Kos */}
                      <td>
                        <div className="tenant-identity-cell">
                          <div className="tenant-avatar-circle" title={tenant.name}>
                            {getInitials(tenant.name)}
                          </div>
                          <div className="tenant-identity-meta">
                            <span className="tenant-name-text">{tenant.name}</span>
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tenant-phone-badge"
                              title="Kirim pesan WhatsApp ke penghuni"
                            >
                              <IconPhone size={11} className="text-forest-600" />
                              <span>{tenant.phone}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Unit Kamar & Lantai */}
                      <td>
                        <div className="room-unit-pill">
                          <span className="room-pill-badge">
                            Kamar {tenant.roomNumber}
                          </span>
                          <span className="room-floor-tag">
                            • Lantai {floorNum}
                          </span>
                        </div>
                      </td>

                      {/* Tipe Kamar */}
                      <td>
                        <div className="room-type-chip">
                          <span className="room-type-title">
                            {tenant.roomType ? tenant.roomType.split('(')[0].trim() : 'Deluxe Taman'}
                          </span>
                          {tenant.roomType && tenant.roomType.includes('(') && (
                            <span className="room-type-desc">
                              {tenant.roomType.split('(')[1].replace(')', '')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tarif Sewa */}
                      <td>
                        <div className="rent-price-box">
                          <span className="rent-price-amount">
                            Rp {(tenant.monthlyRent || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="rent-price-period">per bulan</span>
                        </div>
                      </td>

                      {/* Tanggal Masuk */}
                      <td>
                        <div className="date-join-badge">
                          <IconCalendar size={13} className="text-forest-600" />
                          <span>{formatDateIndo(tenant.startDate)}</span>
                        </div>
                      </td>

                      {/* Kontak Darurat */}
                      <td>
                        <div className="emergency-contact-box">
                          {emergency.relation && (
                            <span className="emergency-relation-tag">
                              {emergency.relation}
                            </span>
                          )}
                          <span className="emergency-phone-text">
                            {emergency.phone}
                          </span>
                        </div>
                      </td>

                      {/* Catatan / Kendaraan */}
                      <td>
                        <div className="notes-tenant-pill" title={tenant.notes || '-'}>
                          {tenant.notes || '-'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="status-live-pill">
                          <span className="status-dot-pulse"></span>
                          <span>{tenant.status || 'Aktif'}</span>
                        </span>
                      </td>

                      {/* Aksi */}
                      {!isOwnerReadOnly && (
                        <td>
                          <div className="table-action-group" style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn-table-edit"
                              onClick={() => openEditForm(tenant)}
                              title="Ubah Data Anak Kos (Pindah ke Form)"
                            >
                              <IconEdit size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-table-delete"
                              onClick={() => {
                                if (window.confirm(`Hapus data anak kos ${tenant.name} dari sistem?`)) {
                                  handleDeleteTenant(tenant.id);
                                }
                              }}
                              title="Hapus Data Anak Kos"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isOwnerReadOnly ? 8 : 9} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <IconSearch size={28} className="text-gray-300" />
                      <strong>Tidak ada anak kos yang sesuai dengan filter pencarian.</strong>
                      <span style={{ fontSize: '0.78rem' }}>Coba ubah kata kunci atau setel ulang filter lantai dan tipe kamar.</span>
                    </div>
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
