import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconStar,
  IconPlus,
  IconEdit,
  IconTrash,
  IconWhatsApp,
  IconClock,
  IconCheck,
  IconUsers
} from './Icons';

export const PetugasView = () => {
  const {
    staffList,
    staffRatings,
    handleSaveStaff,
    handleDeleteStaff,
    currentUser
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    shift: 'Siang (07:00 - 19:00)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });

  const canManageStaff = currentUser.role === 'operator' || currentUser.role === 'super_admin';

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      phone: '',
      shift: 'Siang (07:00 - 19:00)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      shift: staff.shift,
      avatar: staff.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveStaff({
      ...(editingStaff ? { id: editingStaff.id } : {}),
      ...formData
    });
    setIsModalOpen(false);
  };

  const filteredRatings = staffRatings.filter(
    (r) => selectedStaffFilter === 'all' || r.staffId === selectedStaffFilter
  );

  return (
    <div className="petugas-container">
      {/* Top Controls */}
      <div className="section-toolbar">
        <div>
          <h3 className="card-headline">Daftar Petugas Operasional Kos Gladiola</h3>
          <p className="card-subheadline">
            Kontak WhatsApp & evaluasi rating pelayanan dari penghuni kos
          </p>
        </div>

        {canManageStaff && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddModal}
          >
            <IconPlus size={16} />
            <span>Tambah Data Petugas</span>
          </button>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="staff-cards-grid">
        {staffList.map((staff) => (
          <div key={staff.id} className="staff-card">
            <div className="staff-header-row">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="staff-avatar-img"
              />
              <div className="staff-name-group">
                <h4 className="staff-card-name">{staff.name}</h4>
                <span className="staff-card-role">{staff.role}</span>
                <div className="staff-rating-badge">
                  <IconStar size={14} filled={true} className="text-forest-gold" />
                  <span>{staff.avgRating} ({staff.totalReviews} ulasan)</span>
                </div>
              </div>
            </div>

            <div className="staff-shift-row">
              <IconClock size={14} className="text-gray-400" />
              <span>Shift: {staff.shift}</span>
            </div>

            <div className="staff-actions-grid">
              <a
                href={`https://wa.me/${staff.phone}?text=Halo%20${encodeURIComponent(
                  staff.name
                )},%20saya%20ingin%20bertanya%20mengenai%20operasional%20Gladiola%20Guest%20House.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-staff"
              >
                <IconWhatsApp size={16} />
                <span>WhatsApp: {staff.phone}</span>
              </a>

              {canManageStaff && (
                <div className="action-buttons-row mt-2">
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => openEditModal(staff)}
                  >
                    <IconEdit size={14} />
                    <span>Ubah Profil</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action danger"
                    onClick={() => {
                      if (window.confirm(`Hapus data petugas ${staff.name}?`)) {
                        handleDeleteStaff(staff.id);
                      }
                    }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews & Ratings Section from Tenants */}
      <div className="dashboard-card reviews-public-card mt-6">
        <div className="chart-card-header">
          <div>
            <h3 className="card-headline">Ulasan Kalimat Wajib Dari Penghuni Kos</h3>
            <p className="card-subheadline">
              Setiap penghuni yang telah tervalidasi pembayarannya wajib memberikan penilaian
            </p>
          </div>

          <select
            className="filter-select"
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
          >
            <option value="all">Semua Petugas</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="reviews-masonry-grid">
          {filteredRatings.length > 0 ? (
            filteredRatings.map((rev) => (
              <div key={rev.id} className="review-card-item">
                <div className="review-card-top">
                  <div className="review-tenant-tag">
                    <span className="room-badge-small">{rev.room}</span>
                    <strong className="text-gray-900">{rev.tenantName}</strong>
                  </div>
                  <div className="review-stars-badge">
                    <IconStar size={14} filled={true} className="text-forest-gold" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>

                <div className="review-staff-target">
                  Untuk Petugas: <strong>{rev.staffName}</strong>
                </div>

                <p className="review-body-text">"{rev.comment}"</p>

                <div className="review-card-footer">
                  <span className="text-xs text-gray-500">{rev.date}</span>
                  <span className="badge-pill-outline text-xs">
                    {rev.verifiedPaymentMonth}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 py-6 text-center full-width">
              Belum ada ulasan untuk petugas ini.
            </p>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Staff */}
      {isModalOpen && canManageStaff && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <h3 className="modal-title">
              {editingStaff ? 'Ubah Data Petugas' : 'Tambah Petugas Operasional Baru'}
            </h3>
            <p className="modal-subtitle">
              Nomor WhatsApp akan ditampilkan pada portal penghuni untuk kontak darurat
            </p>

            <form onSubmit={handleSubmit} className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Nama Petugas *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pak Bambang"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jabatan / Peran *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Contoh: Petugas Keamanan & Maintenance"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp (Awalan 62) *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 6281234567890"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shift Kerja</label>
                <select
                  className="form-select"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                >
                  <option value="Siang (07:00 - 19:00)">Siang (07:00 - 19:00)</option>
                  <option value="Malam (19:00 - 07:00)">Malam (19:00 - 07:00)</option>
                  <option value="Pagi (06:00 - 15:00)">Pagi (06:00 - 15:00)</option>
                  <option value="On-Call 24 Jam">On-Call 24 Jam</option>
                  <option value="Setiap Hari (08:00 - 20:00)">Setiap Hari (08:00 - 20:00)</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">URL Foto Avatar</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
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
                  <span>Simpan Petugas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
