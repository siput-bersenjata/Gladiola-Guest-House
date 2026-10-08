// System Authentication Accounts (Super Admin, Pengelola / Operator, Owner)
export const SYSTEM_ACCOUNTS = [
  {
    id: "acc-1",
    username: "admin",
    password: "Amalia2125",
    role: "super_admin",
    name: "Amalia (Super Admin)",
    phone: "081122334455",
    email: "admin@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2024-01-01"
  },
  {
    id: "acc-2",
    username: "andre",
    password: "andre123",
    role: "operator",
    name: "Andre (Pengelola Kos)",
    phone: "081234998877",
    email: "andre@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2024-01-10"
  },
  {
    id: "acc-3",
    username: "owner",
    password: "owner123",
    role: "owner",
    name: "Bpk. Pemilik (Owner Kos)",
    phone: "081233441122",
    email: "owner@gladiolaguesthouse.id",
    status: "Aktif",
    createdAt: "2024-01-05"
  }
];

// Active Sessions with Geolocation & Device Telemetry
export const INITIAL_ACTIVE_SESSIONS = [
  {
    id: "sess-admin",
    userId: "acc-1",
    username: "admin",
    name: "Amalia (Super Admin)",
    role: "super_admin",
    roleLabel: "Super Admin",
    room: null,
    phone: "081122334455",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Online",
    isCurrent: false,
    lastActive: "Sedang Aktif",
    loginTime: "Hari ini, 00:15 WIB",
    coords: {
      lat: -7.9583900,
      lng: 112.6059550,
      accuracy: 6
    },
    locationName: "Ruang Manajemen Gladiola Guest House, Lt. 1",
    distanceMeters: 8,
    isInsideKos: true,
    device: {
      model: "Laptop Lenovo ThinkPad X1 Carbon Gen 11",
      type: "Desktop / PC",
      os: "Windows 11 Pro (64-bit)",
      browser: "Google Chrome 129.0",
      screenRes: "1920 × 1080 (1.25x DPR)",
      viewport: "1536 × 760",
      orientation: "Landscape",
      ipAddress: "103.145.22.84",
      isp: "Biznet Networks Fiber Malang",
      networkType: "WiFi Gladiol_Guest_House_5G",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      cpuCores: 16,
      memory: "16 GB"
    }
  },
  {
    id: "sess-op",
    userId: "acc-2",
    username: "andre",
    name: "Andre (Pengelola Kos)",
    role: "operator",
    roleLabel: "Pengelola / Operator",
    room: null,
    phone: "081234998877",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Online",
    isCurrent: false,
    lastActive: "1 menit yang lalu",
    loginTime: "Hari ini, 00:05 WIB",
    coords: {
      lat: -7.9584100,
      lng: 112.6059650,
      accuracy: 12
    },
    locationName: "Lobby Gladiola Guest House • Pos Jaga Depan",
    distanceMeters: 14,
    isInsideKos: true,
    device: {
      model: "Samsung Galaxy S24 Ultra 5G",
      type: "Smartphone (Mobile)",
      os: "Android 14 (One UI 6.1)",
      browser: "Chrome Mobile 128.0",
      screenRes: "1440 × 3120 (3.0x DPR)",
      viewport: "412 × 915",
      orientation: "Portrait",
      ipAddress: "114.125.43.190",
      isp: "Telkomsel Flash 5G Malang",
      networkType: "5G Seluler Cepat",
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.127 Mobile Safari/537.36",
      cpuCores: 8,
      memory: "12 GB"
    }
  },
  {
    id: "sess-rizky",
    userId: "t-1",
    username: "081233445566",
    name: "Rizky Ramadhan",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 102",
    room: "Kamar 102 (Lt. 1)",
    phone: "081233445566",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    status: "Online",
    isCurrent: false,
    lastActive: "3 menit yang lalu",
    loginTime: "Kemarin, 23:40 WIB",
    coords: {
      lat: -7.9584210,
      lng: 112.6059720,
      accuracy: 5
    },
    locationName: "Kamar 102 (Deluxe Taman), Gladiola Kos",
    distanceMeters: 5,
    isInsideKos: true,
    device: {
      model: "Apple iPhone 15 Pro Max",
      type: "Smartphone (Mobile)",
      os: "iOS 18.0.1",
      browser: "Mobile Safari 18.0",
      screenRes: "1290 × 2796 (3.0x DPR)",
      viewport: "430 × 932",
      orientation: "Portrait",
      ipAddress: "103.145.22.84",
      isp: "Biznet WiFi Gladiol",
      networkType: "WiFi Gladiol_Guest_House_5G",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      cpuCores: 6,
      memory: "8 GB"
    }
  },
  {
    id: "sess-nabila",
    userId: "t-2",
    username: "081345678910",
    name: "Nabila Putri",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 205",
    room: "Kamar 205 (Lt. 2)",
    phone: "081345678910",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "Online",
    isCurrent: false,
    lastActive: "8 menit yang lalu",
    loginTime: "Kemarin, 22:50 WIB",
    coords: {
      lat: -7.9528000,
      lng: 112.6142000,
      accuracy: 18
    },
    locationName: "Jl. Veteran (Area Kampus UB), Malang",
    distanceMeters: 1100,
    isInsideKos: false,
    device: {
      model: "Apple MacBook Air 13-inch (M2)",
      type: "Desktop / PC",
      os: "macOS Sequoia 15.0",
      browser: "Google Chrome 129.0",
      screenRes: "2560 × 1664 (2.0x DPR)",
      viewport: "1440 × 900",
      orientation: "Landscape",
      ipAddress: "182.253.110.45",
      isp: "Indosat Ooredoo Hutchison 4G/5G",
      networkType: "Tethering Hotspot Seluler",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      cpuCores: 8,
      memory: "16 GB"
    }
  },
  {
    id: "sess-owner",
    userId: "acc-3",
    username: "owner",
    name: "Bpk. Pemilik (Owner Kos)",
    role: "owner",
    roleLabel: "Pemilik Properti",
    room: null,
    phone: "081233441122",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    status: "Idle",
    isCurrent: false,
    lastActive: "15 menit yang lalu",
    loginTime: "Kemarin, 21:10 WIB",
    coords: {
      lat: -7.9625000,
      lng: 112.6289000,
      accuracy: 25
    },
    locationName: "Klojen, Kota Malang (Kediaman Pemilik)",
    distanceMeters: 2600,
    isInsideKos: false,
    device: {
      model: "Apple iPad Pro 11-inch (M4)",
      type: "Tablet",
      os: "iPadOS 17.6",
      browser: "Mobile Safari 17.6",
      screenRes: "1668 × 2388 (2.0x DPR)",
      viewport: "834 × 1194",
      orientation: "Portrait",
      ipAddress: "36.85.12.77",
      isp: "Telkom Indihome Fiber Malang",
      networkType: "WiFi Broadband Fiber",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
      cpuCores: 9,
      memory: "8 GB"
    }
  }
];


// Initial realistic dataset for Gladiola Kos Eksklusif & Guest House
export const GLADIOLA_COORDS = {
  lat: -7.9584011,
  lng: 112.6059591,
  address: "Gladiola Guest House, Jl. Gladiol No. 1, Lowokwaru, Kota Malang, Jawa Timur 65141",
  mapsUrl: "https://www.google.com/maps/place/Gladiola+Guest+House/@-7.9581898,112.6059383,19.75z/data=!4m9!3m8!1s0x2e7882636fac0ba1:0x35903e0a08234e14!5m2!4m1!1i2!8m2!3d-7.9584011!4d112.6059591!16s%2Fg%2F11b6j70yv9"
};

export const INITIAL_BANK_INFO = {
  bankName: "BCA (Bank Central Asia)",
  accountNumber: "816-092-8812",
  accountHolder: "Gladiola Kos Management",
  qrisImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GLADIOLA-KOS-PAYMENT-MOCK",
  paymentNotes: "Transfer wajib menyertakan berita: Nama - No Kamar. Setelah transfer, bukti akan divalidasi oleh Pengelola."
};

export const INITIAL_WIFI_INFO = {
  ssid: "Gladiol_Guest_House_5G",
  password: "tamansejukgladiol",
  speed: "100 Mbps Dedicated Fiber",
  note: "Koneksi khusus penghuni aktif Gladiola Guest House"
};

export const INITIAL_STAFF = [
  {
    id: "stf-1",
    name: "Pak Bambang",
    role: "Petugas Keamanan & Maintenance",
    phone: "6281234567890",
    shift: "Siang (07:00 - 19:00)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Aktif",
    avgRating: 4.9,
    totalReviews: 28
  },
  {
    id: "stf-2",
    name: "Ibu Sri Rahayu",
    role: "Petugas Kebersihan & Fasilitas Kamar",
    phone: "6282145678901",
    shift: "Pagi (06:00 - 15:00)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "Aktif",
    avgRating: 4.8,
    totalReviews: 32
  },
  {
    id: "stf-3",
    name: "Mas Dwi Kurniawan",
    role: "Teknisi Listrik, AC & Plumbing",
    phone: "6285712345678",
    shift: "On-Call 24 Jam",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "Aktif",
    avgRating: 5.0,
    totalReviews: 19
  },
  {
    id: "stf-4",
    name: "Mbak Anisa",
    role: "Front Desk & Reservasi",
    phone: "6287812345678",
    shift: "Setiap Hari (08:00 - 20:00)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Aktif",
    avgRating: 4.9,
    totalReviews: 24
  }
];

export const INITIAL_STAFF_RATINGS = [
  {
    id: "rev-1",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    room: "Kamar 102",
    staffId: "stf-1",
    staffName: "Pak Bambang",
    rating: 5,
    comment: "Pak Bambang sangat ramah dan sigap membantu saat ada barang kiriman paket datang malam hari.",
    date: "2026-10-02 14:30",
    verifiedPaymentMonth: "Oktober 2026"
  },
  {
    id: "rev-2",
    tenantId: "t-2",
    tenantName: "Nabila Putri",
    tenantPhone: "081345678910",
    room: "Kamar 205",
    staffId: "stf-2",
    staffName: "Ibu Sri Rahayu",
    rating: 5,
    comment: "Lorong lantai 2 selalu harum dan bersih setiap pagi, terimakasih Bu Sri!",
    date: "2026-10-03 10:15",
    verifiedPaymentMonth: "Oktober 2026"
  },
  {
    id: "rev-3",
    tenantId: "t-3",
    tenantName: "Dimas Anggara",
    tenantPhone: "081987654321",
    room: "Kamar 108",
    staffId: "stf-3",
    staffName: "Mas Dwi Kurniawan",
    rating: 5,
    comment: "AC kamar sempat kurang dingin langsung ditangani Mas Dwi dalam waktu 30 menit, cepat sekali pelayanannya.",
    date: "2026-10-04 16:45",
    verifiedPaymentMonth: "Oktober 2026"
  }
];

export const INITIAL_TENANTS = [
  {
    id: "t-1",
    name: "Rizky Ramadhan",
    phone: "081233445566",
    roomNumber: "102",
    roomType: "Deluxe Taman (AC + KM Dalam)",
    monthlyRent: 1750000,
    startDate: "2024-01-15",
    status: "Aktif",
    emergencyContact: "081299887766 (Ibu)",
    notes: "Mahasiswa UB, motor Beat Hitam N 4821 XX"
  },
  {
    id: "t-2",
    name: "Nabila Putri",
    phone: "081345678910",
    roomNumber: "205",
    roomType: "Executive Balcony",
    monthlyRent: 2100000,
    startDate: "2024-03-01",
    status: "Aktif",
    emergencyContact: "081311223344 (Ayah)",
    notes: "Karyawati IT Malang, WFH"
  },
  {
    id: "t-3",
    name: "Dimas Anggara",
    phone: "081987654321",
    roomNumber: "108",
    roomType: "Standard Sejuk",
    monthlyRent: 1500000,
    startDate: "2024-05-10",
    status: "Aktif",
    emergencyContact: "081900112233 (Kakak)",
    notes: "Mahasiswa Polinema"
  },
  {
    id: "t-4",
    name: "Siti Rahmawati",
    phone: "085612340001",
    roomNumber: "201",
    roomType: "Deluxe Taman (AC + KM Dalam)",
    monthlyRent: 1750000,
    startDate: "2024-02-01",
    status: "Aktif",
    emergencyContact: "085699998888 (Ibu)",
    notes: "Mahasiswi UM"
  },
  {
    id: "t-5",
    name: "Fajar Nugraha",
    phone: "087700998811",
    roomNumber: "302",
    roomType: "Executive Balcony",
    monthlyRent: 2100000,
    startDate: "2024-06-01",
    status: "Aktif",
    emergencyContact: "087711223344 (Ayah)",
    notes: "Dokter Muda RSSA"
  }
];

export const INITIAL_ROOMS = Array.from({ length: 50 }, (_, i) => {
  const roomNumber = `${Math.floor(i / 18) + 1}${String((i % 18) + 1).padStart(2, "0")}`;
  let status = "Terisi";
  let tenant = null;
  let type = "Deluxe Taman";
  let price = 1750000;

  if (roomNumber === "102") {
    tenant = "Rizky Ramadhan";
    type = "Deluxe Taman (AC + KM Dalam)";
    price = 1750000;
  } else if (roomNumber === "205") {
    tenant = "Nabila Putri";
    type = "Executive Balcony";
    price = 2100000;
  } else if (roomNumber === "108") {
    tenant = "Dimas Anggara";
    type = "Standard Sejuk";
    price = 1500000;
  } else if (roomNumber === "201") {
    tenant = "Siti Rahmawati";
    type = "Deluxe Taman (AC + KM Dalam)";
    price = 1750000;
  } else if (roomNumber === "302") {
    tenant = "Fajar Nugraha";
    type = "Executive Balcony";
    price = 2100000;
  } else if (i === 48 || i === 49) {
    status = "Kosong";
    tenant = null;
  } else if (i >= 45 && i <= 47) {
    status = "Booking";
    tenant = "Calon Penghuni";
  } else {
    tenant = `Penghuni Kamar ${roomNumber}`;
  }

  return {
    id: `rm-${i + 1}`,
    number: roomNumber,
    floor: Math.floor(i / 18) + 1,
    type,
    price,
    status, // "Terisi" | "Booking" | "Kosong"
    currentTenant: tenant,
    facilities: ["AC Split", "Spring Bed Queen", "Kamar Mandi Dalam", "Water Heater", "Lemari Jati", "Meja Belajar", "Smart Lock"]
  };
});

export const INITIAL_RENT_PAYMENTS = [
  {
    id: "pay-101",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Oktober 2026",
    amount: 1750000,
    paidAt: "2026-10-02 09:15",
    paymentMethod: "Transfer Bank BCA",
    status: "Tervalidasi", // "Tervalidasi" | "Menunggu Validasi" | "Belum Bayar"
    validatedBy: "Operator Taman",
    validatedAt: "2026-10-02 09:45",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  },
  {
    id: "pay-102",
    tenantId: "t-2",
    tenantName: "Nabila Putri",
    tenantPhone: "081345678910",
    roomNumber: "205",
    month: "Oktober 2026",
    amount: 2100000,
    paidAt: "2026-10-03 08:30",
    paymentMethod: "Transfer Bank BCA",
    status: "Tervalidasi",
    validatedBy: "Operator Taman",
    validatedAt: "2026-10-03 09:00",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  },
  {
    id: "pay-103",
    tenantId: "t-3",
    tenantName: "Dimas Anggara",
    tenantPhone: "081987654321",
    roomNumber: "108",
    month: "Oktober 2026",
    amount: 1500000,
    paidAt: "2026-10-04 14:20",
    paymentMethod: "Transfer Bank Mandiri",
    status: "Tervalidasi",
    validatedBy: "Operator Taman",
    validatedAt: "2026-10-04 15:10",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  },
  {
    id: "pay-104",
    tenantId: "t-4",
    tenantName: "Siti Rahmawati",
    tenantPhone: "085612340001",
    roomNumber: "201",
    month: "Oktober 2026",
    amount: 1750000,
    paidAt: "2026-10-07 19:10",
    paymentMethod: "Transfer Bank BCA",
    status: "Menunggu Validasi",
    validatedBy: null,
    validatedAt: null,
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: false
  },
  {
    id: "pay-105",
    tenantId: "t-5",
    tenantName: "Fajar Nugraha",
    tenantPhone: "087700998811",
    roomNumber: "302",
    month: "Oktober 2026",
    amount: 2100000,
    paidAt: null,
    paymentMethod: null,
    status: "Belum Bayar",
    validatedBy: null,
    validatedAt: null,
    proofUrl: null,
    ratingGiven: false
  },
  // Previous months history for tenant 1 (Rizky Ramadhan)
  {
    id: "pay-91",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "September 2026",
    amount: 1750000,
    paidAt: "2026-09-02 10:00",
    paymentMethod: "Transfer Bank BCA",
    status: "Tervalidasi",
    validatedBy: "Operator Taman",
    validatedAt: "2026-09-02 11:00",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  },
  {
    id: "pay-81",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Agustus 2026",
    amount: 1750000,
    paidAt: "2026-08-01 14:10",
    paymentMethod: "Transfer Bank BCA",
    status: "Tervalidasi",
    validatedBy: "Operator Taman",
    validatedAt: "2026-08-01 15:30",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  },
  {
    id: "pay-71",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Juli 2026",
    amount: 1750000,
    paidAt: "2026-07-02 08:45",
    paymentMethod: "Transfer Bank BCA",
    status: "Tervalidasi",
    validatedBy: "Operator Taman",
    validatedAt: "2026-07-02 09:20",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80",
    ratingGiven: true
  }
];

export const INITIAL_ELECTRICITY_BILLS = [
  {
    id: "elec-101",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Oktober 2026",
    meterStart: 1240,
    meterEnd: 1320,
    kwhUsage: 80,
    ratePerKwh: 1650,
    totalBill: 132000,
    status: "Lunas", // "Lunas" | "Belum Bayar"
    paidAt: "2026-10-02 09:15",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-102",
    tenantId: "t-2",
    tenantName: "Nabila Putri",
    tenantPhone: "081345678910",
    roomNumber: "205",
    month: "Oktober 2026",
    meterStart: 2110,
    meterEnd: 2215,
    kwhUsage: 105,
    ratePerKwh: 1650,
    totalBill: 173250,
    status: "Lunas",
    paidAt: "2026-10-03 08:30",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-103",
    tenantId: "t-3",
    tenantName: "Dimas Anggara",
    tenantPhone: "081987654321",
    roomNumber: "108",
    month: "Oktober 2026",
    meterStart: 890,
    meterEnd: 955,
    kwhUsage: 65,
    ratePerKwh: 1650,
    totalBill: 107250,
    status: "Lunas",
    paidAt: "2026-10-04 14:20",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-104",
    tenantId: "t-4",
    tenantName: "Siti Rahmawati",
    tenantPhone: "085612340001",
    roomNumber: "201",
    month: "Oktober 2026",
    meterStart: 1540,
    meterEnd: 1618,
    kwhUsage: 78,
    ratePerKwh: 1650,
    totalBill: 128700,
    status: "Belum Bayar",
    paidAt: null,
    recordedBy: "Operator Taman"
  },
  // Previous months history for tenant 1
  {
    id: "elec-91",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "September 2026",
    meterStart: 1165,
    meterEnd: 1240,
    kwhUsage: 75,
    ratePerKwh: 1650,
    totalBill: 123750,
    status: "Lunas",
    paidAt: "2026-09-02 10:00",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-81",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Agustus 2026",
    meterStart: 1080,
    meterEnd: 1165,
    kwhUsage: 85,
    ratePerKwh: 1650,
    totalBill: 140250,
    status: "Lunas",
    paidAt: "2026-08-01 14:10",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-71",
    tenantId: "t-1",
    tenantName: "Rizky Ramadhan",
    tenantPhone: "081233445566",
    roomNumber: "102",
    month: "Juli 2026",
    meterStart: 1005,
    meterEnd: 1080,
    kwhUsage: 75,
    ratePerKwh: 1650,
    totalBill: 123750,
    status: "Lunas",
    paidAt: "2026-07-02 08:45",
    recordedBy: "Operator Taman"
  }
];

export const INITIAL_OPERATORS = [
  {
    id: "op-1",
    username: "andre",
    fullName: "Andre (Pengelola Kos)",
    email: "andre@gladiolaguesthouse.id",
    phone: "081234998877",
    role: "operator",
    status: "Aktif",
    createdAt: "2024-01-10"
  },
  {
    id: "op-2",
    username: "operator_keuangan",
    fullName: "Dewi Lestari (Staf Kasir)",
    email: "dewi@gladiolaguesthouse.id",
    phone: "081255667788",
    role: "operator",
    status: "Aktif",
    createdAt: "2024-03-15"
  }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: "log-1",
    timestamp: "2026-10-08 23:15:42",
    user: "Super Admin Gladiola",
    role: "super_admin",
    action: "Login ke Panel Pengawasan Gladiola",
    details: "Verifikasi GPS terkonfirmasi di sekitar Jl. Gladiol No. 1 Malang",
    coords: { lat: -7.9584011, lng: 112.6059591 },
    locationName: "Lowokwaru, Kota Malang (Radius 15m)"
  },
  {
    id: "log-2",
    timestamp: "2026-10-08 21:40:18",
    user: "Admin Taman (Operator)",
    role: "operator",
    action: "Validasi Pembayaran Kos Kamar 102",
    details: "Validasi bukti bayar transfer BCA Rp 1.750.000 atas nama Rizky Ramadhan",
    coords: { lat: -7.9583900, lng: 112.6059400 },
    locationName: "Gladiola Guest House Lobby"
  },
  {
    id: "log-3",
    timestamp: "2026-10-08 20:12:05",
    user: "Rizky Ramadhan (081233445566)",
    role: "anak_kos",
    action: "Memberikan Rating & Ulasan Petugas",
    details: "Memberikan Bintang 5 untuk Pak Bambang dengan pesan ulasan apresiasi",
    coords: { lat: -7.9584200, lng: 112.6059700 },
    locationName: "Kamar 102, Gladiola Kos"
  },
  {
    id: "log-4",
    timestamp: "2026-10-08 18:05:30",
    user: "Owner Kos Gladiola",
    role: "owner",
    action: "Memeriksa Laporan Okupansi & Keuangan",
    details: "Melihat grafik penerimaan sewa kamar bulan Oktober 2026",
    coords: { lat: -7.9620000, lng: 112.6280000 },
    locationName: "Klojen, Kota Malang"
  },
  {
    id: "log-5",
    timestamp: "2026-10-08 16:30:11",
    user: "Admin Taman (Operator)",
    role: "operator",
    action: "Input Meteran Listrik Kamar 205",
    details: "Pencatatan meter listrik 105 kWh (Rp 173.250)",
    coords: { lat: -7.9584050, lng: 112.6059620 },
    locationName: "Lantai 2 Gladiola"
  }
];
