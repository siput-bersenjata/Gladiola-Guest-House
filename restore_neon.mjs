import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_M3tXQFsS0BAz@ep-holy-sunset-b7w8z4sp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function run() {
  console.log('Restoring database snapshot to Neon PostgreSQL...');
  if (!fs.existsSync('database_backup_neon.json')) {
    console.error('database_backup_neon.json not found!');
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync('database_backup_neon.json', 'utf-8'));
  const version = Number(backup.version || Date.now());
  const now = new Date();
  const payload = backup.data;

  if (!payload || !Array.isArray(payload.tenants) || payload.tenants.length === 0) {
    console.error('Backup data is invalid or empty!');
    process.exit(1);
  }

  await sql`
    INSERT INTO gladiola_sync (id, version, data, updated_at)
    VALUES ('gladiola_main', ${version}, ${payload}, ${now.toISOString()})
    ON CONFLICT (id) DO UPDATE SET
      version = EXCLUDED.version,
      data = EXCLUDED.data,
      updated_at = EXCLUDED.updated_at
  `;

  console.log('Database successfully restored to version ' + version + ' with ' + payload.tenants.length + ' tenants and ' + payload.rooms.length + ' rooms.');
}

run().catch((e) => {
  console.error('Error restoring database:', e);
  process.exit(1);
});
