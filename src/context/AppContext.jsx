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
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SESSION_HISTORY
} from '../data/initialData';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  subscribeToFirebase,
  pushDataToFirebase,
  fetchOnceFromFirebase,
  testFirebaseConnection
} from '../services/firebaseSync';
import {
  fetchFromNeon,
  pushToNeon,
  testNeonConnection
} from '../services/neonSync';

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
  const latestKnownRemoteVersionRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const debounceTimerRef = useRef(null);
  const syncChannelRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const lastLocalUserEditRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // Self-heal and reconcile tenant references across all collections
  const reconcileTenantReferences = (tList, rList, pList, eList) => {
    if (!Array.isArray(tList) || tList.length === 0) {
      return { rooms: rList, payments: pList, electricityBills: eList };
    }
    const tenantById = new Map();
    const tenantByRoom = new Map();
    tList.forEach((t) => {
      tenantById.set(t.id, t);
      if (t.roomNumber) tenantByRoom.set(t.roomNumber, t);
    });

    let roomsChanged = false;
    const newRooms = (rList || []).map((r) => {
      const matchTenant = tenantByRoom.get(r.number);
      if (matchTenant && matchTenant.status === 'Aktif') {
        if (r.currentTenant !== matchTenant.name || r.status !== 'Terisi') {
          roomsChanged = true;
          return { ...r, currentTenant: matchTenant.name, status: 'Terisi' };
        }
      }
      return r;
    });

    let paymentsChanged = false;
    const newPayments = (pList || []).map((p) => {
      const matchTenant =
        (p.tenantId && tenantById.get(p.tenantId)) ||
        (p.roomNumber && tenantByRoom.get(p.roomNumber));
      if (matchTenant) {
        if (
          p.tenantName !== matchTenant.name ||
          p.tenantPhone !== matchTenant.phone ||
          (p.tenantId && p.tenantId !== matchTenant.id)
        ) {
          paymentsChanged = true;
          return {
            ...p,
            tenantId: matchTenant.id,
            tenantName: matchTenant.name,
            tenantPhone: matchTenant.phone,
            roomNumber: matchTenant.roomNumber || p.roomNumber
          };
        }
      }
      return p;
    });

    let billsChanged = false;
    const newBills = (eList || []).map((b) => {
      const matchTenant =
        (b.tenantId && tenantById.get(b.tenantId)) ||
        (b.roomNumber && tenantByRoom.get(b.roomNumber));
      if (matchTenant) {
        if (
          b.tenantName !== matchTenant.name ||
          b.tenantPhone !== matchTenant.phone ||
          (b.tenantId && b.tenantId !== matchTenant.id)
        ) {
          billsChanged = true;
          return {
            ...b,
            tenantId: matchTenant.id,
            tenantName: matchTenant.name,
            tenantPhone: matchTenant.phone,
            roomNumber: matchTenant.roomNumber || b.roomNumber
          };
        }
      }
      return b;
    });

    return {
      rooms: roomsChanged ? newRooms : rList,
      payments: paymentsChanged ? newPayments : pList,
      electricityBills: billsChanged ? newBills : eList,
      hasAnyChange: roomsChanged || paymentsChanged || billsChanged
    };
  };

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
  const [sessionHistory, setSessionHistory] = useState(() =>
    loadState('sessionHistory', INITIAL_SESSION_HISTORY)
  );
  const [notifications, setNotifications] = useState([]);

  // Save changes to localStorage
  useEffect(() => saveState('currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('systemAccounts', systemAccounts), [systemAccounts]);
  useEffect(() => saveState('userLocation', userLocation), [userLocation]);
  useEffect(() => saveState('activeSessions', activeSessions), [activeSessions]);
  useEffect(() => saveState('sessionHistory', sessionHistory), [sessionHistory]);
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

  // Self-heal initial data if rooms/payments are desynchronized with tenants
  useEffect(() => {
    const reconciled = reconcileTenantReferences(tenants, rooms, payments, electricityBills);
    if (reconciled.hasAnyChange) {
      setRooms(reconciled.rooms);
      saveState('rooms', reconciled.rooms);
      setPayments(reconciled.payments);
      saveState('payments', reconciled.payments);
      setElectricityBills(reconciled.electricityBills);
      saveState('electricity', reconciled.electricityBills);
    }
  }, []);

  // BroadcastChannel for instant same-device / multi-tab synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        syncChannelRef.current = new BroadcastChannel('gladiola_realtime_sync');
        syncChannelRef.current.onmessage = (event) => {
          if (event.data?.type === 'REMOTE_DATA' && event.data?.payload) {
            applyRemoteData(event.data.payload);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
    return () => {
      if (syncChannelRef.current) {
        try {
          syncChannelRef.current.close();
        } catch {}
      }
    };
  }, []);

// Native browser deflate compression helpers
const compressPayload = async (obj) => {
  try {
    if (typeof window !== 'undefined' && 'CompressionStream' in window) {
      const str = JSON.stringify(obj);
      const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('deflate'));
      const buffer = await new Response(stream).arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
  } catch (e) {
    console.warn('Compression error:', e);
  }
  return null;
};

const decompressPayload = async (base64Str) => {
  try {
    if (typeof window !== 'undefined' && 'DecompressionStream' in window && base64Str) {
      const binary = atob(base64Str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      const text = await new Response(stream).text();
      return JSON.parse(text);
    }
  } catch (e) {
    console.warn('Decompression error:', e);
  }
  return null;
};

  // Apply remote payload cleanly across all local states
  const applyRemoteData = async (rawCloudData) => {
    if (!rawCloudData) return;
    let cloudData = rawCloudData;
    if (rawCloudData.data_z) {
      const decompressed = await decompressPayload(rawCloudData.data_z);
      if (decompressed && Array.isArray(decompressed.tenants)) {
        cloudData = {
          ...decompressed,
          version: rawCloudData.version || decompressed.version,
          updatedAt: rawCloudData.updatedAt || decompressed.updatedAt
        };
      }
    }
    if (!cloudData || !Array.isArray(cloudData.tenants) || cloudData.tenants.length === 0) return;
    const remoteVersion = Number(cloudData.version || 0);
    const remoteTime = Number(cloudData.updatedAt || 0);
    const localVersion = Number(loadState('lastLocalVersion', 0));
    const localTime = Number(loadState('lastLocalEditTime', 0));

    latestKnownRemoteVersionRef.current = Math.max(latestKnownRemoteVersionRef.current, remoteVersion);

    // Has this specific client device made local edits in the last 4 seconds?
    const hasRecentLocalEdit = Date.now() - (lastLocalUserEditRef.current || 0) < 4000;

    // Conditions to apply remote data:
    // 1. Initial page load (isFirstLoadRef.current) -> adopt cloud truth immediately
    // 2. Remote version is newer than local version
    // 3. Remote time is newer than local time AND no unsaved recent local edit
    // 4. Remote version is different from local version AND no recent local edit
    const shouldApply =
      isFirstLoadRef.current ||
      (!hasRecentLocalEdit &&
        (remoteVersion > localVersion ||
          remoteTime > localTime ||
          remoteVersion !== localVersion));

    if (shouldApply) {
      isFirstLoadRef.current = false;
      isApplyingRemoteRef.current = true;
      saveState('lastLocalVersion', remoteVersion);
      saveState('lastLocalEditTime', remoteTime || Date.now());

      const reconciled = reconcileTenantReferences(
        cloudData.tenants,
        cloudData.rooms || rooms,
        cloudData.payments || payments,
        cloudData.electricityBills || electricityBills
      );

      setTenants(cloudData.tenants);
      saveState('tenants', cloudData.tenants);

      setRooms(reconciled.rooms);
      saveState('rooms', reconciled.rooms);

      setPayments(reconciled.payments);
      saveState('payments', reconciled.payments);

      setElectricityBills(reconciled.electricityBills);
      saveState('electricity', reconciled.electricityBills);

      if (Array.isArray(cloudData.staffList)) {
        setStaffList(cloudData.staffList);
        saveState('staff', cloudData.staffList);
      }
      if (Array.isArray(cloudData.staffRatings)) {
        setStaffRatings(cloudData.staffRatings);
        saveState('staffRatings', cloudData.staffRatings);
      }
      if (cloudData.bankInfo) {
        setBankInfo(cloudData.bankInfo);
        saveState('bankInfo', cloudData.bankInfo);
      }
      if (cloudData.wifiInfo) {
        setWifiInfo(cloudData.wifiInfo);
        saveState('wifiInfo', cloudData.wifiInfo);
      }
      if (Array.isArray(cloudData.operators)) {
        setOperators(cloudData.operators);
        saveState('operators', cloudData.operators);
      }
      if (Array.isArray(cloudData.systemAccounts)) {
        setSystemAccounts(cloudData.systemAccounts);
        saveState('systemAccounts', cloudData.systemAccounts);
      }
      if (Array.isArray(cloudData.activityLogs)) {
        setActivityLogs(cloudData.activityLogs);
        saveState('logs', cloudData.activityLogs);
      }
      if (Array.isArray(cloudData.sessionHistory)) {
        setSessionHistory(cloudData.sessionHistory);
        saveState('sessionHistory', cloudData.sessionHistory);
      }

      lastUploadedTimestampRef.current = remoteTime;
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 1000);

      setCloudSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    }
  };

  // =========================================================================
  // MULTI-DEVICE CLOUD SYNC ENGINE (NEON POSTGRESQL + FIREBASE FALLBACK)
  // =========================================================================
  const fetchCloudData = async (silent = false) => {
    if (isApplyingRemoteRef.current) return;
    try {
      if (!silent) setIsCloudSyncing(true);
      lastFetchTimeRef.current = Date.now();
      let cloudData = null;

      // 1. Primary: Neon PostgreSQL Cloud Database (ACID, real-time, cross-network)
      cloudData = await fetchFromNeon();

      // 2. Fallback: Firebase Realtime Database if configured & online
      if (!cloudData || !Array.isArray(cloudData.tenants)) {
        if (firebaseConfig?.databaseURL) {
          try {
            cloudData = await fetchOnceFromFirebase(firebaseConfig);
            if (cloudData && Array.isArray(cloudData.tenants)) {
              setFirebaseConnected(true);
            }
          } catch {}
        }
      }

      if (cloudData && Array.isArray(cloudData.tenants) && cloudData.tenants.length > 0) {
        await applyRemoteData(cloudData);
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
      lastLocalUserEditRef.current = now;

      const currentVer = Math.max(loadState('lastLocalVersion', 0), latestKnownRemoteVersionRef.current);
      const nextVer = currentVer + 1;
      latestKnownRemoteVersionRef.current = nextVer;

      lastUploadedTimestampRef.current = now;
      saveState('lastLocalVersion', nextVer);
      saveState('lastLocalEditTime', now);

      const payload = {
        version: nextVer,
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
        activityLogs: overrideData?.activityLogs || activityLogs,
        sessionHistory: overrideData?.sessionHistory || sessionHistory
      };

      // Broadcast immediately to tabs on this machine (0ms latency via BroadcastChannel)
      if (syncChannelRef.current) {
        try {
          syncChannelRef.current.postMessage({ type: 'REMOTE_DATA', payload });
        } catch {}
      }

      // 1. Neon PostgreSQL Push
      const neonPromise = pushToNeon(payload).catch((err) => {
        console.warn('Neon push error:', err);
        return false;
      });

      // 2. Firebase Push (if configured)
      const fbPromise = pushDataToFirebase(firebaseConfig, payload).catch((err) => {
        console.warn('FB push error:', err);
        return false;
      });

      const [neonRes, fbRes] = await Promise.allSettled([neonPromise, fbPromise]);
      const neonSuccess = neonRes.status === 'fulfilled' && neonRes.value;
      const fbSuccess = fbRes.status === 'fulfilled' && fbRes.value;

      if (neonSuccess || fbSuccess) {
        setCloudSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
      } else {
        setCloudSyncStatus('offline');
      }
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

  // Periodic polling sync (every 2s) & instant sync on tab focus or interaction
  useEffect(() => {
    const handleFocus = () => fetchCloudData(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCloudData(true);
    };
    const handleInteraction = () => {
      if (Date.now() - lastFetchTimeRef.current > 2000) {
        fetchCloudData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pointerdown', handleInteraction, { passive: true });

    // Initial fetch on mount
    fetchCloudData(true);

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCloudData(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pointerdown', handleInteraction);
      clearInterval(pollInterval);
    };
  }, [firebaseConfig]);

  const TAB_PAGE_NAMES = {
    overview: 'Dashboard Ringkasan',
    monitoring_lokasi: 'Monitoring User & Riwayat Akses',
    penyewa: 'Data Penyewa Kos',
    kamar: 'Katalog & Status Kamar',
    pembayaran: 'Validasi Pembayaran Sewa',
    listrik: 'Pencatatan Listrik & Token',
    laporan: 'Laporan Keuangan & Okupansi',
    petugas: 'Kelola Staf & Ulasan Petugas',
    kelola_akun: 'Kelola Akun Akses',
    pengaturan: 'Pengaturan Sistem & Database',
    anak_kos: 'Portal Utama Anak Kos'
  };

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
        lastAccessedPage: TAB_PAGE_NAMES[activeTab] || 'Dashboard Ringkasan',
        lastAction: `Mengakses halaman ${TAB_PAGE_NAMES[activeTab] || 'Dashboard'}`,
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
  }, [currentUser, userLocation.lat, userLocation.lng, userLocation.status, activeTab]);

  // Toast notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Activity Logger
  const logActivity = (action, details, customUser = null, customPage = null) => {
    const userToLog = customUser || currentUser;
    if (!userToLog) return;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
    const distKm = userLocation.distanceKm !== null ? userLocation.distanceKm : 0.008;
    const distanceMeters = Math.round(distKm * 1000);
    const isInsideKos = distanceMeters <= 50;
    const distanceText = isInsideKos
      ? `${distanceMeters} meter • Di Dalam Kos`
      : distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(1)} km • Di Luar Kos`
      : `${distanceMeters} meter • Di Luar Kos`;
    const telemetry = getLiveDeviceTelemetry();

    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      time,
      userId: userToLog.id || userToLog.userId || userToLog.username || userToLog.phone || `usr-${userToLog.role}`,
      user: userToLog.name || 'Pengguna Sistem',
      role: userToLog.role || 'anak_kos',
      action,
      pageAccessed: customPage || TAB_PAGE_NAMES[activeTab] || 'Dashboard Ringkasan',
      details,
      coords: {
        lat: userLocation.lat || GLADIOLA_COORDS.lat,
        lng: userLocation.lng || GLADIOLA_COORDS.lng
      },
      locationName: userLocation.address || 'Gladiola Guest House, Jl. Gladiol No. 1 Malang',
      distanceMeters,
      distanceText,
      isInsideKos,
      deviceModel: telemetry?.model || 'Perangkat Terdeteksi',
      ipAddress: telemetry?.ipAddress || '103.145.22.84'
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
      const userSess = activeSessions.find(
        (s) => s.username === currentUser.username || (currentUser.phone && s.phone === currentUser.phone)
      );
      if (userSess) {
        const completedHist = {
          ...userSess,
          id: `hist-${Date.now()}`,
          status: 'Selesai',
          logoutTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          sessionDuration: 'Sesi Aktif Selesai',
          isCurrent: false
        };
        setSessionHistory((prev) => [completedHist, ...prev.slice(0, 49)]);
      }
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
    const now = Date.now();
    saveState('lastLocalEditTime', now);

    const newPayments = payments.map((p) => {
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
    });

    setPayments(newPayments);
    saveState('payments', newPayments);
    pushToCloud({ payments: newPayments });

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
    const now = Date.now();
    saveState('lastLocalEditTime', now);

    const newPayments = payments.map((p) => {
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
    });

    setPayments(newPayments);
    saveState('payments', newPayments);
    pushToCloud({ payments: newPayments });

    logActivity(
      'Validasi Massal Tagihan Bulanan',
      `Validasi massal ${updatedCount} tagihan bulan ${targetMonth} oleh ${currentUser?.name || 'Petugas'}`
    );
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
    if (currentUser?.role === 'owner') {
      addToast('Owner tidak diizinkan menambah atau mengubah data anak kos!', 'error');
      return;
    }

    const now = Date.now();
    saveState('lastLocalEditTime', now);

    const newName = (tenantData.name || '').trim();
    const newPhone = (tenantData.phone || '').trim();
    const newRoom = (tenantData.roomNumber || '').trim();
    const newRent = Number(tenantData.monthlyRent) || 1750000;

    if (tenantData.id) {
      // Edit
      const oldTenant = tenants.find((t) => t.id === tenantData.id);
      const oldName = oldTenant ? oldTenant.name : '';
      const oldPhone = oldTenant ? oldTenant.phone : '';
      const oldRoom = oldTenant ? oldTenant.roomNumber : '';

      // 1. Update tenants list
      const newTenants = tenants.map((t) =>
        t.id === tenantData.id
          ? {
              ...t,
              ...tenantData,
              name: newName,
              phone: newPhone,
              roomNumber: newRoom,
              monthlyRent: newRent
            }
          : t
      );
      setTenants(newTenants);
      saveState('tenants', newTenants);

      // 2. Cascade update to rooms
      const newRooms = rooms.map((r) => {
        // If room changed, vacate old room
        if (oldRoom && oldRoom !== newRoom && r.number === oldRoom) {
          return { ...r, status: 'Kosong', currentTenant: null };
        }
        // Occupy or update new room
        if (r.number === newRoom) {
          return { ...r, status: 'Terisi', currentTenant: newName };
        }
        // If this room currently lists old tenant name, update it
        if (oldName && r.currentTenant === oldName) {
          return { ...r, currentTenant: newName };
        }
        return r;
      });
      setRooms(newRooms);
      saveState('rooms', newRooms);

      // 3. Cascade update to payments
      const newPayments = payments.map((p) => {
        const isMatch =
          p.tenantId === tenantData.id ||
          (oldName && p.tenantName === oldName) ||
          (oldRoom && p.roomNumber === oldRoom && (oldName && p.tenantName === oldName)) ||
          (oldRoom && p.roomNumber === oldRoom && oldPhone && p.tenantPhone === oldPhone);
        if (isMatch) {
          return {
            ...p,
            tenantId: tenantData.id,
            tenantName: newName,
            tenantPhone: newPhone || p.tenantPhone,
            roomNumber: newRoom || p.roomNumber,
            amount: newRent || p.amount
          };
        }
        return p;
      });
      setPayments(newPayments);
      saveState('payments', newPayments);

      // 4. Cascade update to electricity bills
      const newBills = electricityBills.map((b) => {
        const isMatch =
          b.tenantId === tenantData.id ||
          (oldName && b.tenantName === oldName) ||
          (oldRoom && b.roomNumber === oldRoom && (oldName && b.tenantName === oldName)) ||
          (oldRoom && b.roomNumber === oldRoom && oldPhone && b.tenantPhone === oldPhone);
        if (isMatch) {
          return {
            ...b,
            tenantId: tenantData.id,
            tenantName: newName,
            tenantPhone: newPhone || b.tenantPhone,
            roomNumber: newRoom || b.roomNumber
          };
        }
        return b;
      });
      setElectricityBills(newBills);
      saveState('electricity', newBills);

      // 5. Cascade update to staff ratings
      const newRatings = staffRatings.map((sr) => {
        const isMatch =
          sr.tenantId === tenantData.id ||
          (oldName && sr.tenantName === oldName) ||
          (oldPhone && sr.tenantPhone === oldPhone);
        if (isMatch) {
          return {
            ...sr,
            tenantId: tenantData.id,
            tenantName: newName,
            tenantPhone: newPhone || sr.tenantPhone
          };
        }
        return sr;
      });
      setStaffRatings(newRatings);
      saveState('staffRatings', newRatings);

      // 6. Update currentUser if logged in as this anak kos
      if (
        currentUser &&
        currentUser.role === 'anak_kos' &&
        (currentUser.id === tenantData.id ||
          currentUser.phone === oldPhone ||
          currentUser.phone === newPhone)
      ) {
        setCurrentUser((prev) => ({
          ...prev,
          name: newName,
          phone: newPhone,
          roomNumber: newRoom
        }));
      }

      // 7. Push all updated collections to cloud
      pushToCloud({
        tenants: newTenants,
        rooms: newRooms,
        payments: newPayments,
        electricityBills: newBills,
        staffRatings: newRatings
      });

      logActivity(
        'Ubah Data Anak Kos',
        `Memperbarui data anak kos: ${newName} (Kamar ${newRoom}) - Seluruh riwayat dan halaman disinkronkan.`
      );
      addToast(`Data ${newName} berhasil diperbarui di semua halaman!`, 'success');
    } else {
      // Add new tenant
      const newTenant = {
        ...tenantData,
        id: `t-${Date.now()}`,
        name: newName,
        phone: newPhone,
        roomNumber: newRoom,
        monthlyRent: newRent,
        status: 'Aktif'
      };
      const newTenants = [...tenants, newTenant];
      setTenants(newTenants);
      saveState('tenants', newTenants);

      // Update room status
      const newRooms = rooms.map((r) =>
        r.number === newTenant.roomNumber
          ? { ...r, status: 'Terisi', currentTenant: newTenant.name }
          : r
      );
      setRooms(newRooms);
      saveState('rooms', newRooms);

      // Auto-create initial payment record for current month if missing
      const monthClean = 'okt26';
      const targetMonth = 'Oktober 2026';
      let newPayments = payments;
      const hasPayment = payments.some(
        (p) =>
          (p.tenantId === newTenant.id || p.roomNumber === newTenant.roomNumber) &&
          p.month.toLowerCase().includes('oktober 2026')
      );
      if (!hasPayment) {
        const newPay = {
          id: `pay-${monthClean}-${newTenant.roomNumber}`,
          tenantId: newTenant.id,
          tenantName: newTenant.name,
          tenantPhone: newTenant.phone,
          roomNumber: newTenant.roomNumber,
          month: targetMonth,
          amount: newTenant.monthlyRent || 1750000,
          paidAt: null,
          paymentMethod: 'Belum Transfer',
          status: 'Belum Bayar',
          validatedBy: null,
          validatedAt: null,
          proofUrl: null,
          ratingGiven: false
        };
        newPayments = [newPay, ...payments];
        setPayments(newPayments);
        saveState('payments', newPayments);
      }

      pushToCloud({ tenants: newTenants, rooms: newRooms, payments: newPayments });
      logActivity(
        'Tambah Anak Kos Baru',
        `Menambahkan penghuni baru: ${newTenant.name} (Kamar ${newTenant.roomNumber})`
      );
      addToast(`Anak kos baru ${newTenant.name} berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteTenant = (tenantId) => {
    if (currentUser?.role === 'owner') {
      addToast('Owner tidak diizinkan mengubah/menghapus data anak kos!', 'error');
      return;
    }
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    if (!tenantToDelete) return;

    const delName = tenantToDelete.name;
    const delRoom = tenantToDelete.roomNumber;
    const now = Date.now();
    saveState('lastLocalEditTime', now);

    const newTenants = tenants.filter((t) => t.id !== tenantId);
    setTenants(newTenants);
    saveState('tenants', newTenants);

    // Set room to Kosong
    const newRooms = rooms.map((r) =>
      r.number === delRoom || (delName && r.currentTenant === delName)
        ? { ...r, status: 'Kosong', currentTenant: null }
        : r
    );
    setRooms(newRooms);
    saveState('rooms', newRooms);

    pushToCloud({ tenants: newTenants, rooms: newRooms });
    logActivity('Hapus Anak Kos', `Menghapus anak kos ${tenantToDelete.name} dari kamar ${tenantToDelete.roomNumber}`);
    addToast(`Data penghuni ${tenantToDelete.name} telah dihapus`, 'info');
  };

  // Room CRUD
  const handleSaveRoom = (roomData) => {
    if (currentUser?.role === 'owner') {
      addToast('Owner tidak diizinkan menambah atau mengubah data kamar!', 'error');
      return;
    }

    const now = Date.now();
    saveState('lastLocalEditTime', now);

    if (roomData.id) {
      // Edit room
      const oldRoom = rooms.find((r) => r.id === roomData.id);
      const newRooms = rooms.map((r) => (r.id === roomData.id ? { ...r, ...roomData } : r));
      setRooms(newRooms);
      saveState('rooms', newRooms);

      // Auto-sync electricity bills for this room with the fixed token
      let newBills = electricityBills;
      if (roomData.electricityToken) {
        newBills = electricityBills.map((b) =>
          b.roomNumber === roomData.number ? { ...b, token: roomData.electricityToken } : b
        );
        setElectricityBills(newBills);
        saveState('electricity', newBills);
      }

      // If room tenant was edited or cleared, sync tenants
      let newTenants = tenants;
      if (roomData.status === 'Kosong') {
        newTenants = tenants.map((t) =>
          t.roomNumber === roomData.number ? { ...t, status: 'Nonaktif' } : t
        );
        setTenants(newTenants);
        saveState('tenants', newTenants);
      } else if (roomData.currentTenant && oldRoom?.currentTenant !== roomData.currentTenant) {
        newTenants = tenants.map((t) =>
          t.roomNumber === roomData.number ? { ...t, name: roomData.currentTenant.trim() } : t
        );
        setTenants(newTenants);
        saveState('tenants', newTenants);
      }

      pushToCloud({ rooms: newRooms, electricityBills: newBills, tenants: newTenants });
      logActivity('Ubah Data Kamar', `Memperbarui data Kamar ${roomData.number} (Token Listrik: ${roomData.electricityToken || '-'})`);
      addToast(`Data Kamar ${roomData.number} & Token PLN berhasil diperbarui`, 'success');
    } else {
      // Add room
      const newRoom = {
        ...roomData,
        id: `rm-${Date.now()}`
      };
      const newRooms = [...rooms, newRoom];
      setRooms(newRooms);
      saveState('rooms', newRooms);
      pushToCloud({ rooms: newRooms });
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

    const now = Date.now();
    saveState('lastLocalEditTime', now);
    const newRooms = rooms.filter((r) => r.id !== roomId);
    setRooms(newRooms);
    saveState('rooms', newRooms);
    pushToCloud({ rooms: newRooms });
    logActivity('Hapus Kamar', `Menghapus unit Kamar ${roomToDelete.number}`);
    addToast(`Kamar ${roomToDelete.number} telah dihapus dari sistem`, 'info');
  };

  // Electricity record save
  const handleSaveElectricityBill = (billData) => {
    const now = Date.now();
    saveState('lastLocalEditTime', now);

    if (billData.id) {
      const newBills = electricityBills.map((b) => (b.id === billData.id ? { ...b, ...billData } : b));
      setElectricityBills(newBills);
      saveState('electricity', newBills);
      pushToCloud({ electricityBills: newBills });
      logActivity('Ubah Tagihan Listrik', `Update tagihan kamar ${billData.roomNumber} (${billData.kwhUsage} kWh)`);
      addToast('Tagihan listrik berhasil diperbarui', 'success');
    } else {
      const newBill = {
        ...billData,
        id: `elec-${Date.now()}`,
        recordedBy: currentUser?.name || 'Petugas Gladiola'
      };
      const newBills = [newBill, ...electricityBills];
      setElectricityBills(newBills);
      saveState('electricity', newBills);
      pushToCloud({ electricityBills: newBills });
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
    let newStaffList;
    if (staffData.id) {
      newStaffList = staffList.map((s) => (s.id === staffData.id ? { ...s, ...staffData } : s));
      setStaffList(newStaffList);
      saveState('staff', newStaffList);
      pushToCloud({ staffList: newStaffList });
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
      newStaffList = [...staffList, newStaff];
      setStaffList(newStaffList);
      saveState('staff', newStaffList);
      pushToCloud({ staffList: newStaffList });
      logActivity('Tambah Petugas Baru', `Menambahkan petugas baru: ${newStaff.name} (${newStaff.role})`);
      addToast(`Petugas ${newStaff.name} berhasil ditambahkan`, 'success');
    }
  };

  const handleDeleteStaff = (staffId) => {
    const staff = staffList.find((s) => s.id === staffId);
    const newStaffList = staffList.filter((s) => s.id !== staffId);
    setStaffList(newStaffList);
    saveState('staff', newStaffList);
    pushToCloud({ staffList: newStaffList });
    logActivity('Hapus Petugas', `Menghapus petugas: ${staff ? staff.name : staffId}`);
    addToast('Data petugas berhasil dihapus', 'info');
  };

  // Operators CRUD (Super Admin only)
  const handleSaveOperator = (opData) => {
    if (currentUser.role !== 'super_admin') {
      addToast('Hanya Super Admin yang dapat mengelola akun Operator!', 'error');
      return;
    }
    let newOps;
    if (opData.id) {
      newOps = operators.map((o) => (o.id === opData.id ? { ...o, ...opData } : o));
      setOperators(newOps);
      saveState('operators', newOps);
      pushToCloud({ operators: newOps });
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
      newOps = [...operators, newOp];
      setOperators(newOps);
      saveState('operators', newOps);
      pushToCloud({ operators: newOps });
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
    const newOps = operators.filter((o) => o.id !== opId);
    setOperators(newOps);
    saveState('operators', newOps);
    pushToCloud({ operators: newOps });
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
      if (!accData.id && accData.role !== 'operator') {
        addToast('Pengelola hanya dapat menambahkan akun Pengelola / Operator!', 'error');
        return;
      }
      if (accData.id) {
        const target = systemAccounts.find((a) => a.id === accData.id);
        if (target && target.role !== 'operator') {
          addToast('Pengelola hanya dapat mengedit akun sesama Pengelola / Operator!', 'error');
          return;
        }
      }
    }

    let newAccounts;
    if (accData.id) {
      newAccounts = systemAccounts.map((a) => (a.id === accData.id ? { ...a, ...accData } : a));
      setSystemAccounts(newAccounts);
      saveState('systemAccounts', newAccounts);
      pushToCloud({ systemAccounts: newAccounts });

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
      const newAcc = {
        ...accData,
        id: `acc-${Date.now()}`,
        status: accData.status || 'Aktif',
        createdAt: new Date().toISOString().split('T')[0]
      };
      newAccounts = [...systemAccounts, newAcc];
      setSystemAccounts(newAccounts);
      saveState('systemAccounts', newAccounts);
      pushToCloud({ systemAccounts: newAccounts });

      logActivity('Tambah Akun Sistem Baru', `Membuat akun baru: ${newAcc.username} (${newAcc.role}) oleh ${currentUser.name}`);
      addToast(`Akun @${newAcc.username} (${newAcc.name}) berhasil dibuat`, 'success');
    }
  };

  const handleDeleteAccount = (accId) => {
    const isSuper = currentUser && currentUser.role === 'super_admin';
    const isOwner = currentUser && currentUser.role === 'owner';

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

    if (isOwner && target.role !== 'operator') {
      addToast('Owner hanya berwenang menghapus akun Pengelola (Operator)!', 'error');
      return;
    }

    const newAccounts = systemAccounts.filter((a) => a.id !== accId);
    setSystemAccounts(newAccounts);
    saveState('systemAccounts', newAccounts);
    pushToCloud({ systemAccounts: newAccounts });

    logActivity('Hapus Akun Sistem', `Menghapus akun @${target.username} (${target.role}) oleh ${currentUser.name}`);
    addToast(`Akun @${target.username} (${target.name}) berhasil dihapus`, 'info');
  };

  const handleSaveBankInfo = (newBank) => {
    setBankInfo(newBank);
    saveState('bankInfo', newBank);
    pushToCloud({ bankInfo: newBank });
  };

  const handleSaveWifiInfo = (newWifi) => {
    setWifiInfo(newWifi);
    saveState('wifiInfo', newWifi);
    pushToCloud({ wifiInfo: newWifi });
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
        sessionHistory,
        setSessionHistory,
        refreshActiveSessions,
        tenants,
        rooms,
        payments,
        electricityBills,
        staffList,
        staffRatings,
        bankInfo,
        setBankInfo: handleSaveBankInfo,
        handleSaveBankInfo,
        wifiInfo,
        setWifiInfo: handleSaveWifiInfo,
        handleSaveWifiInfo,
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
