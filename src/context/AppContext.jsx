import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GLADIOLA_COORDS,
  INITIAL_BANK_INFO,
  INITIAL_WIFI_INFO,
  INITIAL_STAFF,
  INITIAL_STAFF_RATINGS,
  INITIAL_TENANTS,
  INITIAL_ROOMS,
  INITIAL_RENT_PAYMENTS,
  INITIAL_ELECTRICITY_BILLS,
  INITIAL_OPERATORS,
  INITIAL_ACTIVITY_LOGS
} from '../data/initialData';

const AppContext = createContext(null);

// Calculate Haversine distance in KM
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export const AppProvider = ({ children }) => {
  // Persistence helpers
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`gladiola_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveState = (key, val) => {
    try {
      localStorage.setItem(`gladiola_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  // Roles: "super_admin" | "owner" | "operator" | "anak_kos"
  const [currentUser, setCurrentUser] = useState(() =>
    loadState('currentUser', {
      role: 'super_admin',
      name: 'Admin Taman (Super)',
      phone: '081234567899',
      roomNumber: null
    })
  );

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mandatory Geolocation State
  const [userLocation, setUserLocation] = useState(() =>
    loadState('userLocation', {
      lat: null,
      lng: null,
      accuracy: null,
      status: 'pending', // 'pending' | 'granted' | 'denied'
      address: 'Mencari lokasi...',
      distanceKm: null
    })
  );
  const [isLocationEnforcedModalOpen, setIsLocationEnforcedModalOpen] = useState(false);

  // App Data States
  const [tenants, setTenants] = useState(() => loadState('tenants', INITIAL_TENANTS));
  const [rooms, setRooms] = useState(() => loadState('rooms', INITIAL_ROOMS));
  const [payments, setPayments] = useState(() => loadState('payments', INITIAL_RENT_PAYMENTS));
  const [electricityBills, setElectricityBills] = useState(() => loadState('electricity', INITIAL_ELECTRICITY_BILLS));
  const [staffList, setStaffList] = useState(() => loadState('staff', INITIAL_STAFF));
  const [staffRatings, setStaffRatings] = useState(() => loadState('ratings', INITIAL_STAFF_RATINGS));
  const [bankInfo, setBankInfo] = useState(() => loadState('bankInfo', INITIAL_BANK_INFO));
  const [wifiInfo, setWifiInfo] = useState(() => loadState('wifiInfo', INITIAL_WIFI_INFO));
  const [operators, setOperators] = useState(() => loadState('operators', INITIAL_OPERATORS));
  const [activityLogs, setActivityLogs] = useState(() => loadState('logs', INITIAL_ACTIVITY_LOGS));
  const [notifications, setNotifications] = useState([]);

  // Save changes to localStorage
  useEffect(() => saveState('currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('userLocation', userLocation), [userLocation]);
  useEffect(() => saveState('tenants', tenants), [tenants]);
  useEffect(() => saveState('rooms', rooms), [rooms]);
  useEffect(() => saveState('payments', payments), [payments]);
  useEffect(() => saveState('electricity', electricityBills), [electricityBills]);
  useEffect(() => saveState('staff', staffList), [staffList]);
  useEffect(() => saveState('ratings', staffRatings), [staffRatings]);
  useEffect(() => saveState('bankInfo', bankInfo), [bankInfo]);
  useEffect(() => saveState('wifiInfo', wifiInfo), [wifiInfo]);
  useEffect(() => saveState('operators', operators), [operators]);
  useEffect(() => saveState('logs', activityLogs), [activityLogs]);

  // Toast notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Activity Logger
  const logActivity = (action, details, customUser = null) => {
    const userToLog = customUser || currentUser;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp,
      user: userToLog.name,
      role: userToLog.role,
      action,
      details,
      coords: {
        lat: userLocation.lat || GLADIOLA_COORDS.lat,
        lng: userLocation.lng || GLADIOLA_COORDS.lng
      },
      locationName: userLocation.address || 'Gladiola Guest House Area'
    };

    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Geolocation trigger
  const requestLocation = () => {
    if (!navigator.geolocation) {
      simulateLocationDefault('Browser tidak mendukung Geolocation, menggunakan koordinat area Gladiola.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const dist = calculateDistanceKm(latitude, longitude, GLADIOLA_COORDS.lat, GLADIOLA_COORDS.lng);
        const locState = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          status: 'granted',
          address: `GPS Aktif (Akurasi ±${Math.round(accuracy)}m) • Jarak ke Gladiol: ${dist} km`,
          distanceKm: dist
        };
        setUserLocation(locState);
        setIsLocationEnforcedModalOpen(false);
        addToast(`Akses lokasi terverifikasi! (${dist} km dari Gladiola Guest House)`, 'success');
        logActivity('Verifikasi Lokasi Berhasil', `Koordinat GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (${dist} km dari kos)`);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setUserLocation((prev) => ({
          ...prev,
          status: 'denied'
        }));
        setIsLocationEnforcedModalOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fallback simulator for users on desktop or when browser blocks permission
  const simulateLocationDefault = (note = "Simulasi Lokasi Gladiola Guest House") => {
    // Offset slightly for realism
    const lat = GLADIOLA_COORDS.lat + (Math.random() - 0.5) * 0.0005;
    const lng = GLADIOLA_COORDS.lng + (Math.random() - 0.5) * 0.0005;
    const dist = calculateDistanceKm(lat, lng, GLADIOLA_COORDS.lat, GLADIOLA_COORDS.lng);

    const locState = {
      lat,
      lng,
      accuracy: 8,
      status: 'granted',
      address: `Jl. Gladiol No. 1, Lowokwaru, Malang (${note})`,
      distanceKm: dist
    };
    setUserLocation(locState);
    setIsLocationEnforcedModalOpen(false);
    addToast('Lokasi Gladiola Guest House diaktifkan!', 'success');
    logActivity('Lokasi Diaktifkan', `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)} - ${note}`);
  };

  // Check location on initial mount
  useEffect(() => {
    if (userLocation.status !== 'granted') {
      setIsLocationEnforcedModalOpen(true);
      requestLocation();
    }
  }, []);

  // Quick switch role
  const switchRole = (newRole, tenantPhone = null) => {
    if (newRole === 'super_admin') {
      const user = { role: 'super_admin', name: 'Super Admin Gladiola', phone: '081122334455', roomNumber: null };
      setCurrentUser(user);
      setActiveTab('overview');
      logActivity('Beralih Role ke Super Admin', 'Akses penuh seluruh kontrol & log aktivitas', user);
      addToast('Masuk sebagai Super Admin Gladiola', 'info');
    } else if (newRole === 'owner') {
      const user = { role: 'owner', name: 'Owner Kos Gladiola', phone: '081233441122', roomNumber: null };
      setCurrentUser(user);
      setActiveTab('overview');
      logActivity('Beralih Role ke Owner', 'Melihat laporan dan keuangan (tanpa tambah/ubah anak kos)', user);
      addToast('Masuk sebagai Owner Kos', 'info');
    } else if (newRole === 'operator') {
      const user = { role: 'operator', name: 'Admin Taman (Operator)', phone: '081234998877', roomNumber: null };
      setCurrentUser(user);
      setActiveTab('overview');
      logActivity('Beralih Role ke Operator', 'Akses operasional penghuni, kasir, dan meteran', user);
      addToast('Masuk sebagai Pengelola / Operator', 'info');
    } else if (newRole === 'anak_kos') {
      const targetPhone = tenantPhone || '081233445566';
      const targetTenant = tenants.find((t) => t.phone === targetPhone) || tenants[0];
      const user = {
        role: 'anak_kos',
        name: targetTenant.name,
        phone: targetTenant.phone,
        roomNumber: targetTenant.roomNumber,
        tenantId: targetTenant.id
      };
      setCurrentUser(user);
      setActiveTab('anak_kos');
      logActivity('Anak Kos Login (No HP)', `Login no HP ${targetTenant.phone} kamar ${targetTenant.roomNumber}`, user);
      addToast(`Selamat datang, ${targetTenant.name}!`, 'success');
    }
    setIsMobileMenuOpen(false);
  };

  // Login anak kos by phone
  const loginByPhone = (phoneInput) => {
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    const found = tenants.find(
      (t) => t.phone.replace(/[^0-9]/g, '') === cleanPhone || t.phone.includes(cleanPhone)
    );
    if (found) {
      switchRole('anak_kos', found.phone);
      return { success: true, tenant: found };
    }
    return { success: false, message: 'Nomor HP tidak terdaftar sebagai anak kos aktif di Gladiola.' };
  };

  // Actions
  const handleValidatePayment = (paymentId, newStatus) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: newStatus,
            validatedBy: currentUser.name,
            validatedAt: new Date().toLocaleString('id-ID')
          };
        }
        return p;
      })
    );
    const target = payments.find((p) => p.id === paymentId);
    logActivity(
      `Validasi Pembayaran: ${newStatus}`,
      `Pembayaran ID ${paymentId} (${target ? target.tenantName : ''}) diubah menjadi ${newStatus}`
    );
    addToast(`Status pembayaran berhasil diubah menjadi ${newStatus}`, 'success');
  };

  const handleAddStaffRating = (staffId, rating, comment) => {
    if (!comment || comment.trim().length < 5) {
      addToast('Wajib mengisi kalimat ulasan minimal 5 karakter!', 'error');
      return false;
    }

    const staffMember = staffList.find((s) => s.id === staffId);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRating = {
      id: `rev-${Date.now()}`,
      tenantId: currentUser.tenantId || 't-1',
      tenantName: currentUser.name,
      tenantPhone: currentUser.phone,
      room: `Kamar ${currentUser.roomNumber || '102'}`,
      staffId,
      staffName: staffMember ? staffMember.name : 'Petugas',
      rating,
      comment: comment.trim(),
      date: dateStr,
      verifiedPaymentMonth: 'Oktober 2026'
    };

    setStaffRatings((prev) => [newRating, ...prev]);

    // Recalculate average rating
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const currentTotal = s.totalReviews || 1;
          const newAvg = ((s.avgRating * currentTotal + rating) / (currentTotal + 1)).toFixed(1);
          return { ...s, avgRating: parseFloat(newAvg), totalReviews: currentTotal + 1 };
        }
        return s;
      })
    );

    logActivity('Memberikan Rating Petugas', `${currentUser.name} memberi bintang ${rating} & ulasan untuk ${staffMember ? staffMember.name : 'Petugas'}`);
    addToast(`Terima kasih! Rating & ulasan untuk ${staffMember ? staffMember.name : 'Petugas'} berhasil dikirim.`, 'success');
    return true;
  };

  // Add / Edit Tenant
  const handleSaveTenant = (tenantData) => {
    if (currentUser.role === 'owner') {
      addToast('Owner tidak diizinkan menambah atau mengubah data anak kos!', 'error');
      return;
    }

    if (tenantData.id) {
      // Edit
      setTenants((prev) => prev.map((t) => (t.id === tenantData.id ? { ...t, ...tenantData } : t)));
      logActivity('Ubah Data Anak Kos', `Memperbarui data anak kos: ${tenantData.name} (Kamar ${tenantData.roomNumber})`);
      addToast(`Data ${tenantData.name} berhasil diperbarui`, 'success');
    } else {
      // Add
      const newTenant = {
        ...tenantData,
        id: `t-${Date.now()}`,
        status: 'Aktif'
      };
      setTenants((prev) => [...prev, newTenant]);
      // Update room status
      setRooms((prev) =>
        prev.map((r) =>
          r.number === newTenant.roomNumber
            ? { ...r, status: 'Terisi', currentTenant: newTenant.name }
            : r
        )
      );
      logActivity('Tambah Anak Kos Baru', `Menambahkan penghuni baru: ${newTenant.name} (Kamar ${newTenant.roomNumber})`);
      addToast(`Anak kos baru ${newTenant.name} berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteTenant = (tenantId) => {
    if (currentUser.role === 'owner') {
      addToast('Owner tidak diizinkan mengubah/menghapus data anak kos!', 'error');
      return;
    }
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    if (!tenantToDelete) return;

    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    // Set room to Kosong
    setRooms((prev) =>
      prev.map((r) =>
        r.number === tenantToDelete.roomNumber
          ? { ...r, status: 'Kosong', currentTenant: null }
          : r
      )
    );
    logActivity('Hapus Anak Kos', `Menghapus anak kos ${tenantToDelete.name} dari kamar ${tenantToDelete.roomNumber}`);
    addToast(`Data penghuni ${tenantToDelete.name} telah dihapus`, 'info');
  };

  // Electricity record save
  const handleSaveElectricityBill = (billData) => {
    if (billData.id) {
      setElectricityBills((prev) => prev.map((b) => (b.id === billData.id ? { ...b, ...billData } : b)));
      logActivity('Ubah Tagihan Listrik', `Update tagihan kamar ${billData.roomNumber} (${billData.kwhUsage} kWh)`);
      addToast('Tagihan listrik berhasil diperbarui', 'success');
    } else {
      const newBill = {
        ...billData,
        id: `elec-${Date.now()}`,
        recordedBy: currentUser.name
      };
      setElectricityBills((prev) => [newBill, ...prev]);
      logActivity('Input Meteran Listrik', `Pencatatan meter listrik kamar ${newBill.roomNumber}: ${newBill.kwhUsage} kWh (Rp ${newBill.totalBill.toLocaleString('id-ID')})`);
      addToast(`Tagihan listrik kamar ${newBill.roomNumber} berhasil disimpan`, 'success');
    }
  };

  // Staff CRUD
  const handleSaveStaff = (staffData) => {
    if (staffData.id) {
      setStaffList((prev) => prev.map((s) => (s.id === staffData.id ? { ...s, ...staffData } : s)));
      logActivity('Ubah Data Petugas', `Memperbarui profil petugas: ${staffData.name}`);
      addToast(`Profil ${staffData.name} berhasil diperbarui`, 'success');
    } else {
      const newStaff = {
        ...staffData,
        id: `stf-${Date.now()}`,
        avgRating: 5.0,
        totalReviews: 0,
        status: 'Aktif'
      };
      setStaffList((prev) => [...prev, newStaff]);
      logActivity('Tambah Petugas Baru', `Menambahkan petugas baru: ${newStaff.name} (${newStaff.role})`);
      addToast(`Petugas ${newStaff.name} berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteStaff = (staffId) => {
    const staff = staffList.find((s) => s.id === staffId);
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    logActivity('Hapus Petugas', `Menghapus petugas: ${staff ? staff.name : staffId}`);
    addToast('Data petugas berhasil dihapus', 'info');
  };

  // Operators CRUD (Super Admin only)
  const handleSaveOperator = (opData) => {
    if (currentUser.role !== 'super_admin') {
      addToast('Hanya Super Admin yang dapat mengelola akun Operator!', 'error');
      return;
    }
    if (opData.id) {
      setOperators((prev) => prev.map((o) => (o.id === opData.id ? { ...o, ...opData } : o)));
      logActivity('Ubah Akun Operator', `Memperbarui akun operator: ${opData.username}`);
      addToast(`Akun operator ${opData.username} diperbarui`, 'success');
    } else {
      const newOp = {
        ...opData,
        id: `op-${Date.now()}`,
        role: 'operator',
        status: 'Aktif',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOperators((prev) => [...prev, newOp]);
      logActivity('Tambah Akun Operator Baru', `Membuat akun operator: ${newOp.username} (${newOp.fullName})`);
      addToast(`Akun operator ${newOp.username} berhasil dibuat`, 'success');
    }
  };

  const handleDeleteOperator = (opId) => {
    if (currentUser.role !== 'super_admin') {
      addToast('Hanya Super Admin yang dapat menghapus operator!', 'error');
      return;
    }
    const target = operators.find((o) => o.id === opId);
    setOperators((prev) => prev.filter((o) => o.id !== opId));
    logActivity('Hapus Akun Operator', `Menghapus akun operator: ${target ? target.username : opId}`);
    addToast('Akun operator berhasil dihapus', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        userLocation,
        isLocationEnforcedModalOpen,
        setIsLocationEnforcedModalOpen,
        requestLocation,
        simulateLocationDefault,
        tenants,
        rooms,
        payments,
        electricityBills,
        staffList,
        staffRatings,
        bankInfo,
        setBankInfo,
        wifiInfo,
        setWifiInfo,
        operators,
        activityLogs,
        notifications,
        addToast,
        logActivity,
        switchRole,
        loginByPhone,
        handleValidatePayment,
        handleAddStaffRating,
        handleSaveTenant,
        handleDeleteTenant,
        handleSaveElectricityBill,
        handleSaveStaff,
        handleDeleteStaff,
        handleSaveOperator,
        handleDeleteOperator
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
