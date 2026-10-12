import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

const STORAGE_KEY = 'gladiola_firebase_config';

// Sanitize & normalize Firebase configuration
export const sanitizeFirebaseConfig = (config) => {
  if (!config) return null;
  let rawUrl = (config.databaseURL || '').trim();

  // If user accidentally pasted the Firebase Console management URL
  // e.g. https://console.firebase.google.com/u/0/project/gladiola-1d671/overview
  const consoleMatch = rawUrl.match(/project\/([a-zA-Z0-9_-]+)/);
  let extractedProjectId = config.projectId?.trim() || '';
  if (consoleMatch) {
    extractedProjectId = consoleMatch[1];
    rawUrl = `https://${extractedProjectId}-default-rtdb.firebaseio.com`;
  }

  // Ensure protocol and remove trailing slash
  if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
  rawUrl = rawUrl.replace(/\/+$/, '');

  if (!extractedProjectId && rawUrl) {
    const hostMatch = rawUrl.match(/https:\/\/([a-zA-Z0-9_-]+)(?:-default-rtdb)?\./);
    if (hostMatch) extractedProjectId = hostMatch[1];
  }

  return {
    databaseURL: rawUrl,
    projectId: extractedProjectId || 'gladiola-guest-house',
    apiKey: config.apiKey?.trim() || 'AIzaSyGladiolaKosMockApiKey',
    authDomain: config.authDomain || `${extractedProjectId || 'gladiola'}.firebaseapp.com`
  };
};

// Load saved config from localStorage
export const getStoredFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? sanitizeFirebaseConfig(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
};

export const saveStoredFirebaseConfig = (config) => {
  try {
    if (!config) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      const sanitized = sanitizeFirebaseConfig(config);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch (err) {
    console.error('Failed to save firebase config:', err);
  }
};

let currentApp = null;
let currentDb = null;

// Initialize or get existing Firebase instance
export const initFirebase = (config) => {
  const sanitized = sanitizeFirebaseConfig(config);
  if (!sanitized || !sanitized.databaseURL) {
    return null;
  }

  // Prevent initializing with console URL
  if (sanitized.databaseURL.includes('console.firebase.google.com')) {
    return null;
  }

  try {
    const appName = 'gladiola-app';
    const existingApps = getApps();
    const existingApp = existingApps.find((a) => a.name === appName);

    if (existingApp) {
      if (existingApp.options.databaseURL !== sanitized.databaseURL) {
        deleteApp(existingApp);
        currentApp = initializeApp(
          {
            apiKey: sanitized.apiKey,
            authDomain: sanitized.authDomain,
            databaseURL: sanitized.databaseURL,
            projectId: sanitized.projectId
          },
          appName
        );
      } else {
        currentApp = existingApp;
      }
    } else {
      currentApp = initializeApp(
        {
          apiKey: sanitized.apiKey,
          authDomain: sanitized.authDomain,
          databaseURL: sanitized.databaseURL,
          projectId: sanitized.projectId
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
  const sanitized = sanitizeFirebaseConfig(config);
  if (!sanitized || !sanitized.databaseURL) {
    return { success: false, message: 'URL Database Firebase wajib diisi' };
  }

  const cleanUrl = sanitized.databaseURL;

  if (cleanUrl.includes('console.firebase.google.com')) {
    return {
      success: false,
      message: 'URL yang dimasukkan adalah link halaman website Console, bukan URL Database.'
    };
  }

  try {
    // Test direct REST endpoint (fastest and cleanest)
    const testUrl = `${cleanUrl}/_health.json?t=${Date.now()}`;
    const res = await fetch(testUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: 'pong', timestamp: Date.now() })
    });

    if (res.ok) {
      return {
        success: true,
        message: 'Koneksi ke Firebase Realtime Database BERHASIL!',
        databaseURL: cleanUrl
      };
    } else if (res.status === 404) {
      // If it's a default US URL, also try checking Singapore region in case user selected Singapore
      if (cleanUrl.includes('-default-rtdb.firebaseio.com')) {
        const sgUrl = cleanUrl.replace('.firebaseio.com', '.asia-southeast1.firebasedatabase.app');
        try {
          const testSg = await fetch(`${sgUrl}/_health.json?t=${Date.now()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ping: 'pong', timestamp: Date.now() })
          });
          if (testSg.ok) {
            return {
              success: true,
              message: 'Koneksi ke Firebase Realtime Database (Region Singapore) BERHASIL!',
              databaseURL: sgUrl
            };
          }
        } catch {}
      }

      return {
        success: false,
        message: 'Database belum dibuat di Firebase Console! Buka Databases & Storage > Realtime Database, lalu klik tombol "Create Database".'
      };
    } else if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Akses ditolak (Permission Denied). Di Firebase Console > Realtime Database > tab "Rules", ubah .read dan .write menjadi true (atau pilih "Start in test mode").'
      };
    } else {
      return {
        success: false,
        message: `HTTP ${res.status}: Periksa status database Anda di Firebase Console.`
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Gagal menghubungi server (${err.message}). Pastikan database sudah dibuat di Firebase Console.`
    };
  }
};

// Realtime Listener
export const subscribeToFirebase = (config, onDataReceived) => {
  const sanitized = sanitizeFirebaseConfig(config);
  if (!sanitized) return () => {};

  const db = initFirebase(sanitized);
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
  const sanitized = sanitizeFirebaseConfig(config);
  if (!sanitized || !sanitized.databaseURL) return false;

  const db = initFirebase(sanitized);
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
    const cleanUrl = sanitized.databaseURL;
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
  const sanitized = sanitizeFirebaseConfig(config);
  if (!sanitized || !sanitized.databaseURL) return null;

  try {
    const cleanUrl = sanitized.databaseURL;
    const res = await fetch(`${cleanUrl}/gladiola.json?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Firebase fetchOnce error:', err);
    return null;
  }
};
