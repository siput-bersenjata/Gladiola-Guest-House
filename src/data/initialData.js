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

// Active Sessions with Geolocation & Device Telemetry (Hanya sesi real-time pengguna yang sedang aktif, tanpa data dummy)
export const INITIAL_ACTIVE_SESSIONS = [];

// Historical User Sessions (Riwayat Sesi User Aktif)
export const INITIAL_SESSION_HISTORY = [
  {
    id: "hist-1",
    userId: "t-5",
    username: "081299887766",
    name: "Dimas Setiawan",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 105",
    room: "Kamar 105 (Lt. 1)",
    phone: "081299887766",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 21:05 WIB",
    logoutTime: "12 Okt 2026, 22:15 WIB",
    sessionDuration: "1 jam 10 menit",
    lastAccessedPage: "Pengaduan & Komplain Fasilitas",
    lastAction: "Kirim pesan komplain pembersihan filter AC kamar 105",
    coords: {
      lat: -7.9584300,
      lng: 112.6059800,
      accuracy: 8
    },
    locationName: "Kamar 105 (Standard lt. 1), Gladiola Kos",
    distanceMeters: 12,
    isInsideKos: true,
    device: {
      model: "Xiaomi 13 Pro 5G",
      type: "Smartphone (Mobile)",
      os: "Android 14 (HyperOS)",
      browser: "Chrome Mobile 128.0",
      screenRes: "1440 × 3200",
      ipAddress: "103.145.22.84",
      isp: "Biznet WiFi Gladiol",
      networkType: "WiFi Gladiol_Guest_House_5G"
    }
  },
  {
    id: "hist-2",
    userId: "t-6",
    username: "081377889900",
    name: "Siti Nurhaliza",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 201",
    room: "Kamar 201 (Lt. 2)",
    phone: "081377889900",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 19:10 WIB",
    logoutTime: "12 Okt 2026, 19:55 WIB",
    sessionDuration: "45 menit",
    lastAccessedPage: "Pembayaran Sewa Kos",
    lastAction: "Konfirmasi perpanjangan sewa & cek no. rekening BCA Gladiola",
    coords: {
      lat: -7.9774000,
      lng: 112.6375000,
      accuracy: 20
    },
    locationName: "Stasiun Malang Kotabaru, Klojen, Kota Malang",
    distanceMeters: 3200,
    isInsideKos: false,
    device: {
      model: "Samsung Galaxy A54 5G",
      type: "Smartphone (Mobile)",
      os: "Android 14 (One UI 6.0)",
      browser: "Chrome Mobile 127.0",
      screenRes: "1080 × 2340",
      ipAddress: "114.122.98.54",
      isp: "Telkomsel Flash Seluler",
      networkType: "4G LTE Seluler"
    }
  },
  {
    id: "hist-3",
    userId: "t-12",
    username: "081255443322",
    name: "Fajar Prasetyo",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 304",
    room: "Kamar 304 (Lt. 3)",
    phone: "081255443322",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 16:40 WIB",
    logoutTime: "12 Okt 2026, 17:25 WIB",
    sessionDuration: "45 menit",
    lastAccessedPage: "Rating & Ulasan Petugas",
    lastAction: "Memberikan rating bintang 5 untuk petugas kebersihan kos",
    coords: {
      lat: -7.9452000,
      lng: 112.6105000,
      accuracy: 15
    },
    locationName: "Jl. MT Haryono (Area Dinoyo), Malang",
    distanceMeters: 1450,
    isInsideKos: false,
    device: {
      model: "Laptop ASUS Zenbook 14 OLED",
      type: "Desktop / PC",
      os: "Windows 11 Home",
      browser: "Microsoft Edge 128.0",
      screenRes: "2880 × 1800",
      ipAddress: "180.252.17.65",
      isp: "First Media Cafe Dinoyo",
      networkType: "WiFi Cafe Dinoyo"
    }
  },
  {
    id: "hist-4",
    userId: "st-1",
    username: "bambang_cleaner",
    name: "Pak Bambang (Petugas Kebersihan)",
    role: "staff",
    roleLabel: "Petugas Lapangan",
    room: null,
    phone: "081399881122",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 14:00 WIB",
    logoutTime: "12 Okt 2026, 15:30 WIB",
    sessionDuration: "1 jam 30 menit",
    lastAccessedPage: "Jadwal & Tugas Staf",
    lastAction: "Konfirmasi penyelesaian tugas kebersihan koridor lt. 2 & taman",
    coords: {
      lat: -7.9583800,
      lng: 112.6059400,
      accuracy: 9
    },
    locationName: "Area Koridor & Taman Gladiola Guest House",
    distanceMeters: 11,
    isInsideKos: true,
    device: {
      model: "OPPO Reno 10 5G",
      type: "Smartphone (Mobile)",
      os: "Android 13 (ColorOS)",
      browser: "Chrome Mobile 126.0",
      screenRes: "1080 × 2412",
      ipAddress: "103.145.22.84",
      isp: "Biznet WiFi Gladiol",
      networkType: "WiFi Gladiol_Guest_House_5G"
    }
  },
  {
    id: "hist-5",
    userId: "op-2",
    username: "operator_keuangan",
    name: "Dewi Lestari (Staf Kasir)",
    role: "operator",
    roleLabel: "Staf Kasir & Keuangan",
    room: null,
    phone: "081255667788",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 10:15 WIB",
    logoutTime: "12 Okt 2026, 13:00 WIB",
    sessionDuration: "2 jam 45 menit",
    lastAccessedPage: "Laporan Penerimaan Keuangan",
    lastAction: "Rekapitulasi setoran tunai & transfer bank sewa bulan Oktober",
    coords: {
      lat: -7.9583950,
      lng: 112.6059520,
      accuracy: 5
    },
    locationName: "Meja Administrasi Gladiola Guest House",
    distanceMeters: 7,
    isInsideKos: true,
    device: {
      model: "PC Desktop Dell OptiPlex 7090",
      type: "Desktop / PC",
      os: "Windows 11 Pro",
      browser: "Google Chrome 129.0",
      screenRes: "1920 × 1080",
      ipAddress: "103.145.22.84",
      isp: "Biznet Networks Malang",
      networkType: "Ethernet LAN Gladiol"
    }
  },
  {
    id: "hist-6",
    userId: "acc-2",
    username: "andre",
    name: "Andre (Pengelola Kos)",
    role: "operator",
    roleLabel: "Pengelola / Operator",
    room: null,
    phone: "081234998877",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "12 Okt 2026, 08:30 WIB",
    logoutTime: "12 Okt 2026, 11:45 WIB",
    sessionDuration: "3 jam 15 menit",
    lastAccessedPage: "Pencatatan Listrik & Token",
    lastAction: "Pencatatan meter kWh kamar 101 s/d 110 dan input token",
    coords: {
      lat: -7.9584050,
      lng: 112.6059600,
      accuracy: 6
    },
    locationName: "Koridor Lantai 1 Gladiola Guest House",
    distanceMeters: 10,
    isInsideKos: true,
    device: {
      model: "Samsung Galaxy S24 Ultra 5G",
      type: "Smartphone (Mobile)",
      os: "Android 14 (One UI 6.1)",
      browser: "Chrome Mobile 128.0",
      screenRes: "1440 × 3120",
      ipAddress: "103.145.22.84",
      isp: "Biznet WiFi Gladiol",
      networkType: "WiFi Gladiol_Guest_House_5G"
    }
  },
  {
    id: "hist-7",
    userId: "t-1",
    username: "081233445566",
    name: "Rizky Ramadhan",
    role: "anak_kos",
    roleLabel: "Penghuni Kamar 102",
    room: "Kamar 102 (Lt. 1)",
    phone: "081233445566",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "11 Okt 2026, 19:00 WIB",
    logoutTime: "11 Okt 2026, 19:40 WIB",
    sessionDuration: "40 menit",
    lastAccessedPage: "Validasi Pembayaran Sewa",
    lastAction: "Unggah bukti transfer pembayaran sewa bulan Oktober Rp 1.750.000",
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
      screenRes: "1290 × 2796",
      ipAddress: "103.145.22.84",
      isp: "Biznet WiFi Gladiol",
      networkType: "WiFi Gladiol_Guest_House_5G"
    }
  },
  {
    id: "hist-8",
    userId: "acc-3",
    username: "owner",
    name: "Bpk. Pemilik (Owner Kos)",
    role: "owner",
    roleLabel: "Pemilik Properti",
    room: null,
    phone: "081233441122",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    status: "Selesai",
    loginTime: "11 Okt 2026, 15:10 WIB",
    logoutTime: "11 Okt 2026, 16:00 WIB",
    sessionDuration: "50 menit",
    lastAccessedPage: "Dashboard Ringkasan & Okupansi",
    lastAction: "Melihat tingkat keterisian kamar kos (96% Okupansi)",
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
      screenRes: "1668 × 2388",
      ipAddress: "36.85.12.77",
      isp: "Telkom Indihome Fiber Malang",
      networkType: "WiFi Broadband Fiber"
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

const INITIAL_TENANT_SPECS = [
  // Lantai 1 (101-105: 5 Kamar Bulanan)
  { name: "Andi Pratama", phone: "081211112233", room: "101", type: "Deluxe Taman (AC + KM Dalam)", price: 1750000, start: "2024-01-10", notes: "Mahasiswa UB Teknik", emergency: "081299001122 (Ayah)" },
  { name: "Rizky Ramadhan", phone: "081233445566", room: "102", type: "Deluxe Taman (AC + KM Dalam)", price: 1750000, start: "2024-01-15", notes: "Mahasiswa UB, motor Beat Hitam N 4821 XX", emergency: "081299887766 (Ibu)" },
  { name: "Bagas Saputra", phone: "081244556677", room: "103", type: "Deluxe Taman (AC + KM Dalam)", price: 1750000, start: "2024-02-01", notes: "Karyawan Bank Mandiri", emergency: "081388776655 (Kakak)" },
  { name: "Bayu Wicaksono", phone: "081255667788", room: "104", type: "Deluxe Taman (AC + KM Dalam)", price: 1750000, start: "2024-02-15", notes: "Mahasiswa UM Informatika", emergency: "081277665544 (Ibu)" },
  { name: "Deni Setiawan", phone: "081266778899", room: "105", type: "Deluxe Taman (AC + KM Dalam)", price: 1750000, start: "2024-03-01", notes: "Desainer Grafis Freelance", emergency: "081366554433 (Ayah)" },
  // Lantai 2 (205: Kamar Bulanan)
  { name: "Nabila Putri", phone: "081345678910", room: "205", type: "Executive Balcony", price: 2100000, start: "2024-03-01", notes: "Karyawati IT Malang, WFH", emergency: "081311223344 (Ayah)" }
];

export const INITIAL_TENANTS = INITIAL_TENANT_SPECS.map((spec, i) => ({
  id: `t-${i + 1}`,
  name: spec.name,
  phone: spec.phone,
  roomNumber: spec.room,
  roomType: spec.type,
  monthlyRent: spec.price,
  startDate: spec.start,
  status: spec.status || "Aktif",
  emergencyContact: spec.emergency,
  notes: spec.notes
}));

// Total 10 kamar: Lantai 1 (101-105) & Lantai 2 (201-205) - tepat 5 kamar per lantai
export const INITIAL_ROOMS = Array.from({ length: 10 }, (_, i) => {
  const floor = Math.floor(i / 5) + 1;
  const roomNumber = `${floor}${String((i % 5) + 1).padStart(2, "0")}`;
  let status = "Terisi";
  let tenant = null;
  let type = "Deluxe Taman (AC + KM Dalam)";
  let price = 1750000;

  const matchedTenant = INITIAL_TENANT_SPECS.find((t) => t.room === roomNumber);

  // Kamar 201 - 204 disiapkan khusus sebagai unit Sewa Harian di Lantai 2
  const isDaily = ["201", "202", "203", "204"].includes(roomNumber);
  const category = isDaily ? "Harian" : "Bulanan";

  if (isDaily) {
    type = "Executive Balcony";
    price = 2100000;
    if (roomNumber === "201") {
      status = "Terisi";
      tenant = "Hendro Wijaya (Tamu Harian)";
    } else if (roomNumber === "202") {
      status = "Booking";
      tenant = "Dr. Nadia Pratiwi (Tamu Harian)";
    } else if (roomNumber === "203") {
      status = "Booking";
      tenant = "Bima Arya Prasetya (Tamu Harian)";
    } else if (roomNumber === "204") {
      status = "Booking";
      tenant = "Siti Rahmawati (Tamu Harian)";
    }
  } else {
    status = "Terisi";
    tenant = matchedTenant ? matchedTenant.name : `Penghuni Kamar ${roomNumber}`;
    type = matchedTenant ? matchedTenant.type : (roomNumber === "205" ? "Executive Balcony" : ["104", "105"].includes(roomNumber) ? "Standard Sejuk" : "Deluxe Taman (AC + KM Dalam)");
    price = matchedTenant ? matchedTenant.price : (type.includes("Executive") ? 2100000 : type.includes("Standard") ? 1500000 : 1750000);
  }

  const tokenP1 = "3819";
  const tokenP2 = String(2000 + (i + 1) * 7).padStart(4, "0");
  const tokenP3 = String(8800 + (i + 1) * 11).slice(-4);
  const tokenP4 = String(9014 + (i + 1) * 3).slice(-4);
  const tokenP5 = String(5520 + (i + 1)).padStart(4, "0");
  const electricityToken = `${tokenP1}-${tokenP2}-${tokenP3}-${tokenP4}-${tokenP5}`;
  const meterId = `PLN-14${String(28000000 + (i + 1) * 137).slice(-8)}`;
  const dailyPrice = type.includes("Executive") ? 275000 : 250000;

  return {
    id: `rm-${i + 1}`,
    number: roomNumber,
    floor,
    type,
    price,
    dailyPrice,
    category, // "Bulanan" | "Harian"
    status, // "Terisi" | "Booking" | "Kosong"
    currentTenant: tenant,
    electricityToken,
    meterId,
    facilities: ["AC Split", "Spring Bed Queen", "Kamar Mandi Dalam", "Water Heater", "Lemari Jati", "Meja Belajar", "Smart Lock"]
  };
});

// INITIAL_DAILY_BOOKINGS: Jadwal reservasi khusus unit kamar yang disewakan per hari di Lantai 2
export const INITIAL_DAILY_BOOKINGS = [
  {
    id: "book-daily-101",
    bookingCode: "GLD-HR-001",
    roomNumber: "201",
    floor: 2,
    roomType: "Executive Balcony",
    guestName: "Hendro Wijaya",
    guestPhone: "081234567890",
    guestCity: "Surabaya",
    guestIdNumber: "3578012345670001",
    checkIn: "2026-10-12",
    checkOut: "2026-10-15",
    nights: 3,
    dailyPrice: 275000,
    totalAmount: 825000,
    paidAmount: 825000,
    remainingAmount: 0,
    paymentStatus: "Lunas Penuh", // "DP Lunas" | "Lunas Penuh"
    paymentMethod: "Transfer Bank BCA",
    stayStatus: "Sedang Menginap", // "Sedang Menginap" | "Terkonfirmasi" | "Selesai"
    createdAt: "2026-10-10 14:20",
    notes: "Late check-in jam 20:00, minta extra bantal dan gantungan baju"
  },
  {
    id: "book-daily-102",
    bookingCode: "GLD-HR-002",
    roomNumber: "202",
    floor: 2,
    roomType: "Executive Balcony",
    guestName: "Dr. Nadia Pratiwi",
    guestPhone: "081398765432",
    guestCity: "Jakarta Selatan",
    guestIdNumber: "3174098765430002",
    checkIn: "2026-10-14",
    checkOut: "2026-10-16",
    nights: 2,
    dailyPrice: 275000,
    totalAmount: 550000,
    paidAmount: 275000,
    remainingAmount: 275000,
    paymentStatus: "DP Lunas", // "DP Lunas" | "Lunas Penuh"
    paymentMethod: "Transfer Bank BCA",
    stayStatus: "Terkonfirmasi",
    createdAt: "2026-10-11 09:30",
    notes: "Pelunasan sisa Rp 275.000 saat tiba di resepsionis kos"
  },
  {
    id: "book-daily-103",
    bookingCode: "GLD-HR-003",
    roomNumber: "203",
    floor: 2,
    roomType: "Executive Balcony",
    guestName: "Bima Arya Prasetya",
    guestPhone: "081277889900",
    guestCity: "Bandung",
    guestIdNumber: "3273011223340003",
    checkIn: "2026-10-16",
    checkOut: "2026-10-19",
    nights: 3,
    dailyPrice: 275000,
    totalAmount: 825000,
    paidAmount: 825000,
    remainingAmount: 0,
    paymentStatus: "Lunas Penuh", // "DP Lunas" | "Lunas Penuh"
    paymentMethod: "QRIS Dinamis",
    stayStatus: "Terkonfirmasi",
    createdAt: "2026-10-12 16:15",
    notes: "Tamu dinas pekerjaan instansi, butuh kuitansi resmi bertanda tangan"
  },
  {
    id: "book-daily-104",
    bookingCode: "GLD-HR-004",
    roomNumber: "204",
    floor: 2,
    roomType: "Executive Balcony",
    guestName: "Siti Rahmawati",
    guestPhone: "085611223344",
    guestCity: "Semarang",
    guestIdNumber: "3374023456780004",
    checkIn: "2026-10-20",
    checkOut: "2026-10-22",
    nights: 2,
    dailyPrice: 275000,
    totalAmount: 550000,
    paidAmount: 275000,
    remainingAmount: 275000,
    paymentStatus: "DP Lunas", // "DP Lunas" | "Lunas Penuh"
    paymentMethod: "Transfer Bank BCA",
    stayStatus: "Terkonfirmasi",
    createdAt: "2026-10-13 10:00",
    notes: "Booking via telepon pengelola, konfirmasi check-in jam 14:00"
  }
];

// Base payments with specific states for Oktober 2026 demo
const SPECIFIC_PAYMENTS = [
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
    tenantName: "Bagas Saputra",
    tenantPhone: "081244556677",
    roomNumber: "103",
    month: "Oktober 2026",
    amount: 1750000,
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
    tenantName: "Bayu Wicaksono",
    tenantPhone: "081255667788",
    roomNumber: "104",
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
    tenantName: "Deni Setiawan",
    tenantPhone: "081266778899",
    roomNumber: "105",
    month: "Oktober 2026",
    amount: 1750000,
    paidAt: null,
    paymentMethod: "Belum Transfer",
    status: "Belum Bayar",
    validatedBy: null,
    validatedAt: null,
    proofUrl: null,
    ratingGiven: false
  }
];

// Historical payments for previous months
const HISTORY_PAYMENTS = [
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

// Dynamically generate October 2026 bills for all other active tenants
const REMAINING_OCTOBER_PAYMENTS = INITIAL_TENANTS
  .filter((t) => t.status === "Aktif" && !SPECIFIC_PAYMENTS.some((sp) => sp.roomNumber === t.roomNumber))
  .map((t) => ({
    id: `pay-okt26-${t.roomNumber}`,
    tenantId: t.id,
    tenantName: t.name,
    tenantPhone: t.phone,
    roomNumber: t.roomNumber,
    month: "Oktober 2026",
    amount: t.monthlyRent || 1750000,
    paidAt: null,
    paymentMethod: "Belum Transfer",
    status: "Belum Bayar",
    validatedBy: null,
    validatedAt: null,
    proofUrl: null,
    ratingGiven: false
  }));

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

export const INITIAL_RENT_PAYMENTS = deduplicatePayments([
  ...SPECIFIC_PAYMENTS,
  ...REMAINING_OCTOBER_PAYMENTS,
  ...HISTORY_PAYMENTS
]);

// Base electricity bills with specific states and tokens for Oktober 2026
const SPECIFIC_ELEC_BILLS = [
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
    token: "3819-2041-8849-2194-0012",
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
    token: "5109-3382-7714-9023-4410",
    status: "Lunas",
    paidAt: "2026-10-03 08:30",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-103",
    tenantId: "t-3",
    tenantName: "Bagas Saputra",
    tenantPhone: "081244556677",
    roomNumber: "103",
    month: "Oktober 2026",
    meterStart: 890,
    meterEnd: 955,
    kwhUsage: 65,
    ratePerKwh: 1650,
    totalBill: 107250,
    token: "1940-8821-6632-1104-9852",
    status: "Lunas",
    paidAt: "2026-10-04 14:20",
    recordedBy: "Operator Taman"
  },
  {
    id: "elec-104",
    tenantId: "t-4",
    tenantName: "Bayu Wicaksono",
    tenantPhone: "081255667788",
    roomNumber: "104",
    month: "Oktober 2026",
    meterStart: 1540,
    meterEnd: 1618,
    kwhUsage: 78,
    ratePerKwh: 1650,
    totalBill: 128700,
    token: "",
    status: "Belum Bayar",
    paidAt: null,
    recordedBy: "Operator Taman"
  }
];

// Historical electricity records
const HISTORY_ELEC_BILLS = [
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
    token: "8821-4401-9923-1120-7734",
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
    token: "6640-1192-3304-8851-2290",
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
    token: "4410-9923-7712-0056-8819",
    status: "Lunas",
    paidAt: "2026-07-02 08:45",
    recordedBy: "Operator Taman"
  }
];

// Dynamically generate October 2026 bills for all other active tenants
const REMAINING_OCTOBER_ELEC = INITIAL_TENANTS
  .filter((t) => t.status === "Aktif" && !SPECIFIC_ELEC_BILLS.some((sp) => sp.roomNumber === t.roomNumber))
  .map((t, idx) => {
    const baseStart = 1000 + (parseInt(t.roomNumber) || 100) * 3;
    const baseEnd = baseStart + 70 + (idx % 25);
    const usage = baseEnd - baseStart;
    return {
      id: `elec-okt26-${t.roomNumber}`,
      tenantId: t.id,
      tenantName: t.name,
      tenantPhone: t.phone,
      roomNumber: t.roomNumber,
      month: "Oktober 2026",
      meterStart: baseStart,
      meterEnd: baseEnd,
      kwhUsage: usage,
      ratePerKwh: 1650,
      totalBill: usage * 1650,
      token: "", // Kolom token siap diisi oleh petugas
      status: "Belum Bayar",
      paidAt: null,
      recordedBy: "Petugas Gladiola"
    };
  });

export const INITIAL_ELECTRICITY_BILLS = deduplicateElectricityBills([
  ...SPECIFIC_ELEC_BILLS,
  ...REMAINING_OCTOBER_ELEC,
  ...HISTORY_ELEC_BILLS
]);

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
  // Super Admin (Amalia)
  {
    id: "log-adm-1",
    userId: "acc-1",
    user: "Amalia (Super Admin)",
    role: "super_admin",
    action: "Pembaruan Master Data Penyewa",
    pageAccessed: "Data Penyewa Kos",
    details: "Memperbarui nama & rincian sewa kamar 102 dan kamar 205",
    timestamp: "2026-10-13 00:15:42",
    time: "00:15:42 WIB",
    coords: { lat: -7.9583900, lng: 112.6059550 },
    locationName: "Ruang Manajemen Gladiola Guest House, Lt. 1",
    distanceMeters: 8,
    distanceText: "8 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Lenovo ThinkPad X1 Carbon Gen 11 (Windows 11 Pro)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-adm-2",
    userId: "acc-1",
    user: "Amalia (Super Admin)",
    role: "super_admin",
    action: "Sinkronisasi Realtime Cloud Database",
    pageAccessed: "Pengaturan Sistem & Database",
    details: "Verifikasi integrasi Neon PostgreSQL Cloud Database berhasil (Ping: 100%)",
    timestamp: "2026-10-12 23:45:10",
    time: "23:45:10 WIB",
    coords: { lat: -7.9583950, lng: 112.6059580 },
    locationName: "Ruang Manajemen Gladiola Guest House",
    distanceMeters: 7,
    distanceText: "7 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Lenovo ThinkPad X1 Carbon Gen 11 (Windows 11 Pro)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-adm-3",
    userId: "acc-1",
    user: "Amalia (Super Admin)",
    role: "super_admin",
    action: "Audit Monitoring User & Sesi Aktif",
    pageAccessed: "Monitoring User & Riwayat Akses",
    details: "Memeriksa daftar pengguna aktif dan verifikasi jarak radius GPS penghuni",
    timestamp: "2026-10-12 22:30:15",
    time: "22:30:15 WIB",
    coords: { lat: -7.9584011, lng: 112.6059591 },
    locationName: "Gladiola Guest House, Jl. Gladiol No. 1 Malang",
    distanceMeters: 5,
    distanceText: "5 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Lenovo ThinkPad X1 Carbon Gen 11 (Windows 11 Pro)",
    ipAddress: "103.145.22.84"
  },

  // Andre (Pengelola / Operator)
  {
    id: "log-op-1",
    userId: "acc-2",
    user: "Andre (Pengelola Kos)",
    role: "operator",
    action: "Validasi Pembayaran Sewa Kamar 102",
    pageAccessed: "Validasi Pembayaran Sewa",
    details: "Validasi transfer BCA Rp 1.750.000 atas nama Rizky Ramadhan (Lunas)",
    timestamp: "2026-10-13 00:05:18",
    time: "00:05:18 WIB",
    coords: { lat: -7.9584100, lng: 112.6059650 },
    locationName: "Lobby Gladiola Guest House • Pos Jaga Depan",
    distanceMeters: 14,
    distanceText: "14 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Samsung Galaxy S24 Ultra 5G (Android 14)",
    ipAddress: "114.125.43.190"
  },
  {
    id: "log-op-2",
    userId: "acc-2",
    user: "Andre (Pengelola Kos)",
    role: "operator",
    action: "Pencatatan Meteran Listrik Kamar 205",
    pageAccessed: "Pencatatan Listrik & Token",
    details: "Pencatatan pemakaian 105 kWh meteran listrik kamar 205",
    timestamp: "2026-10-12 21:15:30",
    time: "21:15:30 WIB",
    coords: { lat: -7.9584050, lng: 112.6059620 },
    locationName: "Lantai 2 Koridor Barat Gladiola Kos",
    distanceMeters: 18,
    distanceText: "18 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Samsung Galaxy S24 Ultra 5G (Android 14)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-op-3",
    userId: "acc-2",
    user: "Andre (Pengelola Kos)",
    role: "operator",
    action: "Pembaruan Status Kamar 201",
    pageAccessed: "Katalog & Status Kamar",
    details: "Mengubah status kamar 201 menjadi 'Tersedia' setelah inspeksi checkout",
    timestamp: "2026-10-12 17:40:05",
    time: "17:40:05 WIB",
    coords: { lat: -7.9584200, lng: 112.6059750 },
    locationName: "Lantai 2 Koridor Timur Gladiola Guest House",
    distanceMeters: 22,
    distanceText: "22 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Samsung Galaxy S24 Ultra 5G (Android 14)",
    ipAddress: "103.145.22.84"
  },

  // Rizky Ramadhan (Kamar 102)
  {
    id: "log-rz-1",
    userId: "t-1",
    user: "Rizky Ramadhan",
    role: "anak_kos",
    action: "Cek Sisa kWh Meteran Listrik Kamar 102",
    pageAccessed: "Tagihan & Token Listrik",
    details: "Melihat meteran awal 1306 kWh, sisa pulsa listrik mencukupi",
    timestamp: "2026-10-12 23:40:12",
    time: "23:40:12 WIB",
    coords: { lat: -7.9584210, lng: 112.6059720 },
    locationName: "Kamar 102 (Deluxe Taman), Gladiola Kos",
    distanceMeters: 5,
    distanceText: "5 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Apple iPhone 15 Pro Max (iOS 18)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-rz-2",
    userId: "t-1",
    user: "Rizky Ramadhan",
    role: "anak_kos",
    action: "Memberikan Rating & Ulasan Staf",
    pageAccessed: "Kelola Staf & Ulasan Petugas",
    details: "Memberikan Bintang 5 untuk Pak Bambang: 'Kamar mandi dan koridor selalu wangi!'",
    timestamp: "2026-10-12 20:12:05",
    time: "20:12:05 WIB",
    coords: { lat: -7.9584210, lng: 112.6059720 },
    locationName: "Kamar 102, Gladiola Kos",
    distanceMeters: 5,
    distanceText: "5 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Apple iPhone 15 Pro Max (iOS 18)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-rz-3",
    userId: "t-1",
    user: "Rizky Ramadhan",
    role: "anak_kos",
    action: "Unggah Bukti Pembayaran Sewa Kamar",
    pageAccessed: "Validasi Pembayaran Sewa",
    details: "Unggah bukti transfer m-Banking BCA Rp 1.750.000 untuk perpanjangan bulan Oktober",
    timestamp: "2026-10-11 19:15:20",
    time: "19:15:20 WIB",
    coords: { lat: -7.9584210, lng: 112.6059720 },
    locationName: "Kamar 102, Gladiola Kos",
    distanceMeters: 5,
    distanceText: "5 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Apple iPhone 15 Pro Max (iOS 18)",
    ipAddress: "103.145.22.84"
  },

  // Nabila Putri (Kamar 205)
  {
    id: "log-nb-1",
    userId: "t-2",
    user: "Nabila Putri",
    role: "anak_kos",
    action: "Akses Portal Anak Kos dari Luar",
    pageAccessed: "Informasi Kos & Kamar",
    details: "Mengecek informasi nomor darurat dan password WiFi Gladiola Guest House",
    timestamp: "2026-10-12 22:50:33",
    time: "22:50:33 WIB",
    coords: { lat: -7.9528000, lng: 112.6142000 },
    locationName: "Jl. Veteran (Area Kampus UB), Malang",
    distanceMeters: 1100,
    distanceText: "1.1 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Apple MacBook Air 13-inch (M2, macOS 15)",
    ipAddress: "182.253.110.45"
  },
  {
    id: "log-nb-2",
    userId: "t-2",
    user: "Nabila Putri",
    role: "anak_kos",
    action: "Cek Tagihan Listrik Kamar 205",
    pageAccessed: "Tagihan & Token Listrik",
    details: "Melihat rincian kWh listrik bulan berjalan (105 kWh)",
    timestamp: "2026-10-12 18:20:10",
    time: "18:20:10 WIB",
    coords: { lat: -7.9515000, lng: 112.6138000 },
    locationName: "Perpustakaan Pusat UB, Malang",
    distanceMeters: 1250,
    distanceText: "1.25 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Apple MacBook Air 13-inch (M2, macOS 15)",
    ipAddress: "182.253.110.45"
  },
  {
    id: "log-nb-3",
    userId: "t-2",
    user: "Nabila Putri",
    role: "anak_kos",
    action: "Login Sesi Kamar 205",
    pageAccessed: "Portal Utama Anak Kos",
    details: "Verifikasi GPS di dalam kamar kos lantai 2",
    timestamp: "2026-10-11 21:05:44",
    time: "21:05:44 WIB",
    coords: { lat: -7.9584100, lng: 112.6059680 },
    locationName: "Kamar 205 (Lt. 2), Gladiola Kos",
    distanceMeters: 16,
    distanceText: "16 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Apple MacBook Air 13-inch (M2, macOS 15)",
    ipAddress: "103.145.22.84"
  },

  // Owner Kos (Bpk. Pemilik)
  {
    id: "log-ow-1",
    userId: "acc-3",
    user: "Bpk. Pemilik (Owner Kos)",
    role: "owner",
    action: "Monitoring Laporan Okupansi & Keuangan",
    pageAccessed: "Laporan Keuangan & Okupansi",
    details: "Melihat grafik penerimaan sewa kamar bulan Oktober 2026 (96% Okupansi)",
    timestamp: "2026-10-12 21:10:50",
    time: "21:10:50 WIB",
    coords: { lat: -7.9625000, lng: 112.6289000 },
    locationName: "Klojen, Kota Malang (Kediaman Pemilik)",
    distanceMeters: 2600,
    distanceText: "2.6 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Apple iPad Pro 11-inch (M4, iPadOS 17)",
    ipAddress: "36.85.12.77"
  },
  {
    id: "log-ow-2",
    userId: "acc-3",
    user: "Bpk. Pemilik (Owner Kos)",
    role: "owner",
    action: "Cek Arus Kas Pembayaran Sewa",
    pageAccessed: "Validasi Pembayaran Sewa",
    details: "Memeriksa riwayat penerimaan uang sewa dan status transfer penghuni",
    timestamp: "2026-10-11 15:35:10",
    time: "15:35:10 WIB",
    coords: { lat: -7.9625000, lng: 112.6289000 },
    locationName: "Klojen, Kota Malang (Kediaman Pemilik)",
    distanceMeters: 2600,
    distanceText: "2.6 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Apple iPad Pro 11-inch (M4, iPadOS 17)",
    ipAddress: "36.85.12.77"
  },

  // Dimas Setiawan (Kamar 105 - Riwayat)
  {
    id: "log-dm-1",
    userId: "t-5",
    user: "Dimas Setiawan",
    role: "anak_kos",
    action: "Kirim Pengaduan Fasilitas AC",
    pageAccessed: "Pengaduan & Komplain Fasilitas",
    details: "Kirim tiket perbaikan AC kamar 105 kurang dingin saat siang hari",
    timestamp: "2026-10-12 21:45:12",
    time: "21:45:12 WIB",
    coords: { lat: -7.9584300, lng: 112.6059800 },
    locationName: "Kamar 105, Gladiola Kos",
    distanceMeters: 12,
    distanceText: "12 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Xiaomi 13 Pro 5G (Android 14)",
    ipAddress: "103.145.22.84"
  },
  {
    id: "log-dm-2",
    userId: "t-5",
    user: "Dimas Setiawan",
    role: "anak_kos",
    action: "Cek Tagihan Sewa Kamar 105",
    pageAccessed: "Validasi Pembayaran Sewa",
    details: "Melihat status lunas sewa kamar 105 bulan Oktober",
    timestamp: "2026-10-12 21:10:00",
    time: "21:10:00 WIB",
    coords: { lat: -7.9584300, lng: 112.6059800 },
    locationName: "Kamar 105, Gladiola Kos",
    distanceMeters: 12,
    distanceText: "12 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "Xiaomi 13 Pro 5G (Android 14)",
    ipAddress: "103.145.22.84"
  },

  // Siti Nurhaliza (Kamar 201 - Riwayat)
  {
    id: "log-st-1",
    userId: "t-6",
    user: "Siti Nurhaliza",
    role: "anak_kos",
    action: "Cek Informasi Rekening Bank Kos",
    pageAccessed: "Pembayaran Sewa Kos",
    details: "Melihat no. rekening BCA Gladiola Guest House untuk transfer sewa",
    timestamp: "2026-10-12 19:30:15",
    time: "19:30:15 WIB",
    coords: { lat: -7.9774000, lng: 112.6375000 },
    locationName: "Stasiun Malang Kotabaru, Klojen",
    distanceMeters: 3200,
    distanceText: "3.2 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Samsung Galaxy A54 5G (Android 14)",
    ipAddress: "114.122.98.54"
  },

  // Fajar Prasetyo (Kamar 304 - Riwayat)
  {
    id: "log-fj-1",
    userId: "t-12",
    user: "Fajar Prasetyo",
    role: "anak_kos",
    action: "Memberikan Rating Petugas",
    pageAccessed: "Rating & Ulasan Petugas",
    details: "Bintang 5 untuk Pak Bambang: 'Cepat respon saat ada lampu koridor padam'",
    timestamp: "2026-10-12 17:10:44",
    time: "17:10:44 WIB",
    coords: { lat: -7.9452000, lng: 112.6105000 },
    locationName: "Jl. MT Haryono (Area Dinoyo), Malang",
    distanceMeters: 1450,
    distanceText: "1.45 km • Di Luar Kos",
    isInsideKos: false,
    deviceModel: "Laptop ASUS Zenbook 14 OLED (Windows 11)",
    ipAddress: "180.252.17.65"
  },

  // Pak Bambang (Petugas - Riwayat)
  {
    id: "log-bb-1",
    userId: "st-1",
    user: "Pak Bambang (Petugas Kebersihan)",
    role: "staff",
    action: "Konfirmasi Tugas Lapangan",
    pageAccessed: "Jadwal & Tugas Staf",
    details: "Pembersihan area koridor lt. 2, tangga, dan taman belakang selesai",
    timestamp: "2026-10-12 14:45:00",
    time: "14:45:00 WIB",
    coords: { lat: -7.9583800, lng: 112.6059400 },
    locationName: "Area Koridor & Taman Gladiola Guest House",
    distanceMeters: 11,
    distanceText: "11 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "OPPO Reno 10 5G (Android 13)",
    ipAddress: "103.145.22.84"
  },

  // Dewi Lestari (Kasir - Riwayat)
  {
    id: "log-dw-1",
    userId: "op-2",
    user: "Dewi Lestari (Staf Kasir)",
    role: "operator",
    action: "Rekap Penerimaan Sewa",
    pageAccessed: "Laporan Penerimaan Keuangan",
    details: "Mencetak laporan bukti bayar sewa harian untuk arsip manajemen",
    timestamp: "2026-10-12 11:20:30",
    time: "11:20:30 WIB",
    coords: { lat: -7.9583950, lng: 112.6059520 },
    locationName: "Meja Administrasi Gladiola Guest House",
    distanceMeters: 7,
    distanceText: "7 meter • Di Dalam Kos",
    isInsideKos: true,
    deviceModel: "PC Desktop Dell OptiPlex 7090 (Windows 11)",
    ipAddress: "103.145.22.84"
  }
];
