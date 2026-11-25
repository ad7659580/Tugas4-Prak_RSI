export type Role = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular: boolean;
}

export interface StallInput {
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
}

export interface StallQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface Paged<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface LoginResult {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: User;
}

/** Bentuk error backend: { status: 'fail', message, errors?: [{ field, message }] } */
export interface FieldIssue {
  field: string;
  message: string;
}

// ---- Audit log (Tugas 5) ----
export interface AuditMetadata {
  role?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  result?: string;
  [key: string]: unknown;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: AuditMetadata | string | null;
  createdAt: string;
}

export interface AuditPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuditLogList {
  items: AuditLog[];
  pagination: AuditPagination;
}

export interface AuditFilters {
  action: string;
  targetTable: string;
  targetId: string;
  userId: string;
  from: string;
  to: string;
}
