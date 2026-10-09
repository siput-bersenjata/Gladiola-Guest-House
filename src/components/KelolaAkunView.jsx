import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconShield,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconSearch,
  IconPhone,
  IconLock,
  IconKey,
  IconArrowLeft
} from './Icons';

export const KelolaAkunView = () => {
  const {
    systemAccounts,
    handleSaveAccount,
    handleDeleteAccount,
    currentUser
  } = useApp();

  const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
  const isOwner = currentUser && currentUser.role === 'owner';
  const isOperator = currentUser && currentUser.role === 'operator';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // 'list' or 'form' (dedicated full-page view for editing/adding)
  const [viewMode, setViewMode] = useState('list');
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator',
    phone: '',
    email: '',
    status: 'Aktif'
  });

  const openAddForm = () => {
    setEditingAccount(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'operator', // If operator, always default and lock to operator
      phone: '',
      email: '',
      status: 'Aktif'
    });
    setShowPassword(false);
    setViewMode('form');
  };

  const openEditForm = (acc) => {
    // If current user is operator, verify they are only editing operator accounts
    if (isOperator && acc.role !== 'operator' && acc.username !== currentUser.username) {
      return;
    }

    setEditingAccount(acc);
    setFormData({
      username: acc.username,
      password: acc.password || '',
      name: acc.name,
      role: isOperator ? 'operator' : acc.role,
      phone: acc.phone || '',
      email: acc.email || '',
      status: acc.status || 'Aktif'
    });
    setShowPassword(false);
    setViewMode('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRole = isOperator ? 'operator' : formData.role;
    handleSaveAccount({
      ...(editingAccount ? { id: editingAccount.id } : {}),
      ...formData,
      role: finalRole
    });
    setViewMode('list');
  };

  const filteredAccounts = systemAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.email && acc.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.phone && acc.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const countSuper = systemAccounts.filter((a) => a.role === 'super_admin').length;
  const countOp = systemAccounts.filter((a) => a.role === 'operator').length;
  const countOwner = systemAccounts.filter((a) => a.role === 'owner').length;

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
            <span>Kembali ke Daftar Akun</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">
              {editingAccount ? `Ubah Akun Sistem: @${editingAccount.username}` : 'Tambah Akun Manajemen Baru'}
            </h2>
            <p className="form-page-subheading">
              {editingAccount
                ? `Perbarui kata sandi, nama lengkap, hak akses (role), dan kontak akun ${editingAccount.name}`
                : 'Daftarkan kredensial baru untuk Super Admin, Pengelola Kos, atau Pemilik (Owner)'}
            </p>
          </div>
        </div>

        {/* Dedicated Full Form Card */}
        <div className="form-page-card">
          <form onSubmit={handleSubmit} className="form-page-content">
            <div className="form-section-block">
              <div className="form-section-header">
                <IconKey size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Kredensial Login & Hak Akses</h3>
                  <p className="form-section-subtitle">
                    Username unik, kata sandi terenkripsi, dan tingkat kewenangan sistem
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Username Akun *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: admin_taman"
                    required
                    autoFocus
                  />
                  <span className="field-hint">Digunakan saat masuk ke sistem pada form login manajemen</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi (Password) *</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Masukkan kata sandi akun"
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <span className="field-hint">Pastikan kata sandi aman dan terjaga kerahasiaannya</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Hak Akses (Role Sistem) *</label>
                  {isOperator ? (
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        value="Pengelola / Operator Kos"
                        disabled
                        style={{ background: '#f8fafc', color: '#163928', fontWeight: 600 }}
                      />
                      <span className="field-hint">
                        Sebagai Pengelola, Anda berwenang membuat dan memperbarui akun sesama Pengelola / Operator Kos.
                      </span>
                    </div>
                  ) : (
                    <>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      >
                        <option value="operator">Pengelola / Operator (Kasir Pembayaran, Meteran Listrik & Data Kos)</option>
                        <option value="super_admin">Super Admin (Akses Penuh Seluruh Sistem & Monitoring Lokasi)</option>
                        <option value="owner">Pemilik / Owner (Laporan Okupansi & Keuangan Read-Only)</option>
                      </select>
                      <span className="field-hint">Kewenangan yang diberikan kepada pengguna ini</span>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Status Akun</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Akses Dinonaktifkan)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section-block">
              <div className="form-section-header">
                <IconShield size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Profil & Kontak Pengguna</h3>
                  <p className="form-section-subtitle">
                    Identitas nama lengkap dan kontak penanggung jawab
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap & Panggilan *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Siti Amalia (Admin)"
                    required
                  />
                  <span className="field-hint">Nama yang akan tampil pada header sistem dan audit log</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Handphone (WhatsApp) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    required
                  />
                  <span className="field-hint">Kontak aktif untuk koordinasi internal</span>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Alamat Email Resmi</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: staff@gladiolaguesthouse.id"
                  />
                  <span className="field-hint">Email operasional untuk notifikasi sistem (opsional)</span>
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
                <span>{editingAccount ? 'Simpan Perubahan Akun' : 'Buat Akun Sistem'}</span>
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
    <div className="kelola-akun-page">
      {/* Role Notice for Operator */}
      {isOperator && (
        <div className="owner-readonly-banner" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', marginBottom: '20px' }}>
          <IconShield size={20} className="text-emerald-700" />
          <div>
            <strong className="block text-emerald-900">Hak Akses Kelola Akun: Pengelola Kos</strong>
            <span className="text-sm text-emerald-800">
              Anda berwenang menambah akun pengelola baru dan mengubah data akun pengelola. Fitur penghapusan akun dinonaktifkan untuk Pengelola dan dikhususkan untuk Pemilik (Owner) serta Super Admin.
            </span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="section-toolbar mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IconKey size={26} className="text-primary-green" />
            <span>{isOperator ? 'Kelola Akun Pengelola Kos' : 'Kelola Akun Manajemen & Sistem'}</span>
          </h2>
          <p className="card-subheadline">
            {isOperator
              ? 'Tambah akun pengelola baru atau ubah data akun pengelola operasional Gladiola'
              : 'Kontrol akses akun Super Admin, Pengelola / Operator Kos, dan Pemilik (Owner) Gladiola'}
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openAddForm}
        >
          <IconPlus size={16} />
          <span>{isOperator ? 'Tambah Akun Pengelola' : 'Tambah Akun Baru'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="stats-row mb-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Akun Sistem</span>
            <div className="stat-icon-wrap">
              <IconShield size={20} />
            </div>
          </div>
          <div className="stat-value">{systemAccounts.length}</div>
          <div className="stat-hint">Akun manajemen terdaftar</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Super Admin</span>
            <span className="badge-role-pill role-super">Penuh</span>
          </div>
          <div className="stat-value">{countSuper}</div>
          <div className="stat-hint">Akses monitoring & kontrol total</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pengelola / Operator</span>
            <span className="badge-role-pill role-operator">Operasional</span>
          </div>
          <div className="stat-value">{countOp}</div>
          <div className="stat-hint">Kasir, meteran & data kos</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pemilik (Owner)</span>
            <span className="badge-role-pill role-owner">Laporan</span>
          </div>
          <div className="stat-value">{countOwner}</div>
          <div className="stat-hint">Akses keuangan & okupansi</div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="section-toolbar mb-4">
        <div className="toolbar-search-group">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari username, nama, no HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Semua Hak Akses (Role)</option>
            <option value="super_admin">Super Admin</option>
            <option value="operator">Pengelola / Operator</option>
            <option value="owner">Pemilik (Owner)</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Menampilkan <strong>{filteredAccounts.length}</strong> akun
        </div>
      </div>

      {/* Accounts Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username & Akun</th>
                <th>Nama Lengkap</th>
                <th>Hak Akses (Role)</th>
                <th>Kontak HP & Email</th>
                <th>Status</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => {
                const isCurrent = currentUser && currentUser.username === acc.username;
                return (
                  <tr key={acc.id || acc.username} className={isCurrent ? 'bg-green-50/40' : ''}>
                    <td>
                      <div>
                        <strong className="text-gray-900 block font-mono text-sm">
                          @{acc.username}
                        </strong>
                        {isCurrent && (
                          <span className="text-xs text-primary-green font-semibold">
                            ● Sedang Digunakan (Anda)
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="font-semibold text-gray-900">{acc.name}</span>
                    </td>

                    <td>
                      <span
                        className={`badge-role-pill ${
                          acc.role === 'super_admin'
                            ? 'role-super'
                            : acc.role === 'operator'
                            ? 'role-operator'
                            : 'role-owner'
                        }`}
                      >
                        {acc.role === 'super_admin'
                          ? 'Super Admin'
                          : acc.role === 'operator'
                          ? 'Pengelola / Operator'
                          : 'Pemilik (Owner)'}
                      </span>
                    </td>

                    <td>
                      <div className="text-sm">
                        <div className="text-gray-800 flex items-center gap-1">
                          <IconPhone size={12} className="text-gray-400" />
                          <span>{acc.phone || '-'}</span>
                        </div>
                        {acc.email && (
                          <span className="text-xs text-gray-500 block">{acc.email}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`badge-status ${acc.status === 'Aktif' ? 'badge-success' : 'badge-warning'}`}>
                        ✓ {acc.status || 'Aktif'}
                      </span>
                    </td>

                    <td className="text-sm text-gray-500 font-mono">
                      {acc.createdAt || '2024-01-01'}
                    </td>

                    <td>
                      <div className="action-buttons-row">
                        {/* Edit Button: Operator can edit their own or other operator accounts */}
                        {(!isOperator || acc.role === 'operator' || isCurrent) ? (
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => openEditForm(acc)}
                            title="Ubah Data Akun (Pindah Halaman)"
                          >
                            <IconEdit size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-icon-action"
                            disabled
                            style={{ opacity: 0.3, cursor: 'not-allowed' }}
                            title="Hanya Super Admin atau Owner yang dapat mengedit akun ini"
                          >
                            <IconEdit size={16} />
                          </button>
                        )}

                        {/* Delete Button: Strictly hidden for Operator! Available for Super Admin & Owner */}
                        {!isOperator && (
                          <button
                            type="button"
                            className={`btn-icon-action danger ${
                              (isCurrent || (isOwner && acc.role !== 'operator')) ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                            disabled={isCurrent || (isOwner && acc.role !== 'operator')}
                            onClick={() => {
                              if (isCurrent) return;
                              if (isOwner && acc.role !== 'operator') return;
                              if (window.confirm(`Hapus akun @${acc.username} (${acc.name})?`)) {
                                handleDeleteAccount(acc.id);
                              }
                            }}
                            title={
                              isCurrent
                                ? 'Tidak dapat menghapus akun yang sedang digunakan'
                                : isOwner && acc.role !== 'operator'
                                ? 'Owner hanya berwenang menghapus akun Pengelola'
                                : 'Hapus Akun'
                            }
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
