import { PERSISTED_DATABASE } from './persistedDatabase';

// Coordinates & Map Info
export const GLADIOLA_COORDS = {
  lat: -7.9586216,
  lng: 112.6057794,
  name: "Gladiola Guest House",
  address: "Jl. Bend. Palasari No.1, Karangbesuki, Kec. Sukun, Kota Malang, Jawa Timur 65145",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jl.+Bend.+Palasari+No.1,+Karangbesuki,+Kec.+Sukun,+Kota+Malang,+Jawa+Timur+65145",
  embedUrl: "https://maps.google.com/maps?q=Jl.+Bend.+Palasari+No.1,+Karangbesuki,+Kec.+Sukun,+Kota+Malang,+Jawa+Timur+65145&hl=id&z=17&output=embed"
};

// Utility to sanitize account names: remove any role or position suffixes
export const cleanAccountName = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\s*\([^)]*(?:pengelola|operator|super\s*admin|admin|owner|pemilik|kasir|anak\s*kos|penghuni|staf|staff|petugas)[^)]*\)/gi, '')
    .replace(/\s*[-–—:]\s*(?:pengelola|operator|super\s*admin|admin|owner|pemilik|kasir|anak\s*kos|penghuni|staf|staff|petugas).*/gi, '')
    .trim();
};

// System Authentication Accounts (Super Admin, Pengelola / Operator, Owner)
const rawSystemAccounts = PERSISTED_DATABASE.systemAccounts || [
  {
    id: "acc-1",
    username: "admin",
    password: "Amalia2125",
    role: "super_admin",
    name: "Amalia",
    phone: "081122334455",
    email: "admin@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2026-01-01"
  },
  {
    id: "acc-2",
    username: "andre",
    password: "andre123",
    role: "operator",
    name: "Andre",
    phone: "081234998877",
    email: "andre@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2026-01-10"
  },
  {
    id: "acc-3",
    username: "owner",
    password: "owner123",
    role: "owner",
    name: "Bpk. Pemilik",
    phone: "081233441122",
    email: "owner@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2026-01-05"
  }
];

export const SYSTEM_ACCOUNTS = rawSystemAccounts.map(acc => ({
  ...acc,
  name: cleanAccountName(acc.name)
}));

// Active Sessions
export const INITIAL_ACTIVE_SESSIONS = [];

// Historical User Sessions
export const INITIAL_SESSION_HISTORY = PERSISTED_DATABASE.sessionHistory || [];

// Bank & QRIS Payment Info
export const INITIAL_BANK_INFO = PERSISTED_DATABASE.bankInfo || {
  bankName: "BCA (Bank Central Asia)",
  accountNumber: "816-092-8812",
  accountHolder: "Gladiola Kos Management",
  qrisImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GLADIOLA-KOS-PAYMENT-MOCK",
  paymentNotes: "Transfer wajib menyertakan berita: Nama - No Kamar. Setelah transfer, bukti akan divalidasi oleh Pengelola."
};

// Wi-Fi Info
export const INITIAL_WIFI_INFO = PERSISTED_DATABASE.wifiInfo || {
  ssid: "Gladiol_Guest_House_5G",
  password: "tamansejukgladiol",
  speed: "100 Mbps Dedicated Fiber",
  note: "Koneksi khusus penghuni aktif Gladiola Guest House"
};

// Staff
export const INITIAL_STAFF = PERSISTED_DATABASE.staffList || [];

// Staff Ratings
export const INITIAL_STAFF_RATINGS = PERSISTED_DATABASE.staffRatings || [];

// Tenants (Exact Live Database Data)
export const INITIAL_TENANTS = PERSISTED_DATABASE.tenants || [];

// Rooms (Exact Live Database Data)
export const INITIAL_ROOMS = PERSISTED_DATABASE.rooms || [];

// Daily Bookings (Exact Live Database Data)
export const INITIAL_DAILY_BOOKINGS = PERSISTED_DATABASE.dailyBookings || [];

// Operators
export const INITIAL_OPERATORS = (PERSISTED_DATABASE.operators || []).map(op => ({
  ...op,
  fullName: cleanAccountName(op.fullName || op.name),
  name: cleanAccountName(op.name || op.fullName)
}));

// Month formatting and helpers
export const INDONESIAN_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const getNextMonthName = (monthStr) => {
  if (!monthStr) return 'November 2026';
  const parts = monthStr.trim().split(/\s+/);
  if (parts.length < 2) return monthStr;
  const name = parts[0];
  let year = parseInt(parts[1]) || 2026;
  let idx = INDONESIAN_MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === name.toLowerCase()
  );
  if (idx === -1) return monthStr;
  idx += 1;
  if (idx >= 12) {
    idx = 0;
    year += 1;
  }
  return `${INDONESIAN_MONTH_NAMES[idx]} ${year}`;
};

export const deduplicatePayments = (paymentsList) => {
  if (!Array.isArray(paymentsList)) return [];
  const map = new Map();

  paymentsList.forEach((p) => {
    if (!p || !p.month || !p.roomNumber) return;
    const cleanMonth = p.month.toLowerCase().trim();
    const cleanRoom = String(p.roomNumber).trim();
    const key = `${cleanMonth}_${cleanRoom}`;

    if (!map.has(key)) {
      map.set(key, p);
    } else {
      const existing = map.get(key);
      const statusScore = (s) => (s === 'Tervalidasi' ? 3 : s === 'Menunggu Validasi' ? 2 : 1);
      const existingScore = statusScore(existing.status);
      const newScore = statusScore(p.status);

      if (newScore > existingScore) {
        map.set(key, p);
      } else if (newScore === existingScore) {
        if (p.proofUrl && !existing.proofUrl) {
          map.set(key, p);
        } else if (p.paidAt && !existing.paidAt) {
          map.set(key, p);
        }
      }
    }
  });

  return Array.from(map.values());
};

export const deduplicateElectricityBills = (billsList) => {
  if (!Array.isArray(billsList)) return [];
  const map = new Map();

  billsList.forEach((b) => {
    if (!b || !b.month || !b.roomNumber) return;
    const cleanMonth = b.month.toLowerCase().trim();
    const cleanRoom = String(b.roomNumber).trim();
    const key = `${cleanMonth}_${cleanRoom}`;

    if (!map.has(key)) {
      map.set(key, b);
    } else {
      const existing = map.get(key);
      const statusScore = (s) => (s === 'Lunas' ? 2 : 1);
      const existingScore = statusScore(existing.status);
      const newScore = statusScore(b.status);

      if (newScore > existingScore) {
        map.set(key, b);
      } else if (newScore === existingScore) {
        if (b.token && !existing.token) {
          map.set(key, b);
        } else if (b.paidAt && !existing.paidAt) {
          map.set(key, b);
        } else if ((b.kwhUsage || 0) > (existing.kwhUsage || 0)) {
          map.set(key, b);
        }
      }
    }
  });

  return Array.from(map.values());
};

// Rent Payments (Exact Live Database Data)
export const INITIAL_RENT_PAYMENTS = deduplicatePayments(PERSISTED_DATABASE.payments || []);

// Electricity Bills (Exact Live Database Data)
export const INITIAL_ELECTRICITY_BILLS = deduplicateElectricityBills(PERSISTED_DATABASE.electricityBills || []);

// Activity Logs
export const INITIAL_ACTIVITY_LOGS = PERSISTED_DATABASE.activityLogs || [];
