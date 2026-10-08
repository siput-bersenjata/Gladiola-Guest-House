import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconWifi,
  IconLock,
  IconCopy,
  IconCheck,
  IconWhatsApp,
  IconStar,
  IconPayment,
  IconLightning,
  IconClock,
  IconRoom,
  IconPhone
} from './Icons';

export const AnakKosPortal = () => {
  const {
    currentUser,
    tenants,
    payments,
    electricityBills,
    staffList,
    staffRatings,
    wifiInfo,
    bankInfo,
    handleAddStaffRating,
    loginByPhone,
    addToast
  } = useApp();

  // Login phone state for non-logged in state
  const [phoneInput, setPhoneInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Rating state
  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [copiedWifiPass, setCopiedWifiPass] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // If current role is not anak_kos, show phone login form
  if (currentUser.role !== 'anak_kos') {
    const handlePhoneLoginSubmit = (e) => {
      e.preventDefault();
      if (!phoneInput) {
        setLoginError('Silakan masukkan nomor HP Anda');
        return;
      }
      const res = loginByPhone(phoneInput);
      if (!res.success) {
        setLoginError(res.message);
      } else {
        setLoginError('');
      }
    };

    return (
      <div className="tenant-login-page">
        <div className="tenant-login-card">
          <div className="tenant-login-badge">
            <IconLock size={20} className="text-primary-green" />
            <span>Portal Khusus Penghuni Kos</span>
          </div>

          <h2 className="tenant-login-title">Masuk Portal Anak Kos</h2>
          <p className="tenant-login-desc">
            Masukkan nomor handphone aktif Anda yang telah didaftarkan pada pengelola Gladiola Guest House.
          </p>

          <form onSubmit={handlePhoneLoginSubmit} className="tenant-login-form">
            <div className="form-group">
              <label htmlFor="tenant-phone-input" className="form-label">
                Nomor Handphone (WhatsApp)
              </label>
              <div className="input-with-prefix">
                <span className="phone-prefix">+62 / 08</span>
                <input
                  id="tenant-phone-input"
                  type="tel"
                  placeholder="Contoh: 081233445566"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    setLoginError('');
                  }}
                  className="form-input-phone"
                  autoFocus
                />
              </div>
              {loginError && <p className="form-error-msg">{loginError}</p>}
            </div>

            <button type="submit" className="btn-primary-block">
              Masuk ke Portal Saya
            </button>
          </form>

          {/* Quick Demo Pickers */}
          <div className="demo-accounts-box">
            <p className="demo-accounts-title">Atau pilih akun penghuni contoh:</p>
            <div className="demo-chips-grid">
              {tenants.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => {
                    setPhoneInput(t.phone);
                    loginByPhone(t.phone);
                  }}
                >
                  {t.name} (Kmr {t.roomNumber})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Current tenant data
  const tenantData = tenants.find((t) => t.phone === currentUser.phone) || {
    name: currentUser.name,
    roomNumber: currentUser.roomNumber || '102',
    monthlyRent: 1750000,
    roomType: 'Deluxe Taman'
  };

  // Filter bills for this tenant
  const tenantRentBills = payments.filter(
    (p) => p.tenantPhone === currentUser.phone || p.roomNumber === tenantData.roomNumber
  );

  const tenantElecBills = electricityBills.filter(
    (b) => b.tenantPhone === currentUser.phone || b.roomNumber === tenantData.roomNumber
  );

  // This month bills (Oktober 2026)
  const currentRentBill = tenantRentBills.find((p) => p.month.includes('Oktober')) || {
    month: 'Oktober 2026',
    amount: tenantData.monthlyRent || 1750000,
    status: 'Tervalidasi'
  };

  const currentElecBill = tenantElecBills.find((b) => b.month.includes('Oktober')) || {
    month: 'Oktober 2026',
    kwhUsage: 80,
    ratePerKwh: 1650,
    totalBill: 132000,
    status: 'Lunas'
  };

  // Previous months bills (past records)
  const pastRentBills = tenantRentBills.filter((p) => !p.month.includes('Oktober'));
  const pastElecBills = tenantElecBills.filter((b) => !b.month.includes('Oktober'));

  // Copy Wi-Fi password
  const handleCopyWifi = () => {
    navigator.clipboard.writeText(wifiInfo.password);
    setCopiedWifiPass(true);
    addToast('Password Wi-Fi Gladiola disalin!', 'info');
    setTimeout(() => setCopiedWifiPass(false), 2500);
  };

  // Copy Bank Account
  const handleCopyBank = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopiedRekening(true);
    addToast('Nomor rekening disalin!', 'info');
    setTimeout(() => setCopiedRekening(false), 2500);
  };

  // Handle submit rating & review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment || reviewComment.trim().length < 5) {
      addToast('Wajib mengisi kalimat ulasan minimal 5 karakter!', 'error');
      return;
    }

    setIsSubmittingReview(true);
    if (selectedStaffId === 'all') {
      // Rate all staff members
      staffList.forEach((s) => {
        handleAddStaffRating(s.id, starRating, reviewComment);
      });
      addToast(`Ulasan dan rating berhasil dikirim untuk semua petugas!`, 'success');
    } else {
      handleAddStaffRating(selectedStaffId, starRating, reviewComment);
    }

    setReviewComment('');
    setIsSubmittingReview(false);
  };

  return (
    <div className="anak-kos-page">
      {/* Welcome Banner */}
      <div className="tenant-welcome-banner">
        <div className="banner-left">
          <div className="tenant-avatar-badge">
            <span className="room-badge-text">Kamar {tenantData.roomNumber}</span>
          </div>
          <div>
            <h2 className="tenant-welcome-name">Halo, {tenantData.name}! 👋</h2>
            <p className="tenant-welcome-sub">
              Tipe: {tenantData.roomType || 'Deluxe Taman'} • No. Handphone: {tenantData.phone}
            </p>
          </div>
        </div>
        <div className="banner-right">
          <div className="stay-status-pill">
            <span className="green-live-dot"></span>
            <span>Penghuni Aktif Gladiola</span>
          </div>
        </div>
      </div>

      {/* Grid: Wi-Fi Card & Current Month Bill */}
      <div className="tenant-top-grid">
        {/* Card: Wi-Fi Fasilitas Bulan Ini */}
        <div className="dashboard-card wifi-card">
          <div className="wifi-card-header">
            <div className="icon-badge-box bg-green-tint">
              <IconWifi size={24} className="text-primary-green" />
            </div>
            <div>
              <h3 className="card-headline">Wi-Fi Kos Gladiola</h3>
              <p className="card-subheadline">Fasilitas Internet Bulan Ini</p>
            </div>
          </div>

          <div className="wifi-details-box">
            <div className="wifi-field">
              <span className="wifi-field-label">Nama Jaringan (SSID):</span>
              <strong className="wifi-field-val">{wifiInfo.ssid}</strong>
            </div>

            <div className="wifi-field password-row">
              <div className="wifi-field-text">
                <span className="wifi-field-label">Password:</span>
                <code className="wifi-field-code">{wifiInfo.password}</code>
              </div>
              <button
                type="button"
                className="btn-copy-wifi"
                onClick={handleCopyWifi}
                title="Salin Password"
              >
                {copiedWifiPass ? <IconCheck size={16} /> : <IconCopy size={16} />}
                <span>{copiedWifiPass ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <div className="wifi-speed-badge">
              <span>🚀 Kecepatan: {wifiInfo.speed}</span>
            </div>
          </div>
          <p className="wifi-note-text">
            {wifiInfo.note || 'Koneksi khusus penghuni aktif Gladiola Guest House'}
          </p>
        </div>

        {/* Card: Tagihan Bulan Ini (Kos & Listrik) */}
        <div className="dashboard-card current-bill-card">
          <div className="chart-card-header">
            <div>
              <h3 className="card-headline">Tagihan Bulan Ini</h3>
              <p className="card-subheadline">Periode: {currentRentBill.month}</p>
            </div>
            <span
              className={`badge-status ${
                currentRentBill.status === 'Tervalidasi' ? 'badge-success' : 'badge-warning'
              }`}
            >
              {currentRentBill.status === 'Tervalidasi' ? '✓ Lunas & Tervalidasi' : currentRentBill.status}
            </span>
          </div>

          <div className="bill-breakdown-box">
            {/* Sewa Kamar */}
            <div className="bill-item-row">
              <div className="bill-item-left">
                <IconPayment size={18} className="text-primary-green" />
                <span>Sewa Kamar ({tenantData.roomType})</span>
              </div>
              <span className="bill-item-amount">
                Rp {currentRentBill.amount.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Listrik */}
            <div className="bill-item-row">
              <div className="bill-item-left">
                <IconLightning size={18} className="text-cyan-accent" />
                <span>Listrik ({currentElecBill.kwhUsage} kWh @ Rp 1.650)</span>
              </div>
              <span className="bill-item-amount">
                Rp {currentElecBill.totalBill.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bill-total-row">
              <span>Total Pembayaran Bulan Ini:</span>
              <strong className="bill-total-number">
                Rp {(currentRentBill.amount + currentElecBill.totalBill).toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Payment transfer destination info */}
          <div className="bank-transfer-info-box">
            <div className="bank-info-header">
              <span className="font-semibold text-gray-800">Rekening Resmi Pembayaran:</span>
              <button
                type="button"
                className="btn-copy-sm"
                onClick={handleCopyBank}
              >
                {copiedRekening ? <IconCheck size={14} /> : <IconCopy size={14} />}
                <span>{copiedRekening ? 'Tersalin' : 'Salin No Rek'}</span>
              </button>
            </div>
            <p className="bank-info-number">
              <strong>{bankInfo.bankName}</strong> • {bankInfo.accountNumber}
            </p>
            <p className="bank-info-holder">a/n {bankInfo.accountHolder}</p>
          </div>
        </div>
      </div>

      {/* Daftar Nama Petugas & Kontak WhatsApp */}
      <div className="dashboard-card staff-contact-section">
        <div className="chart-card-header">
          <div>
            <h3 className="card-headline">Daftar Petugas & Kontak Darurat Kos</h3>
            <p className="card-subheadline">
              Hubungi petugas jika membutuhkan bantuan fasilitas, kamar, atau keamanan
            </p>
          </div>
        </div>

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

              <a
                href={`https://wa.me/${staff.phone}?text=Halo%20${encodeURIComponent(
                  staff.name
                )},%20saya%20${encodeURIComponent(tenantData.name)}%20dari%20Kamar%20${
                  tenantData.roomNumber
                }%20Gladiola%20Guest%20House.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-staff"
              >
                <IconWhatsApp size={16} />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Staff Rating & Review Form (Setiap Selesai Pembayaran Tervalidasi) */}
      <div className="dashboard-card rating-form-card">
        <div className="rating-form-header">
          <div className="icon-badge-box bg-warm-tint">
            <IconStar size={24} filled={true} className="text-forest-gold" />
          </div>
          <div>
            <h3 className="card-headline">Rating & Ulasan Petugas Gladiola</h3>
            <p className="card-subheadline">
              Pembayaran Anda telah tervalidasi. Silakan berikan rating dan <strong>wajib mengisi kalimat ulasan</strong> untuk petugas kami.
            </p>
          </div>
        </div>

        <form onSubmit={handleReviewSubmit} className="rating-form-content">
          <div className="rating-form-grid">
            {/* Select Petugas: 1 atau Semua */}
            <div className="form-group">
              <label className="form-label font-medium">Pilih Petugas yang Dinilai:</label>
              <select
                className="form-select"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="all">⭐ Berikan Nilai untuk SEMUA Petugas Sekaligus</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Bintang Rating */}
            <div className="form-group">
              <label className="form-label font-medium">Bintang Penilaian:</label>
              <div className="star-picker-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-select-btn ${star <= starRating ? 'active' : ''}`}
                    onClick={() => setStarRating(star)}
                    title={`${star} Bintang`}
                  >
                    <IconStar size={28} filled={star <= starRating} />
                  </button>
                ))}
                <span className="star-rating-label">
                  {starRating === 5
                    ? 'Sangat Puas (5/5)'
                    : starRating === 4
                    ? 'Puas (4/5)'
                    : starRating === 3
                    ? 'Cukup (3/5)'
                    : 'Perlu Ditingkatkan'}
                </span>
              </div>
            </div>
          </div>

          {/* Kalimat Review - WAJIB DIISI */}
          <div className="form-group">
            <label className="form-label font-medium">
              Kalimat Ulasan / Review <span className="text-red-500">* (Wajib Diisi)</span>:
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Tuliskan pengalaman pelayanan petugas bulan ini (misal: Pak Bambang sigap menjaga keamanan gerbang, Bu Sri menjaga kebersihan selasar sangat rapi...)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            ></textarea>
            <span className="form-helper-text">
              * Kalimat ulasan Anda akan dipublikasikan ke papan evaluasi kualitas staf Gladiola.
            </span>
          </div>

          <div className="rating-submit-row">
            <button
              type="submit"
              className="btn-primary-rating"
              disabled={isSubmittingReview}
            >
              <IconCheck size={18} />
              <span>Kirim Rating & Ulasan</span>
            </button>
          </div>
        </form>

        {/* Existing Reviews List for this room */}
        <div className="tenant-reviews-history">
          <h4 className="reviews-history-title">Ulasan yang Telah Anda Kirim:</h4>
          <div className="reviews-history-list">
            {staffRatings
              .filter((r) => r.tenantPhone === currentUser.phone || r.tenantName === currentUser.name)
              .map((rev) => (
                <div key={rev.id} className="review-history-item">
                  <div className="review-item-header">
                    <span className="font-semibold text-gray-800">{rev.staffName}</span>
                    <div className="review-stars-badge">
                      <IconStar size={14} filled={true} className="text-forest-gold" />
                      <span>{rev.rating} / 5</span>
                    </div>
                  </div>
                  <p className="review-item-text">"{rev.comment}"</p>
                  <span className="review-item-date">{rev.date} • Periode: {rev.verifiedPaymentMonth}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Riwayat Tagihan Bulan-Bulan Kemarin */}
      <div className="dashboard-card past-bills-card">
        <div className="chart-card-header">
          <div>
            <h3 className="card-headline">Riwayat Tagihan Beberapa Bulan Kemarin</h3>
            <p className="card-subheadline">
              Arsip data tagihan kos dan listrik yang sudah kedata sebelumnya
            </p>
          </div>
        </div>

        {/* Responsive Table for Past Bills */}
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan & Periode</th>
                <th>Tagihan Kos</th>
                <th>Listrik (kWh)</th>
                <th>Biaya Listrik</th>
                <th>Total Bayar</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
              </tr>
            </thead>
            <tbody>
              {pastRentBills.length > 0 ? (
                pastRentBills.map((p) => {
                  const matchingElec = pastElecBills.find((b) => b.month === p.month) || {
                    kwhUsage: 75,
                    totalBill: 123750
                  };
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold text-gray-900">{p.month}</td>
                      <td>Rp {p.amount.toLocaleString('id-ID')}</td>
                      <td>{matchingElec.kwhUsage} kWh</td>
                      <td>Rp {matchingElec.totalBill.toLocaleString('id-ID')}</td>
                      <td className="font-bold text-primary-green">
                        Rp {(p.amount + matchingElec.totalBill).toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span className="badge-status badge-success">✓ {p.status}</span>
                      </td>
                      <td className="text-sm text-gray-500">{p.paidAt || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Belum ada riwayat tagihan bulan sebelumnya yang diarsipkan.
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
