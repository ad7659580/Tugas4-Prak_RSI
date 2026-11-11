import { http } from './client';
import type { Paged, Stall, StallInput, StallQuery } from '../types';

export async function getStalls(query: StallQuery, signal?: AbortSignal): Promise<Paged<Stall>> {
  // query parameter: search, category, page, limit (kosong tidak dikirim)
  const params: Record<string, string | number> = {};
  if (query.search) params.search = query.search;
  if (query.category) params.category = query.category;
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  const res = await http.get<Paged<Stall>>('/stalls', { params, signal });
  return res.data;
}

export async function getStall(id: number, signal?: AbortSignal): Promise<Stall> {
  const res = await http.get<{ data: Stall }>(`/stalls/${id}`, { signal });
  return res.data.data;
}

export async function createStall(input: StallInput): Promise<Stall> {
  const res = await http.post<{ data: Stall }>('/stalls', input);
  return res.data.data;
}

export async function updateStall(id: number, input: Partial<StallInput>): Promise<Stall> {
  const res = await http.put<{ data: Stall }>(`/stalls/${id}`, input);
  return res.data.data;
}

export async function deleteStall(id: number): Promise<void> {
  await http.delete(`/stalls/${id}`);
}
