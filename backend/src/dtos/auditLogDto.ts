export interface AuditLogResponseDto {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: unknown;
  createdAt: string;
}

export interface AuditLogPageDto {
  items: AuditLogResponseDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
