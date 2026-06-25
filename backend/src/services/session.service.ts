import dayjs from 'dayjs';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken } from '../lib/jwt.js';
import { sha256 } from '../lib/hash.js';

export async function createSession(params: {
  userId: string;
  email: string;
  role: string;
  userType: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
}) {
  const sessionSeed = crypto.randomUUID();

  const refreshToken = signRefreshToken({
    sub: params.userId,
    sessionId: sessionSeed
  });

  const session = await prisma.session.create({
    data: {
      id: sessionSeed,
      userId: params.userId,
      refreshTokenHash: sha256(refreshToken),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceName: params.deviceName,
      expiresAt: dayjs().add(7, 'day').toDate()
    }
  });

  const accessToken = signAccessToken({
    sub: params.userId,
    email: params.email,
    role: params.role,
    userType: params.userType,
    sessionId: session.id
  });

  return { session, accessToken, refreshToken };
}
