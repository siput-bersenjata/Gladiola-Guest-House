import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SYSTEM_ACCOUNTS,
  INITIAL_ACTIVE_SESSIONS,
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
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  subscribeToFirebase,
  pushDataToFirebase,
  fetchOnceFromFirebase,
  testFirebaseConnection
} from '../services/firebaseSync';

const AppContext = createContext(null);

// Extract live device telemetry from client browser
export const getLiveDeviceTelemetry = () => {
  if (typeof window === 'undefined') return {};
  const ua = navigator.userAgent || '';
  let deviceType = 'Desktop / PC';
  if (/mobile|android|iphone/i.test(ua)) {
    deviceType = /tablet|ipad/i.test(ua) ? 'Tablet' : 'Smartphone (Mobile)';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'Tablet';
  }

  let os = 'Windows 11 / 10';
  if (/windows/i.test(ua)) os = 'Windows PC (x64)';
  else if (/android/i.test(ua)) os = 'Android Mobile';
  else if (/iphone/i.test(ua)) os = 'Apple iOS (iPhone)';
  else if (/ipad/i.test(ua)) os = 'Apple iPadOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'Apple macOS';
  else if (/linux/i.test(ua)) os = 'Linux OS';

  let browser = 'Google Chrome';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera Browser';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';

  const dpr = window.devicePixelRatio ? window.devicePixelRatio.toFixed(2) : '1.0';
  const screenRes = `${window.screen?.width || 1920} × ${window.screen?.height || 1080} (${dpr}x DPR)`;
  const viewport = `${window.innerWidth} × ${window.innerHeight}`;
  const orientation = window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait';

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const networkType = conn
    ? (conn.effectiveType ? `${conn.effectiveType.toUpperCase()} Internet` : 'WiFi Gladiol 5G')
    : 'WiFi Gladiol_Guest_House_5G';

  return {
    model: `${deviceType} (${os})`,
    type: deviceType,
    os,
    browser,
    screenRes,
    viewport,
    orientation,
    ipAddress: '103.145.22.84',
    isp: 'Gladiola Dedicated Fiber Malang',
    networkType,
    userAgent: ua,
    cpuCores: navigator.hardwareConcurrency || 8,
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '8 GB'
  };
};

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

  // User Authentication State: null means not logged in (mandatory login)
  // Supports 30-day Remember Me verification
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = loadState('currentUser', null);
    if (!saved) return null;
    if (saved.expiresAt && Date.now() > saved.expiresAt) {
      // 30 days expired
      localStorage.removeItem('gladiola_currentUser');
      return null;
    }
    return saved;
  });

  const [systemAccounts, setSystemAccounts] = useState(() =>
    loadState('systemAccounts', SYSTEM_ACCOUNTS)
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

  // Default Cloud Storage Bin ID (Clean seeded bin 'afebcbe')
  const DEFAULT_CLOUD_BIN = 'afebcbe';
  const [cloudBinId, setCloudBinId] = useState(() => {
    const saved = loadState('cloudBinId', DEFAULT_CLOUD_BIN);
    // Migrate corrupted legacy bin automatically
    return saved === 'dcceadc' || !saved ? DEFAULT_CLOUD_BIN : saved;
  });

  // Google Firebase Realtime Database configuration
  const [firebaseConfig, setFirebaseConfig] = useState(() => getStoredFirebaseConfig());
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  const [cloudSyncStatus, setCloudSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline'
  const [lastSyncedTime, setLastSyncedTime] = useState(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Guard refs to prevent circular sync loops
  const isApplyingRemoteRef = useRef(false);
  const lastUploadedTimestampRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const debounceTimerRef = useRef(null);

  // App Data States - smart fallback ensures full 48 tenants on fresh/old installs
  const [tenants, setTenants] = useState(() => {
    const saved = loadState('tenants', null);
    if (!saved || !Array.isArray(saved) || saved.length < 10) {
      return INITIAL_TENANTS;
    }
    return saved;
  });
  const [rooms, setRooms] = useState(() => {
    const saved = loadState('rooms', INITIAL_ROOMS);
    if (!saved || !Array.isArray(saved) || saved.length === 0) return INITIAL_ROOMS;
    return saved.map((r, idx) => {
      if (r.electricityToken) return r;
      const initialMatch = INITIAL_ROOMS.find((ir) => ir.number === r.number) || INITIAL_ROOMS[idx];
      return {
        ...r,
        electricityToken: initialMatch?.electricityToken || `3819-2041-${String(8800 + (idx + 1) * 3).padStart(4, "0")}-9014-${String(5520 + (idx + 1)).padStart(4, "0")}`,
        meterId: r.meterId || initialMatch?.meterId || `PLN-14${String(28000000 + (idx + 1) * 137).slice(-8)}`
      };
    });
  });
  const [payments, setPayments] = useState(() => {
    const saved = loadState('payments', null);
    if (!saved || !Array.isArray(saved) || saved.length < 10) {
      return INITIAL_RENT_PAYMENTS;
    }
    return saved;
  });
  const [electricityBills, setElectricityBills] = useState(() => {
    const saved = loadState('electricity', null);
    if (!saved || !Array.isArray(saved) || saved.length < 10) {
      return INITIAL_ELECTRICITY_BILLS;
    }
    return saved;
  });
  const [staffList, setStaffList] = useState(() => loadState('staff', INITIAL_STAFF));
  const [staffRatings, setStaffRatings] = useState(() => loadState('ratings', INITIAL_STAFF_RATINGS));
  const [bankInfo, setBankInfo] = useState(() => loadState('bankInfo', INITIAL_BANK_INFO));
  const [wifiInfo, setWifiInfo] = useState(() => loadState('wifiInfo', INITIAL_WIFI_INFO));
  const [operators, setOperators] = useState(() => loadState('operators', INITIAL_OPERATORS));
  const [activityLogs, setActivityLogs] = useState(() => loadState('logs', INITIAL_ACTIVITY_LOGS));
  const [activeSessions, setActiveSessions] = useState(() =>
    loadState('activeSessions', INITIAL_ACTIVE_SESSIONS)
  );
  const [notifications, setNotifications] = useState([]);

  // Save changes to localStorage
  useEffect(() => saveState('currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('systemAccounts', systemAccounts), [systemAccounts]);
  useEffect(() => saveState('userLocation', userLocation), [userLocation]);
  useEffect(() => saveState('activeSessions', activeSessions), [activeSessions]);
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
  useEffect(() => saveState('cloudBinId', cloudBinId), [cloudBinId]);

  // Apply remote payload cleanly across all local states
  const applyRemoteData = (cloudData) => {
    if (!cloudData || !Array.isArray(cloudData.tenants) || cloudData.tenants.length === 0) return;
    const remoteTime = cloudData.updatedAt || 0;
    if (remoteTime > lastUploadedTimestampRef.current) {
      isApplyingRemoteRef.current = true;
      setTenants(cloudData.tenants);
      if (Array.isArray(cloudData.rooms)) setRooms(cloudData.rooms);
      if (Array.isArray(cloudData.payments)) setPayments(cloudData.payments);
      if (Array.isArray(cloudData.electricityBills)) setElectricityBills(cloudData.electricityBills);
      if (Array.isArray(cloudData.staffList)) setStaffList(cloudData.staffList);
      if (Array.isArray(cloudData.staffRatings)) setStaffRatings(cloudData.staffRatings);
      if (cloudData.bankInfo) setBankInfo(cloudData.bankInfo);
      if (cloudData.wifiInfo) setWifiInfo(cloudData.wifiInfo);
      if (Array.isArray(cloudData.operators)) setOperators(cloudData.operators);
      if (Array.isArray(cloudData.systemAccounts)) setSystemAccounts(cloudData.systemAccounts);
      if (Array.isArray(cloudData.activityLogs)) setActivityLogs(cloudData.activityLogs);
      lastUploadedTimestampRef.current = remoteTime;
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 300);
      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    }
  };

  // =========================================================================
  // MULTI-DEVICE CLOUD SYNC ENGINE (GOOGLE FIREBASE + REALTIME FALLBACK)
  // =========================================================================
  const fetchCloudData = async (silent = false) => {
    try {
      if (!silent) setIsCloudSyncing(true);
      let cloudData = null;

      // 1. Try Firebase Realtime Database first if configured
      if (firebaseConfig?.databaseURL) {
        cloudData = await fetchOnceFromFirebase(firebaseConfig);
        if (cloudData && Array.isArray(cloudData.tenants)) {
          setFirebaseConnected(true);
        }
      }

      // 2. Fallback to clean cloud bin if Firebase is not yet configured or returned null
      if (!cloudData || !Array.isArray(cloudData.tenants)) {
        try {
          const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${cloudBinId}?t=${Date.now()}`);
          if (res.ok) {
            cloudData = await res.json();
          }
        } catch (binErr) {
          console.warn('Fallback bin fetch error:', binErr);
        }
      }

      if (cloudData && Array.isArray(cloudData.tenants) && cloudData.tenants.length > 0) {
        applyRemoteData(cloudData);
        setCloudSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Sync cloud fetch warning:', err);
      setCloudSyncStatus('offline');
    } finally {
      if (!silent) setIsCloudSyncing(false);
    }
  };

  const pushToCloud = async (overrideData = null) => {
    if (isApplyingRemoteRef.current) return;
    try {
      setIsCloudSyncing(true);
      setCloudSyncStatus('syncing');
      const now = Date.now();
      lastUploadedTimestampRef.current = now;

      const payload = {
        updatedAt: now,
        source: 'client_push',
        tenants: overrideData?.tenants || tenants,
        rooms: overrideData?.rooms || rooms,
        payments: overrideData?.payments || payments,
        electricityBills: overrideData?.electricityBills || electricityBills,
        staffList: overrideData?.staffList || staffList,
        staffRatings: overrideData?.staffRatings || staffRatings,
        bankInfo: overrideData?.bankInfo || bankInfo,
        wifiInfo: overrideData?.wifiInfo || wifiInfo,
        operators: overrideData?.operators || operators,
        systemAccounts: overrideData?.systemAccounts || systemAccounts,
        activityLogs: overrideData?.activityLogs || activityLogs
      };

      // 1. Push to Firebase Realtime Database (Sub-second broadcast to all devices!)
      let firebaseSuccess = false;
      if (firebaseConfig?.databaseURL) {
        firebaseSuccess = await pushDataToFirebase(firebaseConfig, payload);
        if (firebaseSuccess) setFirebaseConnected(true);
      }

      // 2. Push to fallback cloud bin as redundant safe backup
      try {
        await fetch(`https://extendsclass.com/api/json-storage/bin/${cloudBinId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (binErr) {
        console.warn('Backup bin push warning:', binErr);
      }

      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    } catch (err) {
      console.warn('Sync cloud push warning:', err);
      setCloudSyncStatus('offline');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const syncWithCloud = async () => {
    addToast('Menghubungi server cloud database...', 'info');
    await fetchCloudData(false);
    addToast('Sinkronisasi cloud multi-perangkat berhasil!', 'success');
  };

  const forcePushLocalToCloud = async () => {
    addToast('Mengunggah data lokal ke cloud...', 'info');
    await pushToCloud();
    addToast('Seluruh data lokal berhasil disimpan ke cloud!', 'success');
  };

  const handleUpdateFirebaseConfig = async (newConfig) => {
    saveStoredFirebaseConfig(newConfig);
    setFirebaseConfig(newConfig);
    if (newConfig?.databaseURL) {
      addToast('Mengecek dan menghubungkan ke Firebase...', 'info');
      const test = await testFirebaseConnection(newConfig);
      if (test.success) {
        setFirebaseConnected(true);
        addToast('Firebase Realtime Database tersambung! Menyinkronkan data...', 'success');
        // Push current local data to initialize Firebase
        await pushToCloud();
      } else {
        addToast(`Peringatan Firebase: ${test.message}`, 'warning');
      }
    } else {
      setFirebaseConnected(false);
      addToast('Firebase dinonaktifkan, menggunakan fallback cloud bin.', 'info');
    }
  };

  // Realtime WebSocket listener with Firebase
  useEffect(() => {
    if (!firebaseConfig?.databaseURL) {
      setFirebaseConnected(false);
      return;
    }

    const unsubscribe = subscribeToFirebase(firebaseConfig, (remoteData) => {
      if (remoteData) {
        setFirebaseConnected(true);
        applyRemoteData(remoteData);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [firebaseConfig]);

  // Push automatically on local state changes (debounced by 800ms)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fetchCloudData(true);
      return;
    }
    if (isApplyingRemoteRef.current) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      pushToCloud();
    }, 800);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [
    tenants,
    rooms,
    payments,
    electricityBills,
    staffList,
    staffRatings,
    bankInfo,
    wifiInfo,
    operators,
    systemAccounts,
    activityLogs
  ]);

  // Periodic polling sync (every 6s) & on tab focus
  useEffect(() => {
    const handleFocus = () => fetchCloudData(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCloudData(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    const pollInterval = setInterval(() => {
      fetchCloudData(true);
    }, 3500);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pollInterval);
    };
  }, [cloudBinId, firebaseConfig]);

  // Sync active sessions with current user & telemetry
  useEffect(() => {
    if (!currentUser) return;
    const telemetry = getLiveDeviceTelemetry();
    const currentDistKm = userLocation.distanceKm !== null ? userLocation.distanceKm : 0.01;
    const isInsideKos = currentDistKm <= 0.08;
    const distanceMeters = Math.round(currentDistKm * 1000);

    setActiveSessions((prevSessions) => {
      const existingIdx = prevSessions.findIndex(
        (s) => s.username === currentUser.username || (currentUser.phone && s.phone === currentUser.phone)
      );

      const userSession = {
        id: existingIdx >= 0 ? prevSessions[existingIdx].id : `sess-live-${Date.now()}`,
        userId: currentUser.id || currentUser.tenantId || `usr-${currentUser.role}`,
        username: currentUser.username || currentUser.phone,
        name: currentUser.name,
        role: currentUser.role,
        roleLabel:
          currentUser.role === 'super_admin'
            ? 'Super Admin'
            : currentUser.role === 'operator'
            ? 'Pengelola Kos'
            : currentUser.role === 'owner'
            ? 'Owner Properti'
            : `Penghuni (Kamar ${currentUser.roomNumber || '102'})`,
        room: currentUser.roomNumber ? `Kamar ${currentUser.roomNumber}` : null,
        phone: currentUser.phone,
        avatar:
          currentUser.avatar ||
          (currentUser.role === 'super_admin'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : currentUser.role === 'operator'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            : currentUser.role === 'owner'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
        status: 'Online',
        isCurrent: true,
        lastActive: 'Sedang Aktif Sekarang',
        loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        coords: {
          lat: userLocation.lat || GLADIOLA_COORDS.lat,
          lng: userLocation.lng || GLADIOLA_COORDS.lng,
          accuracy: userLocation.accuracy || 8
        },
        locationName: userLocation.address || 'Gladiola Guest House Area, Malang',
        distanceMeters,
        isInsideKos,
        device: telemetry
      };

      const others = prevSessions
        .filter((_, idx) => idx !== existingIdx)
        .map((s) => ({ ...s, isCurrent: false }));

      return [userSession, ...others];
    });
  }, [currentUser, userLocation.lat, userLocation.lng, userLocation.status]);

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

  // Login with Username & Password (Super Admin, Pengelola, Owner)
  const loginWithCredentials = (username, password, rememberMe = false) => {
    // 1. Mandatory Geolocation enforcement: strictly block login if not granted
    if (userLocation.status !== 'granted') {
      setIsLocationEnforcedModalOpen(true);
      return {
        success: false,
        message: 'Akses lokasi GPS wajib diaktifkan sebelum login! Silakan izinkan deteksi lokasi perangkat Anda.'
      };
    }

    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 2. Check system accounts from state
    const foundSystem = systemAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanUser && acc.password === cleanPass
    );

    if (foundSystem) {
      const expiresAt = rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
      const user = {
        id: foundSystem.id || `acc-${foundSystem.username}`,
        role: foundSystem.role,
        name: foundSystem.name,
        username: foundSystem.username,
        phone: foundSystem.phone,
        email: foundSystem.email,
        roomNumber: null,
        rememberMe: !!rememberMe,
        expiresAt
      };
      setCurrentUser(user);
      setActiveTab(foundSystem.role === 'super_admin' ? 'monitoring_lokasi' : 'overview');
      logActivity(
        'Login Berhasil (GPS Terverifikasi)',
        `User ${foundSystem.username} berhasil login sebagai ${foundSystem.role} (Remember Me: ${rememberMe ? '30 Hari' : 'Sesi'})`,
        user
      );
      addToast(`Selamat datang, ${foundSystem.name}!`, 'success');
      return { success: true, user };
    }

    // 3. Fallback check operators
    const foundOp = operators.find(
      (op) =>
        op.username.toLowerCase() === cleanUser &&
        (op.password ? op.password === cleanPass : cleanPass === 'andre123' || cleanPass === 'operator123')
    );

    if (foundOp) {
      const expiresAt = rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
      const user = {
        id: foundOp.id,
        role: 'operator',
        name: foundOp.fullName,
        username: foundOp.username,
        phone: foundOp.phone,
        email: foundOp.email,
        roomNumber: null,
        rememberMe: !!rememberMe,
        expiresAt
      };
      setCurrentUser(user);
      setActiveTab('overview');
      logActivity(
        'Login Operator Berhasil',
        `Operator ${foundOp.username} berhasil login ke sistem`,
        user
      );
      addToast(`Selamat datang, ${foundOp.fullName}!`, 'success');
      return { success: true, user };
    }

    return {
      success: false,
      message: 'Username atau kata sandi tidak valid. Silakan periksa kembali.'
    };
  };

  // Login anak kos by phone only
  const loginByPhone = (phoneInput, rememberMe = false) => {
    // 1. Mandatory Geolocation enforcement: strictly block login if not granted
    if (userLocation.status !== 'granted') {
      setIsLocationEnforcedModalOpen(true);
      return {
        success: false,
        message: 'Akses lokasi GPS wajib diaktifkan sebelum login! Silakan izinkan deteksi lokasi perangkat Anda.'
      };
    }

    if (!phoneInput || !phoneInput.trim()) {
      return { success: false, message: 'Nomor handphone wajib diisi.' };
    }
    const cleanInput = phoneInput.replace(/[^0-9]/g, '');
    const found = tenants.find((t) => {
      const tenantClean = t.phone.replace(/[^0-9]/g, '');
      return (
        tenantClean === cleanInput ||
        tenantClean.endsWith(cleanInput) ||
        cleanInput.endsWith(tenantClean)
      );
    });

    if (found) {
      const expiresAt = rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null;
      const user = {
        id: found.id,
        role: 'anak_kos',
        name: found.name,
        phone: found.phone,
        roomNumber: found.roomNumber,
        tenantId: found.id,
        rememberMe: !!rememberMe,
        expiresAt
      };
      setCurrentUser(user);
      setActiveTab('anak_kos');
      logActivity(
        'Anak Kos Login (No HP & GPS Valid)',
        `Penghuni ${found.name} login via nomor HP ${found.phone} (Kamar ${found.roomNumber})`,
        user
      );
      addToast(`Selamat datang, ${found.name}!`, 'success');
      return { success: true, tenant: found };
    }

    return {
      success: false,
      message: 'Nomor handphone tidak terdaftar pada data anak kos aktif Gladiola. Hubungi pengelola untuk pendaftaran.'
    };
  };

  // Logout function
  const logout = () => {
    if (currentUser) {
      logActivity('Logout', `Pengguna ${currentUser.name} (${currentUser.role}) keluar dari sistem`);
    }
    setCurrentUser(null);
    localStorage.removeItem('gladiola_currentUser');
    setActiveTab('overview');
    addToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  // Generate Monthly Bills for all active tenants when a month changes or is selected
  const generateMonthlyBills = (targetMonth) => {
    if (!targetMonth || targetMonth === 'all') return 0;

    const activeTenants = tenants.filter((t) => t.status === 'Aktif');
    let addedCount = 0;

    setPayments((prev) => {
      const newBills = [];
      activeTenants.forEach((tenant) => {
        const hasBill = prev.some((p) => {
          const matchMonth =
            p.month.toLowerCase().trim() === targetMonth.toLowerCase().trim() ||
            p.month.toLowerCase().includes(targetMonth.toLowerCase().trim());
          const matchTenant = p.tenantId === tenant.id || p.roomNumber === tenant.roomNumber;
          return matchMonth && matchTenant;
        });

        if (!hasBill) {
          const monthClean = targetMonth.replace(/\s+/g, '').toLowerCase();
          newBills.push({
            id: `pay-${monthClean}-${tenant.roomNumber}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantPhone: tenant.phone,
            roomNumber: tenant.roomNumber,
            month: targetMonth,
            amount: tenant.monthlyRent || 1750000,
            paidAt: null,
            paymentMethod: 'Belum Transfer',
            status: 'Belum Bayar',
            validatedBy: null,
            validatedAt: null,
            proofUrl: null,
            ratingGiven: false
          });
        }
      });

      if (newBills.length > 0) {
        addedCount = newBills.length;
        logActivity(
          `Penerbitan Tagihan: ${targetMonth}`,
          `Otomatis menerbitkan ${newBills.length} tagihan sewa bulanan ${targetMonth} untuk seluruh penghuni aktif.`
        );
        return [...prev, ...newBills];
      }
      return prev;
    });

    return addedCount;
  };

  // Actions
  const handleValidatePayment = (paymentId, newStatus, customMethod = null) => {
    const nowStr = new Date().toLocaleString('id-ID');
    const isApproval = newStatus === 'Tervalidasi';

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: newStatus,
            paymentMethod: isApproval
              ? (customMethod || (p.paymentMethod && p.paymentMethod !== 'Belum Transfer' ? p.paymentMethod : 'Transfer Bank BCA'))
              : (newStatus === 'Belum Bayar' ? 'Belum Transfer' : p.paymentMethod),
            paidAt: isApproval ? (p.paidAt || nowStr) : (newStatus === 'Belum Bayar' ? null : p.paidAt),
            validatedBy: isApproval ? (currentUser?.name || 'Petugas Gladiola') : null,
            validatedAt: isApproval ? nowStr : null
          };
        }
        return p;
      })
    );
    const target = payments.find((p) => p.id === paymentId);
    const label = target ? `Kamar ${target.roomNumber} (${target.tenantName})` : `ID ${paymentId}`;
    logActivity(
      `Validasi Pembayaran: ${newStatus}`,
      `Tagihan sewa ${label} diubah menjadi ${newStatus} oleh ${currentUser?.name || 'Petugas'}`
    );
    addToast(`Tagihan sewa ${label} berhasil diubah ke ${newStatus}`, 'success');
  };

  // Bulk validate all bills for a specific month (memudahkan petugas dalam 1 klik)
  const handleBulkValidateMonth = (targetMonth) => {
    if (!targetMonth || targetMonth === 'all') return;
    const nowStr = new Date().toLocaleString('id-ID');
    let updatedCount = 0;

    setPayments((prev) =>
      prev.map((p) => {
        const matchMonth =
          p.month.toLowerCase().trim() === targetMonth.toLowerCase().trim() ||
          p.month.toLowerCase().includes(targetMonth.toLowerCase().trim());
        if (matchMonth && p.status !== 'Tervalidasi') {
          updatedCount++;
          return {
            ...p,
            status: 'Tervalidasi',
            paymentMethod: p.paymentMethod && p.paymentMethod !== 'Belum Transfer' ? p.paymentMethod : 'Transfer Bank BCA',
            paidAt: p.paidAt || nowStr,
            validatedBy: currentUser?.name || 'Petugas Gladiola',
            validatedAt: nowStr
          };
        }
        return p;
      })
    );

    if (updatedCount > 0) {
      logActivity(
        `Validasi Massal: ${targetMonth}`,
        `Petugas ${currentUser?.name || 'Pengelola'} memvalidasi sekaligus ${updatedCount} tagihan sewa ${targetMonth}`
      );
      addToast(`Berhasil memvalidasi seluruh (${updatedCount}) tagihan sewa ${targetMonth}!`, 'success');
    } else {
      addToast(`Semua tagihan untuk ${targetMonth} sudah berstatus Tervalidasi.`, 'info');
    }
  };

  // Auto-generate current month bills (Oktober 2026) for all active tenants on load if missing
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      generateMonthlyBills('Oktober 2026');
    }
  }, [tenants.length]);

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

  // Room CRUD
  const handleSaveRoom = (roomData) => {
    if (currentUser.role === 'owner') {
      addToast('Owner tidak diizinkan menambah atau mengubah data kamar!', 'error');
      return;
    }

    if (roomData.id) {
      // Edit room
      setRooms((prev) =>
        prev.map((r) => (r.id === roomData.id ? { ...r, ...roomData } : r))
      );

      // Auto-sync electricity bills for this room with the fixed token
      if (roomData.electricityToken) {
        setElectricityBills((prev) =>
          prev.map((b) =>
            b.roomNumber === roomData.number
              ? { ...b, token: roomData.electricityToken }
              : b
          )
        );
      }

      logActivity('Ubah Data Kamar', `Memperbarui data Kamar ${roomData.number} (Token Listrik: ${roomData.electricityToken || '-'})`);
      addToast(`Data Kamar ${roomData.number} & Token PLN berhasil diperbarui`, 'success');
    } else {
      // Add room
      const newRoom = {
        ...roomData,
        id: `rm-${Date.now()}`
      };
      setRooms((prev) => [...prev, newRoom]);
      logActivity('Tambah Kamar Baru', `Menambahkan Kamar ${newRoom.number} di Lantai ${newRoom.floor}`);
      addToast(`Kamar ${newRoom.number} berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteRoom = (roomId) => {
    if (currentUser.role === 'owner') {
      addToast('Owner tidak diizinkan menghapus data kamar!', 'error');
      return;
    }
    const roomToDelete = rooms.find((r) => r.id === roomId);
    if (!roomToDelete) return;

    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    logActivity('Hapus Kamar', `Menghapus unit Kamar ${roomToDelete.number}`);
    addToast(`Kamar ${roomToDelete.number} telah dihapus dari sistem`, 'info');
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

  // Generate Monthly Electricity Bills for all active tenants when a month changes or is selected
  const generateMonthlyElectricityBills = (targetMonth) => {
    if (!targetMonth || targetMonth === 'all') return 0;

    const activeTenants = tenants.filter((t) => t.status === 'Aktif');
    let addedCount = 0;

    setElectricityBills((prev) => {
      const newBills = [];
      activeTenants.forEach((tenant) => {
        const hasBill = prev.some((b) => {
          const matchMonth =
            b.month.toLowerCase().trim() === targetMonth.toLowerCase().trim() ||
            b.month.toLowerCase().includes(targetMonth.toLowerCase().trim());
          const matchTenant = b.tenantId === tenant.id || b.roomNumber === tenant.roomNumber;
          return matchMonth && matchTenant;
        });

        if (!hasBill) {
          // Look for latest previous month's meterEnd for this room
          const prevBill = prev.find((b) => b.roomNumber === tenant.roomNumber && b.meterEnd);
          const baseStart = prevBill ? prevBill.meterEnd : 1000 + (parseInt(tenant.roomNumber) || 100) * 3;
          const monthClean = targetMonth.replace(/\s+/g, '').toLowerCase();

          // Get fixed room token from rooms master
          const roomObj = rooms.find((r) => r.number === tenant.roomNumber);
          const defaultFixedToken = roomObj?.electricityToken || '';

          newBills.push({
            id: `elec-${monthClean}-${tenant.roomNumber}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantPhone: tenant.phone,
            roomNumber: tenant.roomNumber,
            month: targetMonth,
            meterStart: baseStart,
            meterEnd: baseStart, // Stand awal sama dengan stand akhir sebelumnya
            kwhUsage: 0,
            ratePerKwh: 1650,
            totalBill: 0,
            token: defaultFixedToken, // Otomatis terisi nomor token tetap dari CRUD kamar!
            status: 'Belum Bayar',
            paidAt: null,
            recordedBy: currentUser ? currentUser.name : 'Petugas Gladiola'
          });
        }
      });

      if (newBills.length > 0) {
        addedCount = newBills.length;
        logActivity(
          `Penerbitan Utilitas Listrik: ${targetMonth}`,
          `Otomatis menerbitkan ${newBills.length} data tagihan listrik ${targetMonth} untuk seluruh penghuni aktif.`
        );
        return [...prev, ...newBills];
      }
      return prev;
    });

    return addedCount;
  };

  // Quick Update Electricity Token
  const handleUpdateElectricityToken = (billId, tokenValue, newStatus = null) => {
    setElectricityBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const cleanToken = tokenValue ? tokenValue.trim() : '';
          const isLunas = newStatus ? newStatus === 'Lunas' : (cleanToken.length >= 8);
          return {
            ...b,
            token: cleanToken,
            status: isLunas ? 'Lunas' : (newStatus || b.status),
            paidAt: isLunas ? (b.paidAt || new Date().toLocaleString('id-ID')) : b.paidAt,
            recordedBy: currentUser ? currentUser.name : b.recordedBy,
            updatedAt: new Date().toLocaleString('id-ID')
          };
        }
        return b;
      })
    );
    const target = electricityBills.find((b) => b.id === billId);
    const roomStr = target ? `Kamar ${target.roomNumber}` : `ID ${billId}`;
    logActivity('Input Token Listrik', `Petugas ${currentUser?.name || 'Pengelola'} memperbarui token listrik untuk ${roomStr}`);
    addToast(`Token listrik ${roomStr} berhasil disimpan!`, 'success');
  };

  // Quick update any meter readings directly
  const handleQuickUpdateElectricity = (billId, updates) => {
    setElectricityBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const merged = { ...b, ...updates };
          const meterStart = parseInt(merged.meterStart) || 0;
          const meterEnd = parseInt(merged.meterEnd) || meterStart;
          const kwhUsage = Math.max(0, meterEnd - meterStart);
          const ratePerKwh = parseInt(merged.ratePerKwh) || 1650;
          const totalBill = kwhUsage * ratePerKwh;

          return {
            ...merged,
            meterStart,
            meterEnd,
            kwhUsage,
            ratePerKwh,
            totalBill,
            recordedBy: currentUser ? currentUser.name : b.recordedBy,
            updatedAt: new Date().toLocaleString('id-ID')
          };
        }
        return b;
      })
    );
    addToast('Data meteran listrik berhasil diperbarui!', 'success');
  };

  // Auto-generate current month electricity bills (Oktober 2026) for all active tenants on load if missing
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      generateMonthlyElectricityBills('Oktober 2026');
    }
  }, [tenants.length]);

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

  // System Accounts CRUD (Super Admin, Owner, Operator)
  const handleSaveAccount = (accData) => {
    const isSuper = currentUser && currentUser.role === 'super_admin';
    const isOwner = currentUser && currentUser.role === 'owner';
    const isOperator = currentUser && currentUser.role === 'operator';

    if (!isSuper && !isOwner && !isOperator) {
      addToast('Anda tidak memiliki wewenang mengelola akun sistem!', 'error');
      return;
    }

    // Role-specific constraints for Operator:
    if (isOperator) {
      // Adding new account: only operator role allowed
      if (!accData.id && accData.role !== 'operator') {
        addToast('Pengelola hanya dapat menambahkan akun Pengelola / Operator!', 'error');
        return;
      }
      // Editing existing account: only operator accounts can be edited
      if (accData.id) {
        const target = systemAccounts.find((a) => a.id === accData.id);
        if (target && target.role !== 'operator') {
          addToast('Pengelola hanya dapat mengedit akun sesama Pengelola / Operator!', 'error');
          return;
        }
      }
    }

    if (accData.id) {
      // Edit
      setSystemAccounts((prev) =>
        prev.map((a) => (a.id === accData.id ? { ...a, ...accData } : a))
      );
      if (currentUser && currentUser.username === accData.username) {
        setCurrentUser((prev) => ({
          ...prev,
          name: accData.name,
          phone: accData.phone,
          email: accData.email,
          role: accData.role
        }));
      }
      logActivity('Ubah Akun Sistem', `Memperbarui akun: ${accData.username} (${accData.role}) oleh ${currentUser.name}`);
      addToast(`Akun @${accData.username} berhasil diperbarui`, 'success');
    } else {
      // Add
      const newAcc = {
        ...accData,
        id: `acc-${Date.now()}`,
        status: accData.status || 'Aktif',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSystemAccounts((prev) => [...prev, newAcc]);
      logActivity('Tambah Akun Sistem Baru', `Membuat akun baru: ${newAcc.username} (${newAcc.role}) oleh ${currentUser.name}`);
      addToast(`Akun @${newAcc.username} (${newAcc.name}) berhasil dibuat`, 'success');
    }
  };

  const handleDeleteAccount = (accId) => {
    const isSuper = currentUser && currentUser.role === 'super_admin';
    const isOwner = currentUser && currentUser.role === 'owner';

    // Operator is NOT allowed to delete accounts!
    if (!isSuper && !isOwner) {
      addToast('Pengelola tidak memiliki hak akses untuk menghapus akun sistem!', 'error');
      return;
    }

    const target = systemAccounts.find((a) => a.id === accId);
    if (!target) return;

    if (currentUser && currentUser.username === target.username) {
      addToast('Tidak dapat menghapus akun yang sedang Anda gunakan!', 'error');
      return;
    }

    // Owner can only delete operator accounts, cannot delete super_admin or other owners
    if (isOwner && target.role !== 'operator') {
      addToast('Owner hanya berwenang menghapus akun Pengelola (Operator)!', 'error');
      return;
    }

    setSystemAccounts((prev) => prev.filter((a) => a.id !== accId));
    logActivity('Hapus Akun Sistem', `Menghapus akun @${target.username} (${target.role}) oleh ${currentUser.name}`);
    addToast(`Akun @${target.username} (${target.name}) berhasil dihapus`, 'info');
  };

  const refreshActiveSessions = () => {
    requestLocation();
    addToast('Memindai sinyal GPS & memperbarui data telemetri...', 'info');
    logActivity('Refresh Radar Monitoring', 'Memperbarui koordinat GPS dan perangkat aktif');
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
        systemAccounts,
        activeSessions,
        setActiveSessions,
        refreshActiveSessions,
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
        loginWithCredentials,
        loginByPhone,
        logout,
        handleValidatePayment,
        generateMonthlyBills,
        handleBulkValidateMonth,
        handleAddStaffRating,
        handleSaveTenant,
        handleDeleteTenant,
        handleSaveRoom,
        handleDeleteRoom,
        handleSaveElectricityBill,
        generateMonthlyElectricityBills,
        handleUpdateElectricityToken,
        handleQuickUpdateElectricity,
        handleSaveStaff,
        handleDeleteStaff,
        handleSaveOperator,
        handleDeleteOperator,
        handleSaveAccount,
        handleDeleteAccount,
        cloudSyncStatus,
        lastSyncedTime,
        isCloudSyncing,
        cloudBinId,
        setCloudBinId,
        syncWithCloud,
        forcePushLocalToCloud,
        firebaseConfig,
        firebaseConnected,
        handleUpdateFirebaseConfig,
        testFirebaseConnection
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
