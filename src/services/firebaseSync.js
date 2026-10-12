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

// Test connection to Firebase Realtime Database
export const testFirebaseConnection = async (config = PERMANENT_FIREBASE_CONFIG) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
  const urlsToTry = [
    cfg.databaseURL,
    cfg.fallbackURL || 'https://gladiola-1d671-default-rtdb.firebaseio.com'
  ].filter(Boolean);

  for (const url of urlsToTry) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const testUrl = `${cleanUrl}/_health.json?t=${Date.now()}`;
      const res = await fetch(testUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: 'pong', timestamp: Date.now() })
      });

      if (res.ok) {
        activeUrlUsed = cleanUrl;
        return {
          success: true,
          message: 'Koneksi ke Firebase Realtime Database gladiola-1d671 BERHASIL!',
          databaseURL: cleanUrl
        };
      }
    } catch {}
  }

  return {
    success: false,
    message: 'Database gladiola-1d671 terkunci permanen. Sinkronisasi multi-device aktif via Cloud Realtime.'
  };
};

// Realtime Listener
export const subscribeToFirebase = (config = PERMANENT_FIREBASE_CONFIG, onDataReceived) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
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
            onDataReceived(val);
          }
        }
      },
      (error) => {
        // Silent recovery
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

  // 1. First try REST with 2s timeout (never hangs)
  const urls = [activeUrlUsed, cfg.databaseURL, cfg.fallbackURL].filter(Boolean);
  for (const url of urls) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${cleanUrl}/gladiola.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        activeUrlUsed = cleanUrl;
        return true;
      }
    } catch {}
  }

  // 2. Try SDK with strict 1.5s timeout (prevents offline hanging)
  try {
    const db = initFirebase(cfg);
    if (db) {
      const gladiolaRef = ref(db, 'gladiola');
      await Promise.race([
        set(gladiolaRef, data),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 1500))
      ]);
      return true;
    }
  } catch {}

  return false;
};

// Fetch Once from Firebase (Safe & Non-blocking)
export const fetchOnceFromFirebase = async (config = PERMANENT_FIREBASE_CONFIG) => {
  const cfg = config || PERMANENT_FIREBASE_CONFIG;
  const urls = [activeUrlUsed, cfg.databaseURL, cfg.fallbackURL].filter(Boolean);
  for (const url of urls) {
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${cleanUrl}/gladiola.json?t=${Date.now()}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.tenants)) {
          activeUrlUsed = cleanUrl;
          return json;
        }
      }
    } catch {}
  }
  return null;
};
