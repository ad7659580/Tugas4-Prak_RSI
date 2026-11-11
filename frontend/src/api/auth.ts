import { http } from './client';
import type { LoginResult, User } from '../types';

export async function register(input: { name: string; email: string; password: string }): Promise<User> {
  const res = await http.post<{ data: { user: User } }>('/auth/register', input);
  return res.data.data.user;
}

export async function login(input: { email: string; password: string }): Promise<LoginResult> {
  const res = await http.post<{ data: LoginResult }>('/auth/login', input);
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await http.get<{ data: User }>('/auth/me');
  return res.data.data;
}
