import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IconRoom,
  IconCheck,
  IconClock,
  IconUsers,
  IconSearch
} from './Icons';

export const KamarView = () => {
  const { rooms } = useApp();

  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomModal, setSelectedRoomModal] = useState(null);

  const filteredRooms = rooms.filter((r) => {
    const matchFloor = filterFloor === 'all' || r.floor === parseInt(filterFloor);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch =
      r.number.includes(searchTerm) ||
      (r.currentTenant && r.currentTenant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFloor && matchStatus && matchSearch;
  });

  const occupiedCount = rooms.filter((r) => r.status === 'Terisi').length;
  const bookingCount = rooms.filter((r) => r.status === 'Booking').length;
  const vacantCount = rooms.filter((r) => r.status === 'Kosong').length;

  return (
    <div className="kamar-container">
      {/* Floor & Status Statistics */}
      <div className="kamar-stat-pills-row">
        <div className="kamar-stat-pill">
          <span>Total Kamar:</span>
          <strong>50 Unit</strong>
        </div>
        <div className="kamar-stat-pill green">
          <span className="dot green"></span>
          <span>Terisi: {occupiedCount} Unit (90%)</span>
        </div>
        <div className="kamar-stat-pill blue">
          <span className="dot blue"></span>
          <span>Booking: {bookingCount} Unit</span>
        </div>
        <div className="kamar-stat-pill sand">
          <span className="dot sand"></span>
          <span>Kosong: {vacantCount} Unit</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="section-toolbar">
        <div className="toolbar-search-group">
          <div className="search-box-pill">
            <IconSearch size={16} />
            <input
              type="text"
              placeholder="Cari no kamar / nama penghuni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Terisi">Terisi</option>
            <option value="Booking">Booking</option>
            <option value="Kosong">Kosong (Tersedia)</option>
          </select>

          <select
            className="filter-select"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="all">Semua Lantai</option>
            <option value="1">Lantai 1</option>
            <option value="2">Lantai 2</option>
            <option value="3">Lantai 3</option>
          </select>
        </div>
      </div>

      {/* Grid of 50 Rooms */}
      <div className="room-cards-grid">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={`room-grid-card ${room.status.toLowerCase()}`}
            onClick={() => setSelectedRoomModal(room)}
          >
            <div className="room-card-top-row">
              <span className="room-num-title">Kamar {room.number}</span>
              <span
                className={`badge-status ${
                  room.status === 'Terisi'
                    ? 'badge-success'
                    : room.status === 'Booking'
                    ? 'badge-info'
                    : 'badge-vacant'
                }`}
              >
                {room.status}
              </span>
            </div>

            <p className="room-card-type">{room.type}</p>

            <div className="room-card-occupant-row">
              <IconUsers size={14} className="text-gray-400" />
              <span className="room-tenant-name">
                {room.currentTenant || 'Tersedia untuk disewa'}
              </span>
            </div>

            <div className="room-card-bottom-row">
              <span className="room-floor-tag">Lt. {room.floor}</span>
              <span className="room-price-tag">
                Rp {(room.price / 1000000).toFixed(1)}jt/bln
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Room Detail Modal */}
      {selectedRoomModal && (
        <div className="modal-overlay" onClick={() => setSelectedRoomModal(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Rincian Kamar {selectedRoomModal.number}</h3>
            <p className="modal-subtitle">
              Gladiola Guest House • Lantai {selectedRoomModal.floor}
            </p>

            <div className="room-detail-info-box">
              <div className="calc-row">
                <span>Tipe Kamar:</span>
                <strong>{selectedRoomModal.type}</strong>
              </div>
              <div className="calc-row">
                <span>Status Saat Ini:</span>
                <strong className="text-primary-green">{selectedRoomModal.status}</strong>
              </div>
              <div className="calc-row">
                <span>Penghuni:</span>
                <strong>{selectedRoomModal.currentTenant || 'Tidak Ada (Kosong)'}</strong>
              </div>
              <div className="calc-row">
                <span>Tarif Sewa:</span>
                <strong>Rp {selectedRoomModal.price.toLocaleString('id-ID')} / bulan</strong>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mt-4 mb-2">Fasilitas Kamar:</h4>
            <div className="facilities-tag-grid">
              {selectedRoomModal.facilities.map((fac, idx) => (
                <span key={idx} className="facility-pill">
                  ✓ {fac}
                </span>
              ))}
            </div>

            <div className="modal-actions-row mt-6">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSelectedRoomModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
