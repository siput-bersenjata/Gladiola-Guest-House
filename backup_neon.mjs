import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_M3tXQFsS0BAz@ep-holy-sunset-b7w8z4sp-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);

async function run() {
  console.log('Connecting to Neon PostgreSQL...');
  const rows = await sql`
    SELECT id, version, updated_at, data
    FROM gladiola_sync
    WHERE id = 'gladiola_main'
    LIMIT 1
  `;

  if (!rows || rows.length === 0) {
    console.error('No row found with id gladiola_main!');
    return;
  }

  const row = rows[0];
  const payload = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

  console.log('=== NEON DATABASE STATUS ===');
  console.log('ID:', row.id);
  console.log('Version:', row.version);
  console.log('Updated At:', row.updated_at);
  console.log('Rooms count:', payload.rooms?.length);
  console.log('Tenants count:', payload.tenants?.length);
  console.log('Payments count:', payload.payments?.length);
  console.log('Electricity count:', payload.electricityBills?.length);
  console.log('Daily Bookings count:', payload.dailyBookings?.length);
  console.log('Staff count:', payload.staffList?.length);
  console.log('System Accounts count:', payload.systemAccounts?.length);
  console.log('Bank Info:', payload.bankInfo?.bankName, payload.bankInfo?.accountNumber);
  console.log('WiFi Info SSID:', payload.wifiInfo?.ssid);

  // Save to persistent backup file
  const backupData = {
    backupDate: new Date().toISOString(),
    id: row.id,
    version: row.version,
    updatedAt: row.updated_at,
    data: payload
  };

  fs.writeFileSync('database_backup_neon.json', JSON.stringify(backupData, null, 2), 'utf-8');
  console.log('Database snapshot successfully saved to database_backup_neon.json (size: ' + fs.statSync('database_backup_neon.json').size + ' bytes)');
}

run().catch((e) => {
  console.error('Error backing up database:', e);
});
