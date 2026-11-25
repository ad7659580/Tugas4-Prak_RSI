import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { auditLogs, users } from '../db/schema.ts';
import type { AuditLogQuery } from '../schemas/auditLogSchema.ts';

export interface AuditEntry {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: Record<string, unknown> | null;
}

const selection = {
  id: auditLogs.id,
  userId: auditLogs.userId,
  userName: users.name,
  userEmail: users.email,
  action: auditLogs.action,
  targetTable: auditLogs.targetTable,
  targetId: auditLogs.targetId,
  metadata: auditLogs.metadata,
  createdAt: auditLogs.createdAt,
};

export class AuditLogRepository {
  /** Satu-satunya cara menulis audit: INSERT (append-only). Query berparameter via Drizzle. */
  async insert(entry: AuditEntry): Promise<void> {
    const db = await getDb();
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      targetTable: entry.targetTable,
      targetId: entry.targetId,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });
  }

  async findPage(query: AuditLogQuery) {
    const db = await getDb();

    // Semua filter digabung dengan AND
    const conditions: SQL[] = [];
    if (query.action) conditions.push(eq(auditLogs.action, query.action));
    if (query.targetTable) conditions.push(eq(auditLogs.targetTable, query.targetTable));
    if (query.targetId !== undefined) conditions.push(eq(auditLogs.targetId, query.targetId));
    if (query.userId !== undefined) conditions.push(eq(auditLogs.userId, query.userId));
    // from: awal hari (inklusif). to: akhir hari (inklusif) = sebelum awal hari berikutnya.
    if (query.from) {
      conditions.push(sql`${auditLogs.createdAt} >= CAST(${query.from} AS DATETIME2(0))`);
    }
    if (query.to) {
      conditions.push(
        sql`${auditLogs.createdAt} < DATEADD(DAY, 1, CAST(${query.to} AS DATETIME2(0)))`,
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (query.page - 1) * query.pageSize;

    // Pagination dilakukan di database (OFFSET ... FETCH NEXT)
    const items = await db
      .select(selection)
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .offset(offset)
      .fetch(query.pageSize);

    // Total dihitung dari baris yang lolos filter, bukan seluruh tabel
    const totals = await db.select({ total: count() }).from(auditLogs).where(where);

    return { items, total: Number(totals[0]?.total ?? 0) };
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(selection)
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id));
    return rows[0];
  }
}
