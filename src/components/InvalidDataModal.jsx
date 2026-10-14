import React from 'react';
import { useApp } from '../context/AppContext';
import { IconAlertTriangle, IconClose } from './Icons';

export const InvalidDataModal = () => {
  const { invalidModalConfig, closeInvalidPopup } = useApp();

  if (!invalidModalConfig?.isOpen) {
    return null;
  }

  const { title, message, reasons = [], actionLabel = 'Tutup & Perbaiki' } = invalidModalConfig;

  return (
    <div className="location-modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="location-modal-card"
        style={{
          maxWidth: '520px',
          padding: '32px 28px',
          border: '1px solid #fecaca',
          backgroundColor: '#ffffff'
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button at top-right */}
        <button
          type="button"
          onClick={closeInvalidPopup}
          aria-label="Tutup"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'background 0.2s'
          }}
        >
          <IconClose size={16} />
        </button>

        {/* Warning Icon Badge */}
        <div
          className="location-icon-wrapper"
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          <IconAlertTriangle size={32} />
        </div>

        {/* Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '999px',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            border: '1px solid #fecaca'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444'
            }}
          ></span>
          Validasi Sistem: Data Tidak Sesuai (Invalid)
        </div>

        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '8px'
          }}
        >
          {title || 'Peringatan: Data Tidak Sesuai'}
        </h3>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#4b5563',
            lineHeight: 1.6,
            marginBottom: '18px'
          }}
        >
          {message}
        </p>

        {/* Reason Explanations Box */}
        {reasons && reasons.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#9a3412',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginBottom: '8px'
              }}
            >
              Penyebab & Rincian Ketidaksesuaian:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: '18px',
                fontSize: '0.84rem',
                color: '#7c2d12',
                lineHeight: 1.6
              }}
            >
              {reasons.map((r, idx) => (
                <li key={idx} style={{ marginBottom: idx === reasons.length - 1 ? 0 : '6px' }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Primary Action Button */}
        <div>
          <button
            type="button"
            className="btn-primary"
            onClick={closeInvalidPopup}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 20px',
              backgroundColor: '#1b4332',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
