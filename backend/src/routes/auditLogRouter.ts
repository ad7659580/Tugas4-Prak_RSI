import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.ts';
import { validate } from '../middlewares/validate.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { auditLogIdParamSchema, auditLogQuerySchema } from '../schemas/auditLogSchema.ts';

const auditLogRouter = Router();
const auditLogController = new AuditLogController();

// Seluruh endpoint audit hanya untuk admin. Tidak ada endpoint tulis/ubah/hapus:
// audit ditulis oleh backend sendiri (append-only).
auditLogRouter.use(authenticate, authorize('admin'));

auditLogRouter.get('/', validate(auditLogQuerySchema, 'query'), auditLogController.getAll);
auditLogRouter.get('/:id', validate(auditLogIdParamSchema, 'params'), auditLogController.getById);

export { auditLogRouter };
