import { z } from 'zod';

// Tanggal harus berformat YYYY-MM-DD DAN benar-benar ada di kalender (mis. 2026-02-30 ditolak).
function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

const dateParam = (name: string) =>
  z
    .string({ invalid_type_error: `${name} harus berupa teks` })
    .refine(isRealDate, `${name} harus tanggal valid berformat YYYY-MM-DD`)
    .optional();

const positiveInt = (name: string) =>
  z.coerce
    .number({ invalid_type_error: `${name} harus berupa angka` })
    .int(`${name} harus bilangan bulat`)
    .positive(`${name} harus bilangan bulat positif`)
    .optional();

export const auditLogQuerySchema = z
  .object({
    page: z.coerce
      .number({ invalid_type_error: 'page harus berupa angka' })
      .int('page harus bilangan bulat')
      .min(1, 'page minimal 1')
      .default(1),
    pageSize: z.coerce
      .number({ invalid_type_error: 'pageSize harus berupa angka' })
      .int('pageSize harus bilangan bulat')
      .min(1, 'pageSize minimal 1')
      .max(100, 'pageSize maksimal 100')
      .default(20),
    action: z.string().trim().max(50, 'action maksimal 50 karakter').optional(),
    targetTable: z.string().trim().max(50, 'targetTable maksimal 50 karakter').optional(),
    targetId: positiveInt('targetId'),
    userId: positiveInt('userId'),
    from: dateParam('from'),
    to: dateParam('to'),
  })
  // Parameter yang tidak dikenal ditolak 400
  .strict({ message: 'Parameter query tidak dikenal' })
  .superRefine((q, ctx) => {
    if (q.from && q.to && isRealDate(q.from) && isRealDate(q.to) && q.from > q.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['from'],
        message: 'from tidak boleh lebih besar dari to',
      });
    }
  });

export const auditLogIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'id harus berupa angka' })
    .int('id harus bilangan bulat')
    .positive('id harus lebih dari 0'),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type AuditLogIdParam = z.infer<typeof auditLogIdParamSchema>;
