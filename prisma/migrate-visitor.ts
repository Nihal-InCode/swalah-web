import { PrismaClient } from '@prisma/client';
import { isMergeableDevice } from '../src/lib/device-names';

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
 * When the table is already on the new schema, also merge duplicate rows
 * that represent the same physical device (same IP + same specific device
 * name but split across visitor ids): keep the most recently seen row,
 * sum usage/visits, delete the rest.
 *
 * Idempotent: no-ops when the table is missing, already migrated with no
 * duplicates, or on a fresh database.
 */
async function dedupeSameDevice() {
  const visitors = await prisma.visitor.findMany({ orderBy: { lastSeen: 'desc' } });
  const groups = new Map<string, typeof visitors>();
  for (const v of visitors) {
    if (!v.ip || v.ip === 'unknown' || !isMergeableDevice(v.device)) continue;
    const key = `${v.ip}|${v.device}`;
    const group = groups.get(key);
    if (group) group.push(v);
    else groups.set(key, [v]);
  }

  let removed = 0;
  for (const rows of groups.values()) {
    if (rows.length < 2) continue;

    const [keep, ...rest] = rows;
    const totalUsageSeconds = rows.reduce((s, r) => s + r.totalUsageSeconds, 0);
    const visits = rows.reduce((s, r) => s + r.visits, 0);
    const todayUsageSeconds = rows
      .filter((r) => r.todayDate === keep.todayDate)
      .reduce((s, r) => s + r.todayUsageSeconds, 0);
    const firstVisitMs = Math.min(...rows.map((r) => new Date(r.lastVisit).getTime()));

    await prisma.$transaction([
      prisma.visitor.update({
        where: { id: keep.id },
        data: {
          totalUsageSeconds,
          visits,
          todayUsageSeconds,
          lastVisit: new Date(firstVisitMs),
        },
      }),
      prisma.visitor.deleteMany({ where: { id: { in: rest.map((r) => r.id) } } }),
    ]);
    removed += rest.length;
    console.log(
      `[migrate-visitor] merged ${rows.length} rows for "${keep.device}" @ ${keep.ip} -> 1 row`
    );
  }

  if (removed === 0) console.log('[migrate-visitor] no duplicate device rows to merge');
}

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
    console.log('[migrate-visitor] visitor table already on id PK');
    await dedupeSameDevice();
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
