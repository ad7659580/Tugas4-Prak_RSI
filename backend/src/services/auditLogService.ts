import { AuditLogRepository } from '../repositories/auditLogRepository.ts';
import type { AuditLogPageDto, AuditLogResponseDto } from '../dtos/auditLogDto.ts';
import type { AuditLogQuery } from '../schemas/auditLogSchema.ts';
import type { RequestContext } from '../utils/requestContext.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';

type AuditRow = NonNullable<Awaited<ReturnType<AuditLogRepository['findById']>>>;

export type AuthResult = 'success' | 'failed';

interface AuditActor {
  id: number;
  role: string;
}

function parseMetadata(raw: string | null): unknown {
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// created_at disimpan UTC (datetime2 tanpa zona). Pastikan keluar sebagai ISO 8601 UTC.
function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(text) ? text : `${text.replace(' ', 'T')}Z`).toISOString();
}

export class AuditLogService {
  constructor(private auditLogRepository: AuditLogRepository = new AuditLogRepository()) {}

  private toDto(row: AuditRow): AuditLogResponseDto {
    return {
      id: row.id,
      userId: row.userId,
      userName: row.userName ?? null,
      userEmail: row.userEmail ?? null,
      action: row.action,
      targetTable: row.targetTable,
      targetId: row.targetId,
      metadata: parseMetadata(row.metadata),
      createdAt: toIso(row.createdAt),
    };
  }

  /**
   * LOGIN/LOGOUT bersifat best-effort: bila penulisan audit gagal, error hanya
   * dicatat di log server dan autentikasi TETAP berhasil.
   * Metadata tidak pernah memuat password, token, atau cookie.
   */
  async recordAuth(
    action: 'LOGIN' | 'LOGOUT',
    actor: AuditActor,
    ctx: RequestContext,
    result: AuthResult,
  ): Promise<void> {
    try {
      await this.auditLogRepository.insert({
        userId: actor.id,
        action,
        targetTable: 'USERS',
        targetId: actor.id,
        metadata: {
          role: actor.role,
          ip_address: ctx.ipAddress,
          user_agent: ctx.userAgent,
          result,
        },
      });
    } catch (error) {
      console.error(`Audit ${action} gagal dicatat:`, error);
    }
  }

  async list(query: AuditLogQuery): Promise<AuditLogPageDto> {
    const { items, total } = await this.auditLogRepository.findPage(query);
    return {
      items: items.map((row) => this.toDto(row)),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  async getById(id: number): Promise<AuditLogResponseDto> {
    const row = await this.auditLogRepository.findById(id);
    if (!row) throw new NotFoundError('Catatan audit tidak ditemukan');
    return this.toDto(row);
  }
}
