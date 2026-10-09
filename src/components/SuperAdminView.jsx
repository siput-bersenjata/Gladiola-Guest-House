import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconShield,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconExternalLink,
  IconCheck,
  IconSearch,
  IconClock,
  IconArrowLeft,
  IconUsers
} from './Icons';

export const SuperAdminView = () => {
  const {
    operators,
    activityLogs,
    handleSaveOperator,
    handleDeleteOperator,
    currentUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('logs'); // 'logs' | 'operators'
  const [operatorViewMode, setOperatorViewMode] = useState('list'); // 'list' | 'form'
  const [editingOp, setEditingOp] = useState(null);
  const [logSearch, setLogSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [opFormData, setOpFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    status: 'Aktif'
  });

  const openAddOpForm = () => {
    setEditingOp(null);
    setOpFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      status: 'Aktif'
    });
    setOperatorViewMode('form');
  };

  const openEditOpForm = (op) => {
    setEditingOp(op);
    setOpFormData({
      username: op.username,
      fullName: op.fullName,
      email: op.email,
      phone: op.phone,
      status: op.status
    });
    setOperatorViewMode('form');
  };

  const handleOpSubmit = (e) => {
    e.preventDefault();
    handleSaveOperator({
      ...(editingOp ? { id: editingOp.id } : {}),
      ...opFormData
    });
    setOperatorViewMode('list');
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.locationName && log.locationName.toLowerCase().includes(logSearch.toLowerCase()));
    const matchRole = roleFilter === 'all' || log.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Dedicated Full Page Form for Operator Add/Edit
  if (operatorViewMode === 'form') {
    return (
      <div className="form-page-container">
        <div className="form-page-topbar">
          <button
            type="button"
            className="btn-back-nav"
            onClick={() => setOperatorViewMode('list')}
          >
            <IconArrowLeft size={18} />
            <span>Kembali ke Daftar Pengelola</span>
          </button>

          <div className="form-page-title-group">
            <h2 className="form-page-heading">
              {editingOp ? `Ubah Akun Pengelola: @${editingOp.username}` : 'Tambah Akun Pengelola Baru'}
            </h2>
            <p className="form-page-subheading">
              Pengelola memiliki hak akses menambah data anak kos, input meteran listrik bulanan, dan memvalidasi pembayaran.
            </p>
          </div>
        </div>

        <div className="form-page-card">
          <form onSubmit={handleOpSubmit} className="form-page-content">
            <div className="form-section-block">
              <div className="form-section-header">
                <IconUsers size={20} className="text-primary-green" />
                <div>
                  <h3 className="form-section-title">Data Akun Pengelola Kos</h3>
                  <p className="form-section-subtitle">
                    Kredensial login dan profil penanggung jawab operasional harian
                  </p>
                </div>
              </div>

              <div className="form-responsive-grid">
                <div className="form-group">
                  <label className="form-label">Username Pengelola *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={opFormData.username}
                    onChange={(e) => setOpFormData({ ...opFormData, username: e.target.value })}
                    placeholder="Contoh: admin_taman2"
                    required
                    autoFocus
                  />
                  <span className="field-hint">Digunakan untuk login ke sistem</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Lengkap & Jabatan *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={opFormData.fullName}
                    onChange={(e) => setOpFormData({ ...opFormData, fullName: e.target.value })}
                    placeholder="Contoh: Budi Santoso (Admin Kasir)"
                    required
                  />
                  <span className="field-hint">Nama staf yang bertugas</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={opFormData.email}
                    onChange={(e) => setOpFormData({ ...opFormData, email: e.target.value })}
                    placeholder="Contoh: budi@gladiolaguesthouse.id"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Handphone (WhatsApp) *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={opFormData.phone}
                    onChange={(e) => setOpFormData({ ...opFormData, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-page-actions-bar">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setOperatorViewMode('list')}
              >
                Batal & Kembali
              </button>
              <button type="submit" className="btn-primary-action">
                <IconCheck size={18} />
                <span>Simpan Akun Pengelola</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-container">
      {/* Tab Switcher */}
      <div className="superadmin-tabs-row">
        <button
          type="button"
          className={`superadmin-tab-btn ${activeSubTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('logs')}
        >
          <IconClock size={18} />
          <span>Log Aktivitas & Pelacakan Lokasi ({activityLogs.length})</span>
        </button>

        <button
          type="button"
          className={`superadmin-tab-btn ${activeSubTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('operators')}
        >
          <IconShield size={18} />
          <span>Kelola Akun Pengelola / Operator ({operators.length})</span>
        </button>
      </div>

      {/* Subtab 1: Activity Logs */}
      {activeSubTab === 'logs' && (
        <div className="logs-section">
          {/* Toolbar */}
          <div className="section-toolbar">
            <div className="toolbar-search-group">
              <div className="search-box-pill">
                <IconSearch size={16} />
                <input
                  type="text"
                  placeholder="Cari nama user, aksi, lokasi..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Semua Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="operator">Operator / Pengelola</option>
                <option value="owner">Owner</option>
                <option value="anak_kos">Anak Kos</option>
              </select>
            </div>

            <div className="logs-summary-chip">
              <span className="live-pulse-dot"></span>
              <span>Pemantauan Geolocation Real-time Aktif</span>
            </div>
          </div>

          {/* Logs Table */}
          <div className="dashboard-card no-padding">
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waktu (Timestamp)</th>
                    <th>Nama User & Role</th>
                    <th>Aksi yang Dilakukan</th>
                    <th>Rincian Aktivitas</th>
                    <th>Lokasi & Koordinat GPS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="text-sm font-mono text-gray-600 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td>
                          <div>
                            <strong className="text-gray-900 block">{log.user}</strong>
                            <span
                              className={`badge-role-pill ${
                                log.role === 'super_admin'
                                  ? 'role-super'
                                  : log.role === 'operator'
                                  ? 'role-operator'
                                  : log.role === 'owner'
                                  ? 'role-owner'
                                  : 'role-tenant'
                              }`}
                            >
                              {log.role}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-gray-800">{log.action}</span>
                        </td>
                        <td className="text-sm text-gray-600">{log.details}</td>
                        <td>
                          <div className="log-location-box">
                            <div className="location-name-row">
                              <IconMapPin size={14} className="text-primary-green" />
                              <span className="font-medium text-gray-800">{log.locationName}</span>
                            </div>
                            {log.coords && (
                              <div className="coords-row">
                                <code className="coords-code">
                                  {log.coords.lat.toFixed(5)}, {log.coords.lng.toFixed(5)}
                                </code>
                                <a
                                  href={`https://www.google.com/maps?q=${log.coords.lat},${log.coords.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view-map-link"
                                  title="Buka titik koordinat di Google Maps"
                                >
                                  <IconExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">
                        Tidak ada log aktivitas yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Operators CRUD */}
      {activeSubTab === 'operators' && (
        <div className="operators-section">
          <div className="section-toolbar">
            <div>
              <h3 className="card-headline">Daftar Akun Pengelola (Operator)</h3>
              <p className="card-subheadline">
                Kelola hak akses pengelola kos yang bertugas input meteran, data anak kos, dan validasi kasir
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={openAddOpForm}
            >
              <IconPlus size={16} />
              <span>Tambah Akun Pengelola</span>
            </button>
          </div>

          <div className="dashboard-card no-padding">
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username & Nama Lengkap</th>
                    <th>Email</th>
                    <th>Nomor Handphone</th>
                    <th>Status</th>
                    <th>Tanggal Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op) => (
                    <tr key={op.id}>
                      <td>
                        <div>
                          <strong className="text-gray-900 block">{op.fullName}</strong>
                          <span className="text-xs text-gray-500 font-mono">@{op.username}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-700">{op.email}</td>
                      <td className="text-sm text-gray-700">{op.phone}</td>
                      <td>
                        <span className="badge-status badge-success">✓ {op.status}</span>
                      </td>
                      <td className="text-sm text-gray-500">{op.createdAt}</td>
                      <td>
                        <div className="action-buttons-row">
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => openEditOpForm(op)}
                            title="Ubah Akun (Pindah Halaman)"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action danger"
                            onClick={() => {
                              if (window.confirm(`Hapus akun pengelola ${op.fullName}?`)) {
                                handleDeleteOperator(op.id);
                              }
                            }}
                            title="Hapus Akun"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
