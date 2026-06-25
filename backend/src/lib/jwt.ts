import jwt from 'jsonwebtoken';
import { env } from './env.js';

export type AccessPayload = {
  sub: string;
  email: string;
  role: string;
  userType: string;
  sessionId: string;
  deviceId?: string;
};

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessExpiresIn });
}

export function signRefreshToken(payload: { sub: string; sessionId: string; deviceId?: string }) {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshExpiresIn });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.accessSecret) as AccessPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.refreshSecret) as {
    sub: string;
    sessionId: string;
    deviceId?: string;
  };
}
