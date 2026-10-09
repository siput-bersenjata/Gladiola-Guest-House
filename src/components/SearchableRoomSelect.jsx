import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconX, IconCheck, IconRoom } from './Icons';

export const SearchableRoomSelect = ({
  rooms = [],
  value,
  onChange,
  placeholder = "Pilih Kamar...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected room
  const selectedRoom = rooms.find((r) => String(r.number) === String(value));

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filtered rooms based on searchTerm (by room number, tenant name, or room type)
  const filteredRooms = rooms.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchNumber = String(r.number).toLowerCase().includes(term);
    const matchTenant = r.currentTenant && r.currentTenant.toLowerCase().includes(term);
    const matchType = r.type && r.type.toLowerCase().includes(term);
    const matchStatus = r.status && r.status.toLowerCase().includes(term);
    return matchNumber || matchTenant || matchType || matchStatus;
  });

  const handleSelect = (roomNum) => {
    onChange(roomNum);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`searchable-select-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
      >
        <div className="trigger-left-content">
          <IconRoom size={18} className="trigger-room-icon" />
          {selectedRoom ? (
            <span className="trigger-selected-text">
              <strong>Kamar {selectedRoom.number}</strong>
              <span className="trigger-tenant-sub">
                ({selectedRoom.currentTenant || 'Kosong / Tersedia'})
              </span>
            </span>
          ) : (
            <span className="trigger-placeholder">{placeholder}</span>
          )}
        </div>

        <div className="trigger-right-content">
          <span className="trigger-arrow-icon">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Dropdown Menu with Instant Search Box */}
      {isOpen && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-header">
            <div className="dropdown-search-box">
              <IconSearch size={16} className="search-icon-left" />
              <input
                ref={searchInputRef}
                type="text"
                className="dropdown-search-input"
                placeholder="Cari nomor kamar atau nama penghuni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  title="Hapus pencarian"
                >
                  <IconX size={14} />
                </button>
              )}
            </div>
            <div className="dropdown-search-hint">
              <span>{filteredRooms.length} kamar ditemukan</span>
              {searchTerm && <span className="hint-active-tag">Filter: "{searchTerm}"</span>}
            </div>
          </div>

          <div className="searchable-select-options-list">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((r) => {
                const isSelected = String(r.number) === String(value);
                return (
                  <button
                    key={r.id || r.number}
                    type="button"
                    className={`searchable-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(r.number)}
                  >
                    <div className="option-info-left">
                      <span className="option-room-badge">Kamar {r.number}</span>
                      <div className="option-text-group">
                        <span className="option-tenant-name">
                          {r.currentTenant || 'Belum Ada Penghuni (Kosong)'}
                        </span>
                        <span className="option-room-type">
                          Lt. {r.floor} • {r.type}
                        </span>
                      </div>
                    </div>

                    <div className="option-info-right">
                      <span
                        className={`badge-status-pill ${
                          r.status === 'Terisi'
                            ? 'badge-terisi'
                            : r.status === 'Booking'
                            ? 'badge-booking'
                            : 'badge-kosong'
                        }`}
                      >
                        {r.status}
                      </span>
                      {isSelected && <IconCheck size={16} className="text-primary-green" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="searchable-no-options">
                <p>Tidak ada kamar yang cocok dengan "{searchTerm}"</p>
                <span className="text-xs text-gray-400">Coba kata kunci lain atau nomor lantai</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
