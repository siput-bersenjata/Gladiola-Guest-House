import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

// PERMANENT FIREBASE CONFIGURATION FOR GLADIOLA
export const PERMANENT_FIREBASE_CONFIG = {
  databaseURL: 'https://gladiola-1d671-default-rtdb.asia-southeast1.firebasedatabase.app',
  fallbackURL: 'https://gladiola-1d671-default-rtdb.firebaseio.com',
  projectId: 'gladiola-1d671',
  apiKey: 'AIzaSyGladiolaKosMockApiKey',
  authDomain: 'gladiola-1d671.firebaseapp.com'
};

const STORAGE_KEY = 'gladiola_firebase_config';

// Always return permanent configuration
export const getStoredFirebaseConfig = () => {
  return PERMANENT_FIREBASE_CONFIG;
};

export const saveStoredFirebaseConfig = () => {
  // Permanently locked, no override needed
};

export const sanitizeFirebaseConfig = (config) => {
  return config || PERMANENT_FIREBASE_CONFIG;
};

let currentApp = null;
let currentDb = null;
let activeUrlUsed = null;

// Initialize or get existing Firebase instance
export const initFirebase = (config = PERMANENT_FIREBASE_CONFIG, targetUrl = null) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
  const dbUrl = (targetUrl || activeUrlUsed || cfg.databaseURL).replace(/\/+$/, '');

  try {
    const appName = 'gladiola-permanent-app';
    const existingApps = getApps();
    const existingApp = existingApps.find((a) => a.name === appName);

    if (existingApp) {
      if (existingApp.options.databaseURL !== dbUrl) {
        deleteApp(existingApp);
        currentApp = initializeApp(
          {
            apiKey: cfg.apiKey,
            authDomain: cfg.authDomain,
            databaseURL: dbUrl,
            projectId: cfg.projectId
          },
          appName
        );
      } else {
        currentApp = existingApp;
      }
    } else {
      currentApp = initializeApp(
        {
          apiKey: cfg.apiKey,
          authDomain: cfg.authDomain,
          databaseURL: dbUrl,
          projectId: cfg.projectId
        },
        appName
      );
    }

    currentDb = getDatabase(currentApp);
    activeUrlUsed = dbUrl;
    return currentDb;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
};

let isFirebaseOnline = null;
let lastHealthCheckTime = 0;

// Test connection to Firebase Realtime Database
export const testFirebaseConnection = async (config = PERMANENT_FIREBASE_CONFIG) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
  const urlsToTry = [
    activeUrlUsed,
    cfg.databaseURL,
    cfg.fallbackURL || 'https://gladiola-1d671-default-rtdb.firebaseio.com'
  ].filter(Boolean);

  lastHealthCheckTime = Date.now();

  for (const url of urlsToTry) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const testUrl = `${cleanUrl}/_health.json?t=${Date.now()}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(testUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: 'pong', timestamp: Date.now() }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        activeUrlUsed = cleanUrl;
        isFirebaseOnline = true;
        return {
          success: true,
          message: 'Koneksi ke Firebase Realtime Database gladiola-1d671 BERHASIL!',
          databaseURL: cleanUrl
        };
      }
    } catch {}
  }

  isFirebaseOnline = false;
  return {
    success: false,
    message: 'Database gladiola-1d671 belum dibuat di Firebase Console. Sinkronisasi multi-device dialihkan ke Cloud Storage Realtime.'
  };
};

// Check if Firebase is available without blocking
const checkFirebaseAvailableQuick = async (cfg) => {
  if (isFirebaseOnline === true) return true;
  if (isFirebaseOnline === false && Date.now() - lastHealthCheckTime < 60000) {
    return false; // Skip immediately, avoiding delay
  }
  // Trigger background check if past 60s
  if (Date.now() - lastHealthCheckTime >= 60000) {
    testFirebaseConnection(cfg).catch(() => {});
  }
  return isFirebaseOnline === true;
};

// Realtime Listener
export const subscribeToFirebase = (config = PERMANENT_FIREBASE_CONFIG, onDataReceived) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
  // If known offline, don't attempt SDK connection
  if (isFirebaseOnline === false) return () => {};

  const db = initFirebase(cfg);
  if (!db) return () => {};

  try {
    const gladiolaRef = ref(db, 'gladiola');
    const unsubscribe = onValue(
      gladiolaRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof onDataReceived === 'function') {
            isFirebaseOnline = true;
            onDataReceived(val);
          }
        }
      },
      (error) => {
        isFirebaseOnline = false;
      }
    );

    return () => {
      off(gladiolaRef);
    };
  } catch (err) {
    return () => {};
  }
};

// Push Data to Firebase (Safe & Non-blocking)
export const pushDataToFirebase = async (config = PERMANENT_FIREBASE_CONFIG, data) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;

  // If Firebase is known to be offline/unprovisioned, exit immediately without blocking
  const isOnline = await checkFirebaseAvailableQuick(cfg);
  if (!isOnline && isFirebaseOnline === false) {
    return false;
  }

  // 1. First try REST with 1.2s timeout (never hangs)
  const urls = [activeUrlUsed, cfg.databaseURL, cfg.fallbackURL].filter(Boolean);
  for (const url of urls) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${cleanUrl}/gladiola.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        activeUrlUsed = cleanUrl;
        isFirebaseOnline = true;
        return true;
      }
    } catch {}
  }

  // 2. Try SDK with strict 1s timeout
  try {
    const db = initFirebase(cfg);
    if (db) {
      const gladiolaRef = ref(db, 'gladiola');
      await Promise.race([
        set(gladiolaRef, data),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 1000))
      ]);
      isFirebaseOnline = true;
      return true;
    }
  } catch {}

  isFirebaseOnline = false;
  lastHealthCheckTime = Date.now();
  return false;
};

// Fetch Once from Firebase (Safe & Non-blocking)
export const fetchOnceFromFirebase = async (config = PERMANENT_FIREBASE_CONFIG) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;

  // If Firebase is known to be offline/unprovisioned, exit immediately without blocking
  const isOnline = await checkFirebaseAvailableQuick(cfg);
  if (!isOnline && isFirebaseOnline === false) {
    return null;
  }

  const urls = [activeUrlUsed, cfg.databaseURL, cfg.fallbackURL].filter(Boolean);
  for (const url of urls) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${cleanUrl}/gladiola.json?t=${Date.now()}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.tenants)) {
          activeUrlUsed = cleanUrl;
          isFirebaseOnline = true;
          return json;
        }
      }
    } catch {}
  }
  isFirebaseOnline = false;
  lastHealthCheckTime = Date.now();
  return null;
};
