import { AuthUser } from '../types/session';

export function decodeJwt<T = Record<string, any>>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem('accessToken');
}

export function getAuthUser(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;
  return decodeJwt<AuthUser>(token);
}

export function isTokenExpired(user: AuthUser | null) {
  if (!user?.exp) return true;
  return Date.now() >= user.exp * 1000;
}

export function isAuthenticated() {
  const user = getAuthUser();
  return !!user && !isTokenExpired(user);
}

export function hasAnyRole(allowedRoles: string[], role?: string) {
  if (!role) return false;
  return allowedRoles.includes(role);
}
