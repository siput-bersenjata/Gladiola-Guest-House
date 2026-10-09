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
  IconUsers,
  IconArrowLeft
} from './Icons';

export const PetugasView = () => {
  const {
    staffList,
    staffRatings,
    handleSaveStaff,
    handleDeleteStaff,
    currentUser
  } = useApp();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
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

  const openAddForm = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      phone: '',
      shift: 'Siang (07:00 - 19:00)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
    setViewMode('form');
  };

  const openEditForm = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      shift: staff.shift,
      avatar: staff.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
    setViewMode('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveStaff({
      ...(editingStaff ? { id: editingStaff.id } : {}),
      ...formData
    });
    setViewMode('list');
  };

  const filteredRatings =
    selectedStaffFilter === 'all'
      ? staffRatings
      : staffRatings.filter((r) => r.staffId === selectedStaffFilter);

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
            <span>Kembali ke Daftar Petugas</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">
              {editingStaff ? `Ubah Data Petugas: ${editingStaff.name}` : 'Tambah Petugas & Staf Baru'}
            </h2>
            <p className="form-page-subheading">
              {editingStaff
                ? `Perbarui profil, jam shift tugas, dan nomor WhatsApp resmi petugas ${editingStaff.name}`
                : 'Daftarkan petugas kos baru agar dapat dihubungi dan dirating oleh anak kos'}
            </p>
          </div>
        </div>

        {/* Dedicated Full Form Card */}
        <div className="form-page-card">
          <form onSubmit={handleSubmit} className="form-page-content">
            <div className="form-section-block">
              <div className="form-section-header">
                <IconUsers size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Profil & Kontak Petugas</h3>
                  <p className="form-section-subtitle">
                    Nama, peran spesifik, shift kerja harian, dan kontak WhatsApp darurat
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Petugas *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Pak Bambang"
                    required
                    autoFocus
                  />
                  <span className="field-hint">Nama panggilan yang dikenal penghuni kos</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan / Peran Tanggung Jawab *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Contoh: Petugas Keamanan & Maintenance"
                    required
                  />
                  <span className="field-hint">Misal: Keamanan, Kebersihan, Teknisi Listrik/AC, Front Desk</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp Resmi (Awalan 62) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 6281234567890"
                    required
                  />
                  <span className="field-hint">Gunakan kode negara (62...) agar tombol WhatsApp anak kos langsung terhubung</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Shift & Jadwal Kerja</label>
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
                  <label className="form-label">URL Foto Avatar / Profil</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                  <span className="field-hint">Foto profil yang ditampilkan pada direktori dan portal anak kos</span>
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
                <span>Simpan Data Petugas</span>
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
    <div className="petugas-container">
      {/* Header Toolbar */}
      <div className="section-toolbar">
        <div>
          <h2 className="card-headline">Tim Operasional Lapangan</h2>
          <p className="card-subheadline">
            Kontak WhatsApp staf jaga dan informasi shift kerja aktif
          </p>
        </div>

        {canManageStaff && (
          <button
            type="button"
            className="btn-primary"
            onClick={openAddForm}
          >
            <IconPlus size={16} />
            <span>Tambah Petugas</span>
          </button>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="staff-cards-grid mb-8">
        {staffList.map((staff) => (
          <div key={staff.id} className="staff-card">
            <div className="staff-header-row">
              <img src={staff.avatar} alt={staff.name} className="staff-avatar-img" />
              <div className="staff-name-group">
                <h4 className="staff-card-name">{staff.name}</h4>
                <span className="staff-card-role">{staff.role}</span>
                <div className="staff-rating-badge">
                  <IconStar size={13} filled={true} className="star-gold" />
                  <span>{staff.avgRating} ({staff.totalReviews} Ulasan)</span>
                </div>
              </div>
            </div>

            <div className="staff-shift-row">
              <IconClock size={14} className="text-gray-400" />
              <span>Shift: <strong>{staff.shift}</strong></span>
            </div>

            <div className="staff-actions-row">
              <a
                href={`https://wa.me/${staff.phone}?text=Halo%20${encodeURIComponent(staff.name)},%20saya%20penghuni%20kos%20Gladiola`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-contact"
              >
                <IconWhatsApp size={16} />
                <span>WhatsApp</span>
              </a>

              {canManageStaff && (
                <div className="staff-action-buttons">
                  <button
                    type="button"
                    className="btn-icon-action"
                    onClick={() => openEditForm(staff)}
                    title="Ubah Data Petugas (Pindah Halaman)"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action danger"
                    onClick={() => {
                      if (window.confirm(`Hapus petugas ${staff.name}?`)) {
                        handleDeleteStaff(staff.id);
                      }
                    }}
                    title="Hapus Petugas"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews & Ratings Section */}
      <div className="dashboard-card reviews-card-wrapper">
        <div className="chart-card-header">
          <div>
            <h3 className="card-headline">Daftar Rating & Ulasan dari Anak Kos</h3>
            <p className="card-subheadline">
              Ulasan nyata dari penghuni setelah menyelesaikan validasi pembayaran kos bulanan
            </p>
          </div>

          <div className="reviews-filter-box">
            <span className="filter-label">Filter Petugas:</span>
            <select
              className="filter-select"
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
            >
              <option value="all">Semua Petugas ({staffRatings.length})</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.avgRating} ★)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="reviews-list-grid">
          {filteredRatings.length > 0 ? (
            filteredRatings.map((rev) => (
              <div key={rev.id} className="review-item-card">
                <div className="review-card-header">
                  <div className="review-author-meta">
                    <div className="review-author-avatar">
                      {rev.tenantName ? rev.tenantName.charAt(0) : 'P'}
                    </div>
                    <div className="review-author-text">
                      <strong className="review-tenant-name">{rev.tenantName}</strong>
                      <div className="review-tags-wrap">
                        <span className="badge-room-tag">{rev.room}</span>
                        <span className="badge-period-tag">{rev.verifiedPaymentMonth}</span>
                      </div>
                    </div>
                  </div>

                  <div className="review-stars-pill">
                    <div className="review-stars-icons">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStar
                          key={i}
                          size={13}
                          filled={i < rev.rating}
                          className={i < rev.rating ? 'star-gold' : 'star-muted'}
                        />
                      ))}
                    </div>
                    <span className="review-rating-num">{rev.rating}.0</span>
                  </div>
                </div>

                <div className="review-recipient-banner">
                  <span className="recipient-label">Ulasan untuk:</span>
                  <span className="recipient-name">{rev.staffName}</span>
                </div>

                <div className="review-body-box">
                  <p className="review-comment-paragraph">"{rev.comment}"</p>
                </div>

                <div className="review-card-footer">
                  <div className="review-timestamp">
                    <IconClock size={13} className="text-gray-400" />
                    <span>{rev.date}</span>
                  </div>
                  <div className="review-verified-tag">
                    <IconCheck size={12} className="text-forest-600" />
                    <span>Pembayaran Tervalidasi</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="reviews-empty-state">
              <p>Belum ada ulasan untuk filter petugas ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
