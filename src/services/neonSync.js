import { neon } from '@neondatabase/serverless';

// Neon connection string for Gladiola Cloud Database
export const NEON_CONNECTION_STRING =
  'postgresql://neondb_owner:npg_M3tXQFsS0BAz@ep-holy-sunset-b7w8z4sp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

let sqlClient = null;

export const getSqlClient = () => {
  if (!sqlClient) {
    try {
      sqlClient = neon(NEON_CONNECTION_STRING);
    } catch (e) {
      console.warn('Failed to initialize Neon SQL client:', e);
    }
  }
  return sqlClient;
};

// Test connection
export const testNeonConnection = async () => {
  try {
    const sql = getSqlClient();
    if (!sql) return { success: false, message: 'SQL client not initialized' };
    const res = await sql`SELECT 1 as ping`;
    return { success: res?.[0]?.ping === 1, message: 'Koneksi ke Neon PostgreSQL Cloud Database Berhasil!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// Fetch latest database snapshot
export const fetchFromNeon = async () => {
  // 1. Try local or Vercel serverless /api/sync endpoint first (fastest)
  if (typeof window !== 'undefined' && window.location) {
    try {
      const res = await fetch(`/api/sync?t=${Date.now()}&_r=${Math.random()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return {
            ...json.data,
            version: Number(json.version || json.data.version || 1),
            updatedAt: Number(json.updatedAt || json.data.updatedAt || Date.now())
          };
        }
      }
    } catch {
      // Fall through to direct Neon SQL
    }
  }

  // 2. Direct HTTP SQL query using Neon Serverless Driver (Works cross-origin with CORS)
  try {
    const sql = getSqlClient();
    if (!sql) return null;
    const rows = await sql`
      SELECT id, version, data, updated_at
      FROM gladiola_sync
      WHERE id = 'gladiola_main'
      LIMIT 1
    `;
    if (rows && rows.length > 0 && rows[0].data) {
      const row = rows[0];
      const payload = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      return {
        ...payload,
        version: Number(row.version || payload.version || 1),
        updatedAt: new Date(row.updated_at).getTime()
      };
    }
  } catch (err) {
    console.warn('Direct Neon fetch warning:', err);
  }
  return null;
};

// Push database snapshot to Neon
export const pushToNeon = async (payload) => {
  if (!payload) return false;
  const version = Number(payload.version || Date.now());
  const now = new Date();

  // 1. Try /api/sync endpoint
  if (typeof window !== 'undefined' && window.location) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, data: payload })
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Fall through to direct Neon SQL
    }
  }

  // 2. Direct HTTP SQL upsert using Neon Serverless Driver
  try {
    const sql = getSqlClient();
    if (!sql) return false;
    await sql`
      INSERT INTO gladiola_sync (id, version, data, updated_at)
      VALUES ('gladiola_main', ${version}, ${payload}, ${now.toISOString()})
      ON CONFLICT (id) DO UPDATE SET
        version = EXCLUDED.version,
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at
    `;
    return true;
  } catch (err) {
    console.error('Direct Neon push error:', err);
    return false;
  }
};
