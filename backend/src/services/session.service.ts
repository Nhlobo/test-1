import crypto from 'crypto';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { sha256 } from '../lib/hash.js';
import { makeDeviceId } from '../lib/device.js';

export async function createSession(params: {
  userId: string;
  email: string;
  role: string;
  userType: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  deviceId?: string;
  trustedDevice?: boolean;
}) {
  const sessionSeed = crypto.randomUUID();
  const deviceId = params.deviceId || makeDeviceId();

  await prisma.device.upsert({
    where: { deviceId },
    update: {
      name: params.deviceName,
      lastSeenAt: new Date(),
      trusted: params.trustedDevice ?? false
    },
    create: {
      userId: params.userId,
      deviceId,
      name: params.deviceName,
      trusted: params.trustedDevice ?? false,
      lastSeenAt: new Date()
    }
  });

  const refreshToken = signRefreshToken({
    sub: params.userId,
    sessionId: sessionSeed,
    deviceId
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
    sessionId: session.id,
    deviceId
  });

  return { session, accessToken, refreshToken, deviceId };
}

export async function rotateRefreshToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new Error('Session invalid');
  }

  if (session.refreshTokenHash !== sha256(refreshToken)) {
    throw new Error('Refresh token invalid');
  }

  const newRefreshToken = signRefreshToken({
    sub: session.userId,
    sessionId: session.id,
    deviceId: payload.deviceId
  });

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: sha256(newRefreshToken),
      expiresAt: dayjs().add(7, 'day').toDate()
    }
  });

  const accessToken = signAccessToken({
    sub: session.user.id,
    email: session.user.email,
    role: session.user.role,
    userType: session.user.userType,
    sessionId: session.id,
    deviceId: payload.deviceId
  });

  if (payload.deviceId) {
    await prisma.device.updateMany({
      where: { deviceId: payload.deviceId, userId: session.user.id },
      data: { lastSeenAt: new Date() }
    });
  }

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
}
