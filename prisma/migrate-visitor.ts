import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * One-time migration for the Visitor table primary-key change (ip -> id).
 *
 * `prisma db push` cannot add a required column with a Prisma-level default
 * (uuid()) to a non-empty table, and `--accept-data-loss` does not cover it —
 * only `--force-reset` would, which would also wipe dhikr/audio/settings.
 * So we drop just the old `visitor` table here (analytics reset) and let
 * `prisma db push` recreate it with the new schema.
 *
 * Idempotent: no-ops when the table is missing or already migrated.
 */
async function main() {
  const rows = await prisma.$queryRawUnsafe<Array<{ sql: string | null }>>(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'visitor'"
  );

  if (rows.length === 0) {
    console.log('[migrate-visitor] no visitor table yet; nothing to do');
    return;
  }

  const sql = rows[0]?.sql || '';
  if (sql.includes('"id" TEXT NOT NULL PRIMARY KEY')) {
    console.log('[migrate-visitor] visitor table already on id PK; nothing to do');
    return;
  }

  console.log('[migrate-visitor] legacy visitor schema detected; dropping table for recreate');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "visitor"');
  console.log('[migrate-visitor] dropped; prisma db push will recreate it');
}

main()
  .catch((e) => {
    console.error('[migrate-visitor] failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
