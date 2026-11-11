// Tugas 4: seed 03-seed-full.sql memakai password_hash placeholder ('hash_admin', dst.)
// sehingga akun seed tidak bisa login. Script ini mengganti hash-nya dengan hash bcrypt
// asli dari password demo. Aman dijalankan berulang.
//
// Jalankan dari folder backend:  npm run seed:demo
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { getDb } from '../src/db/index.ts';

const DEMO_PASSWORD = 'Kantin12345';

const DEMO_ACCOUNTS: { email: string; role: 'admin' | 'owner' | 'customer' }[] = [
  { email: 'admin@kantin.test', role: 'admin' },
  { email: 'tini@kantin.test', role: 'owner' }, // pemilik warung id 1
  { email: 'slamet@kantin.test', role: 'owner' }, // pemilik warung id 3
  { email: 'bagas@student.test', role: 'customer' },
];

async function main() {
  const db = await getDb();
  const hash = await bcrypt.hash(DEMO_PASSWORD, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
  for (const acc of DEMO_ACCOUNTS) {
    await db.execute(
      sql`UPDATE dbo.USERS SET password_hash = ${hash} WHERE email = ${acc.email} AND role = ${acc.role}`,
    );
    console.log(`OK  ${acc.role.padEnd(8)} ${acc.email}`);
  }
  console.log(`\nPassword semua akun demo: ${DEMO_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
