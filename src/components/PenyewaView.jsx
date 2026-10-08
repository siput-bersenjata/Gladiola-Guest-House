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
  IconCheck
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roomNumber: '101',
    roomType: 'Deluxe Taman',
    monthlyRent: 1750000,
    startDate: new Date().toISOString().split('T')[0],
    emergencyContact: '',
    notes: ''
  });

  const isOwnerReadOnly = currentUser.role === 'owner';

  const openAddModal = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      phone: '',
      roomNumber: '101',
      roomType: 'Deluxe Taman',
      monthlyRent: 1750000,
      startDate: new Date().toISOString().split('T')[0],
      emergencyContact: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      roomNumber: tenant.roomNumber,
      roomType: tenant.roomType || 'Deluxe Taman',
      monthlyRent: tenant.monthlyRent || 1750000,
      startDate: tenant.startDate || '',
      emergencyContact: tenant.emergencyContact || '',
      notes: tenant.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveTenant({
      ...(editingTenant ? { id: editingTenant.id } : {}),
      ...formData
    });
    setIsModalOpen(false);
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

  return (
    <div className="penyewa-container">
      {/* Role Notice for Owner */}
      {isOwnerReadOnly && (
        <div className="owner-readonly-banner">
          <IconShield size={20} className="text-forest-gold" />
          <div>
            <strong className="block text-gray-800">Mode Akses Pemilik (Owner): Read-Only</strong>
            <span className="text-sm text-gray-600">
              Sesuai kebijakan hak akses kos, Owner dapat memantau data seluruh penghuni kos, namun tidak diizinkan menambah atau mengubah data anak kos.
            </span>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari nama, kamar, atau no HP..."
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

        {/* Add Button (Disabled/Hidden for Owner) */}
        {!isOwnerReadOnly && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddModal}
          >
            <IconPlus size={16} />
            <span>Tambah Data Anak Kos</span>
          </button>
        )}
      </div>

      {/* Tenants Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Penghuni & Kamar</th>
                <th>No. Handphone (WA)</th>
                <th>Tipe Kamar</th>
                <th>Tarif Sewa/Bln</th>
                <th>Tgl Masuk</th>
                <th>Kontak Darurat</th>
                <th>Status</th>
                {!isOwnerReadOnly && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div className="tenant-cell-info">
                        <div className="room-badge-small">Kamar {tenant.roomNumber}</div>
                        <div>
                          <strong className="text-gray-900">{tenant.name}</strong>
                          {tenant.notes && <span className="tenant-subtext">{tenant.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${tenant.phone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="phone-link"
                      >
                        <IconPhone size={14} />
                        <span>{tenant.phone}</span>
                      </a>
                    </td>
                    <td>{tenant.roomType || 'Deluxe Taman'}</td>
                    <td className="font-semibold text-gray-900">
                      Rp {tenant.monthlyRent.toLocaleString('id-ID')}
                    </td>
                    <td className="text-sm text-gray-600">{tenant.startDate || '-'}</td>
                    <td className="text-sm text-gray-600">{tenant.emergencyContact || '-'}</td>
                    <td>
                      <span className="badge-status badge-success">✓ Aktif</span>
                    </td>
                    {!isOwnerReadOnly && (
                      <td>
                        <div className="action-buttons-row">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => openEditModal(tenant)}
                            title="Ubah Data"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action danger"
                            onClick={() => {
                              if (window.confirm(`Hapus data penghuni ${tenant.name}?`)) {
                                handleDeleteTenant(tenant.id);
                              }
                            }}
                            title="Hapus Penghuni"
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
                  <td colSpan={isOwnerReadOnly ? 7 : 8} className="text-center py-6 text-gray-500">
                    Tidak ditemukan data penghuni yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Tenant */}
      {isModalOpen && !isOwnerReadOnly && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <h3 className="modal-title">
              {editingTenant ? 'Ubah Data Anak Kos' : 'Tambah Penghuni Kos Baru'}
            </h3>
            <p className="modal-subtitle">
              Pastikan nomor handphone aktif untuk login portal penghuni Gladiola.
            </p>

            <form onSubmit={handleSubmit} className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Nama Lengkap Penghuni *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rizky Ramadhan"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Handphone (Untuk Login) *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 081233445566"
                  required
                />
              </div>

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
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Masuk Kos</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Kontak Darurat (Orang Tua / Wali)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Contoh: 081299887766 (Ibu)"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Catatan Tambahan / Kendaraan</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Mahasiswa UB, Motor Vario N 1234 AB"
                />
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
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
