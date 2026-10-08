import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconPayment,
  IconCheck,
  IconClock,
  IconSearch,
  IconCopy,
  IconExternalLink,
  IconShield
} from './Icons';

export const PembayaranView = () => {
  const {
    payments,
    handleValidatePayment,
    currentUser,
    bankInfo,
    addToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [previewProof, setPreviewProof] = useState(null);

  const canValidate = currentUser.role === 'operator' || currentUser.role === 'super_admin' || currentUser.role === 'owner';

  const filteredPayments = payments.filter((p) => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchMonth = filterMonth === 'all' || p.month.includes(filterMonth);
    return matchStatus && matchMonth;
  });

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
        <div className="bank-summary-right">
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

      {/* Filter Toolbar */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
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

          <select
            className="filter-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            <option value="Oktober">Oktober 2026</option>
            <option value="September">September 2026</option>
            <option value="Agustus">Agustus 2026</option>
            <option value="Juli">Juli 2026</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan & ID</th>
                <th>Penghuni & Kamar</th>
                <th>Nominal Sewa</th>
                <th>Metode Bayar</th>
                <th>Waktu Bayar</th>
                <th>Bukti Transfer</th>
                <th>Status</th>
                <th>Validasi Oleh</th>
                {canValidate && <th>Tindakan Operator</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
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
                    <td className="text-sm text-gray-600">{pay.paidAt || '-'}</td>
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
                          <div className="text-gray-400">{pay.validatedAt}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    {canValidate && (
                      <td>
                        <div className="action-buttons-row">
                          {pay.status !== 'Tervalidasi' && (
                            <button
                              type="button"
                              className="btn-validate-approve"
                              onClick={() => handleValidatePayment(pay.id, 'Tervalidasi')}
                              title="Setujui Pembayaran"
                            >
                              <IconCheck size={14} />
                              <span>Validasi</span>
                            </button>
                          )}
                          {pay.status === 'Menunggu Validasi' && (
                            <button
                              type="button"
                              className="btn-validate-reject"
                              onClick={() => handleValidatePayment(pay.id, 'Belum Bayar')}
                              title="Tolak Bukti"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canValidate ? 9 : 8} className="text-center py-6 text-gray-500">
                    Tidak ada transaksi pembayaran pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
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
