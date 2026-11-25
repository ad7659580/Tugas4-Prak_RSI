import type { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService.ts';
import { getValidated } from '../middlewares/validate.ts';
import type { AuditLogIdParam, AuditLogQuery } from '../schemas/auditLogSchema.ts';

export class AuditLogController {
  constructor(private auditLogService: AuditLogService = new AuditLogService()) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = getValidated<AuditLogQuery>(res, 'query');
    const data = await this.auditLogService.list(query);
    res.status(200).json({ status: 'success', data });
  };

  getById = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<AuditLogIdParam>(res, 'params');
    const data = await this.auditLogService.getById(id);
    res.status(200).json({ status: 'success', data });
  };
}
