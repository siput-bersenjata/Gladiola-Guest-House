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
  IconArrowLeft
} from './Icons';

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

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      t.roomNumber.includes(searchTerm);
    const matchType =
      filterRoomType === 'all' || (t.roomType && t.roomType.includes(filterRoomType));
    return matchSearch && matchType;
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
                  <label className="form-label">Pilih Nomor Kamar *</label>
                  <select
                    className="form-select"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.number}>
                        Kamar {r.number} ({r.type} - Status: {r.status})
                      </option>
                    ))}
                  </select>
                  <span className="field-hint">Pilih dari 50 kamar di lantai 1 - 3 Gladiola</span>
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

      {/* Toolbar */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari nama, kamar, no HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
          >
            <IconPlus size={16} />
            <span>Tambah Anak Kos</span>
          </button>
        )}
      </div>

      {/* Tenants Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Penghuni Kos</th>
                <th>Kamar</th>
                <th>Tipe Kamar</th>
                <th>Tarif Sewa</th>
                <th>Tanggal Masuk</th>
                <th>Kontak Darurat</th>
                <th>Catatan / Kendaraan</th>
                <th>Status</th>
                {!isOwnerReadOnly && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div>
                        <strong className="text-gray-900 block">{tenant.name}</strong>
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                          <IconPhone size={11} className="text-gray-400" />
                          {tenant.phone}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="room-badge">Kamar {tenant.roomNumber}</span>
                    </td>
                    <td className="text-sm text-gray-700">{tenant.roomType}</td>
                    <td className="text-sm font-semibold text-gray-900">
                      Rp {tenant.monthlyRent.toLocaleString('id-ID')}
                    </td>
                    <td className="text-sm text-gray-600 font-mono">{tenant.startDate}</td>
                    <td className="text-sm text-gray-600">{tenant.emergencyContact || '-'}</td>
                    <td className="text-sm text-gray-600 max-w-xs truncate" title={tenant.notes}>
                      {tenant.notes || '-'}
                    </td>
                    <td>
                      <span className="badge-status badge-success">✓ {tenant.status}</span>
                    </td>
                    {!isOwnerReadOnly && (
                      <td>
                        <div className="action-buttons-row">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => openEditForm(tenant)}
                            title="Ubah Data Penghuni (Pindah Halaman)"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action danger"
                            onClick={() => {
                              if (window.confirm(`Hapus data anak kos ${tenant.name}?`)) {
                                handleDeleteTenant(tenant.id);
                              }
                            }}
                            title="Hapus Data Penghuni"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isOwnerReadOnly ? 8 : 9} className="text-center py-8 text-gray-500">
                    Tidak ada data anak kos yang cocok dengan pencarian.
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
