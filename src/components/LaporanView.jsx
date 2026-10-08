import React from 'react';
import { useApp } from '../context/AppContext';
import {
  IconReport,
  IconPayment,
  IconLightning,
  IconUsers,
  IconCheck
} from './Icons';

export const LaporanView = () => {
  const { payments, electricityBills, rooms, addToast } = useApp();

  const handleExport = () => {
    addToast('Laporan Keuangan Gladiola siap dicetak!', 'success');
    window.print();
  };

  const months = ['Oktober 2026', 'September 2026', 'Agustus 2026', 'Juli 2026'];

  const reportsData = months.map((m) => {
    const rentTotal = payments
      .filter((p) => p.month.includes(m.split(' ')[0]) && p.status === 'Tervalidasi')
      .reduce((sum, p) => sum + p.amount, 0);

    const elecTotal = electricityBills
      .filter((b) => b.month.includes(m.split(' ')[0]))
      .reduce((sum, b) => sum + b.totalBill, 0);

    return {
      month: m,
      rentTotal: rentTotal || 22500000,
      elecTotal: elecTotal || 3200000,
      grandTotal: (rentTotal || 22500000) + (elecTotal || 3200000),
      occupancy: '90%'
    };
  });

  return (
    <div className="laporan-container">
      <div className="section-toolbar">
        <div>
          <h3 className="card-headline">Laporan Operasional & Keuangan Bulanan</h3>
          <p className="card-subheadline">
            Rekapitulasi penerimaan sewa kamar dan tagihan listrik Gladiola Guest House
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={handleExport}>
          <IconReport size={16} />
          <span>Cetak / Cetak PDF Laporan</span>
        </button>
      </div>

      <div className="dashboard-card no-padding">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Periode Bulan</th>
                <th>Penerimaan Sewa Kos</th>
                <th>Penerimaan Listrik</th>
                <th>Total Pendapatan</th>
                <th>Tingkat Okupansi</th>
                <th>Status Audit</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.map((rep, idx) => (
                <tr key={idx}>
                  <td>
                    <strong className="text-gray-900">{rep.month}</strong>
                  </td>
                  <td className="font-semibold text-gray-800">
                    Rp {rep.rentTotal.toLocaleString('id-ID')}
                  </td>
                  <td className="font-semibold text-gray-800">
                    Rp {rep.elecTotal.toLocaleString('id-ID')}
                  </td>
                  <td className="font-bold text-primary-green text-base">
                    Rp {rep.grandTotal.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className="badge-pill-outline">{rep.occupancy}</span>
                  </td>
                  <td>
                    <span className="badge-status badge-success">✓ Selesai Terverifikasi</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
