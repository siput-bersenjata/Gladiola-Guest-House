import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { neon } from '@neondatabase/serverless';

const NEON_CONNECTION_STRING =
  'postgresql://neondb_owner:npg_M3tXQFsS0BAz@ep-holy-sunset-b7w8z4sp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(NEON_CONNECTION_STRING);

function syncApiPlugin() {
  return {
    name: 'sync-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/sync')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end();
          }

          if (req.method === 'GET') {
            try {
              const rows = await sql`
                SELECT id, version, data, updated_at
                FROM gladiola_sync
                WHERE id = 'gladiola_main'
                LIMIT 1
              `;
              if (rows.length > 0) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    version: Number(rows[0].version),
                    data: rows[0].data,
                    updatedAt: new Date(rows[0].updated_at).getTime()
                  })
                );
              }
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'No data' }));
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: e.message }));
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                const version = Number(parsed.version || Date.now());
                const now = new Date();
                await sql`
                  INSERT INTO gladiola_sync (id, version, data, updated_at)
                  VALUES ('gladiola_main', ${version}, ${parsed.data}, ${now.toISOString()})
                  ON CONFLICT (id) DO UPDATE SET
                    version = EXCLUDED.version,
                    data = EXCLUDED.data,
                    updated_at = EXCLUDED.updated_at
                `;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, version }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncApiPlugin()],
  base: './'
});
