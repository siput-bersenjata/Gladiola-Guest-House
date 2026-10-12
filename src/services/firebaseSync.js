import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

const STORAGE_KEY = 'gladiola_firebase_config';

// Load saved config from localStorage
export const getStoredFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveStoredFirebaseConfig = (config) => {
  try {
    if (!config) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch (err) {
    console.error('Failed to save firebase config:', err);
  }
};

let currentApp = null;
let currentDb = null;
let activeListenerRef = null;

// Initialize or get existing Firebase instance
export const initFirebase = (config) => {
  if (!config || !config.databaseURL) {
    return null;
  }

  try {
    const appName = 'gladiola-app';
    const existingApps = getApps();
    const app = existingApps.find((a) => a.name === appName);

    if (app) {
      currentApp = app;
    } else {
      currentApp = initializeApp(
        {
          apiKey: config.apiKey || 'AIzaSyGladiolaKosMockApiKey',
          authDomain: config.authDomain || `${config.projectId || 'gladiola'}.firebaseapp.com`,
          databaseURL: config.databaseURL.replace(/\/+$/, ''),
          projectId: config.projectId || 'gladiola-guest-house'
        },
        appName
      );
    }

    currentDb = getDatabase(currentApp);
    return currentDb;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
};

// Test connection to Firebase Realtime Database
export const testFirebaseConnection = async (config) => {
  if (!config || !config.databaseURL) {
    return { success: false, message: 'URL Database Firebase wajib diisi' };
  }

  const cleanUrl = config.databaseURL.replace(/\/+$/, '');

  try {
    // Test direct REST endpoint (fastest and cleanest)
    const testUrl = `${cleanUrl}/_health.json?t=${Date.now()}`;
    const res = await fetch(testUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: 'pong', timestamp: Date.now() })
    });

    if (res.ok) {
      return { success: true, message: 'Koneksi ke Firebase Realtime Database BERHASIL!' };
    } else {
      return {
        success: false,
        message: `HTTP ${res.status}: Pastikan Realtime Database Rules disetel ke ".read": true, ".write": true`
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Gagal menghubungi server: ${err.message}`
    };
  }
};

// Realtime Listener
export const subscribeToFirebase = (config, onDataReceived) => {
  const db = initFirebase(config);
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
        console.warn('Firebase onValue listener error:', error);
      }
    );

    return () => {
      off(gladiolaRef);
    };
  } catch (err) {
    console.error('Error attaching Firebase realtime listener:', err);
    return () => {};
  }
};

// Push Data to Firebase
export const pushDataToFirebase = async (config, data) => {
  if (!config || !config.databaseURL) return false;

  const db = initFirebase(config);
  if (db) {
    try {
      const gladiolaRef = ref(db, 'gladiola');
      await set(gladiolaRef, data);
      return true;
    } catch (err) {
      console.warn('Firebase SDK set failed, trying REST fallback:', err);
    }
  }

  // REST fallback
  try {
    const cleanUrl = config.databaseURL.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/gladiola.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.error('Firebase REST push error:', err);
    return false;
  }
};

// Fetch Once from Firebase
export const fetchOnceFromFirebase = async (config) => {
  if (!config || !config.databaseURL) return null;

  try {
    const cleanUrl = config.databaseURL.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/gladiola.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Firebase fetchOnce error:', err);
    return null;
  }
};
