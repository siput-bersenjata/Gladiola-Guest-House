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
  IconClock
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
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
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

  const openAddOpModal = () => {
    setEditingOp(null);
    setOpFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      status: 'Aktif'
    });
    setIsOpModalOpen(true);
  };

  const openEditOpModal = (op) => {
    setEditingOp(op);
    setOpFormData({
      username: op.username,
      fullName: op.fullName,
      email: op.email,
      phone: op.phone,
      status: op.status
    });
    setIsOpModalOpen(true);
  };

  const handleOpSubmit = (e) => {
    e.preventDefault();
    handleSaveOperator({
      ...(editingOp ? { id: editingOp.id } : {}),
      ...opFormData
    });
    setIsOpModalOpen(false);
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.locationName && log.locationName.toLowerCase().includes(logSearch.toLowerCase()));
    const matchRole = roleFilter === 'all' || log.role === roleFilter;
    return matchSearch && matchRole;
  });

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
              onClick={openAddOpModal}
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
                            onClick={() => openEditOpModal(op)}
                            title="Ubah Akun"
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

      {/* Modal Add / Edit Operator */}
      {isOpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <h3 className="modal-title">
              {editingOp ? 'Ubah Akun Pengelola' : 'Tambah Akun Pengelola Baru'}
            </h3>
            <p className="modal-subtitle">
              Akun ini dapat menambah anak kos, input meteran listrik, dan memvalidasi pembayaran.
            </p>

            <form onSubmit={handleOpSubmit} className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Username Pengelola *</label>
                <input
                  type="text"
                  className="form-input"
                  value={opFormData.username}
                  onChange={(e) => setOpFormData({ ...opFormData, username: e.target.value })}
                  placeholder="Contoh: admin_taman2"
                  required
                />
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

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsOpModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <IconCheck size={16} />
                  <span>Simpan Akun Pengelola</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
