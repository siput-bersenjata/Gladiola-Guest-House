import { neon } from '@neondatabase/serverless';

const sql = neon(
  process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_M3tXQFsS0BAz@ep-holy-sunset-b7w8z4sp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require'
);

export default async function handler(req, res) {
  // Universal CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, version, data, updated_at
        FROM gladiola_sync
        WHERE id = 'gladiola_main'
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        const row = rows[0];
        const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return res.status(200).json({
          version: Number(row.version),
          data,
          updatedAt: new Date(row.updated_at).getTime()
        });
      }
      return res.status(404).json({ error: 'No data initialized yet' });
    } catch (err) {
      console.error('GET /api/sync error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {}
      }
      const { version, data } = body || {};
      if (!data) return res.status(400).json({ error: 'Missing data payload' });

      // Safety guard: Reject empty or corrupt payloads to protect production database
      if (!Array.isArray(data.tenants) || data.tenants.length < 3 || !Array.isArray(data.rooms) || data.rooms.length === 0) {
        return res.status(400).json({ error: 'Invalid or incomplete data payload: database update rejected for safety' });
      }

      const newVersion = Number(version || Date.now());
      const now = new Date();

      await sql`
        INSERT INTO gladiola_sync (id, version, data, updated_at)
        VALUES ('gladiola_main', ${newVersion}, ${data}, ${now.toISOString()})
        ON CONFLICT (id) DO UPDATE SET
          version = EXCLUDED.version,
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at
        WHERE EXCLUDED.version >= gladiola_sync.version
      `;

      return res.status(200).json({ success: true, version: newVersion });
    } catch (err) {
      console.error('POST /api/sync error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
