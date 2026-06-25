import dayjs from 'dayjs';
import { InviteType, Role, TokenType, UserStatus, UserType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { hashPassword, sha256, verifyPassword } from '../lib/hash.js';
import { createOneTimeToken, consumeToken } from './token.service.js';
import { createSession } from './session.service.js';
import { sendEmail } from '../lib/mailer.js';
import { getDeviceName } from '../lib/device.js';
import { generateMfaQrDataUrl, generateMfaSecret, verifyMfaToken } from '../lib/mfa.js';

export async function adminInviteUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  userType: UserType;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      userType: input.userType,
      status: UserStatus.PENDING_INVITE,
      externalAccessActive: input.userType === UserType.EXTERNAL
    },
    create: {
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      userType: input.userType,
      status: UserStatus.PENDING_INVITE,
      externalAccessActive: input.userType === UserType.EXTERNAL
    }
  });

  const inviteType =
    input.userType === UserType.INTERNAL
      ? InviteType.INTERNAL_ACCOUNT_SETUP
      : InviteType.EXTERNAL_DASHBOARD_ACCESS;

  const { token, code, expiresAt } = await createOneTimeToken(user.id, TokenType.INVITE, {
    inviteType,
    ttlHours: env.inviteTtlHours,
    withCode: input.userType === UserType.EXTERNAL
  });

  const inviteLink = `${env.appUrl}/accept-invite?token=${token}&email=${encodeURIComponent(user.email)}`;

  await sendEmail(
    user.email,
    'Your access invitation',
    `
      <p>Hello ${user.firstName},</p>
      <p>Use this link: <a href="${inviteLink}">${inviteLink}</a></p>
      ${code ? `<p>Your access code: <strong>${code}</strong></p>` : ''}
      <p>Expires: ${expiresAt.toISOString()}</p>
    `
  );

  return { user, inviteLink, code, expiresAt };
}

export async function acceptInvite(params: {
  email: string;
  token: string;
  code?: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: params.email.toLowerCase() }
  });

  if (!user) throw new Error('Invalid invite');

  const consumed = await consumeToken({
    userId: user.id,
    type: TokenType.INVITE,
    token: params.token,
    code: params.code
  });

  if (!consumed) throw new Error('Invite is invalid or expired');

  const passwordHash = await hashPassword(params.password);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      status: UserStatus.ACTIVE,
      inviteConsumedAt: new Date(),
      emailVerifiedAt: new Date(),
      externalAccessActive: user.userType === UserType.EXTERNAL ? true : user.externalAccessActive
    }
  });

  return updated;
}

export async function login(params: {
  email: string;
  password: string;
  mfaToken?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const email = params.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await prisma.loginHistory.create({
      data: { email, success: false, reason: 'USER_NOT_FOUND', ipAddress: params.ipAddress, userAgent: params.userAgent }
    });
    throw new Error('Invalid credentials');
  }

  if (user.status === UserStatus.DISABLED || user.status === UserStatus.SUSPENDED) {
    throw new Error('Account is inactive');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error('Account is locked');
  }

  if (!user.passwordHash) {
    throw new Error('Account setup required');
  }

  const ok = await verifyPassword(user.passwordHash, params.password);

  if (!ok) {
    const failedCount = user.failedLoginAttempts + 1;
    const lockNow = failedCount >= env.maxFailedLoginAttempts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedCount,
        lockedUntil: lockNow ? dayjs().add(env.accountLockMinutes, 'minute').toDate() : null,
        status: lockNow ? UserStatus.LOCKED : user.status
      }
    });

    await prisma.loginHistory.create({
      data: { userId: user.id, email, success: false, reason: 'INVALID_PASSWORD', ipAddress: params.ipAddress, userAgent: params.userAgent }
    });

    throw new Error(lockNow ? 'Account locked' : 'Invalid credentials');
  }

  if (user.userType === UserType.EXTERNAL && !user.externalAccessActive) {
    throw new Error('External access disabled');
  }

  if (user.mfaEnabled) {
    if (!params.mfaToken || !user.mfaSecret || !verifyMfaToken(user.mfaSecret, params.mfaToken)) {
      throw new Error('Invalid MFA token');
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date()
    }
  });

  await prisma.loginHistory.create({
    data: { userId: user.id, email, success: true, reason: 'LOGIN_SUCCESS', ipAddress: params.ipAddress, userAgent: params.userAgent }
  });

  const deviceName = getDeviceName(params.userAgent);

  return createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    userType: user.userType,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    deviceName
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;

  const { token, expiresAt } = await createOneTimeToken(user.id, TokenType.PASSWORD_RESET, {
    ttlMinutes: env.passwordResetTtlMinutes
  });

  const link = `${env.appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  await sendEmail(
    user.email,
    'Reset your password',
    `<p>Reset here: <a href="${link}">${link}</a></p><p>Expires: ${expiresAt.toISOString()}</p>`
  );
}

export async function resetPassword(params: {
  email: string;
  token: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({ where: { email: params.email.toLowerCase() } });
  if (!user) throw new Error('Invalid request');

  const consumed = await consumeToken({
    userId: user.id,
    type: TokenType.PASSWORD_RESET,
    token: params.token
  });

  if (!consumed) throw new Error('Reset link invalid or expired');

  const passwordHash = await hashPassword(params.password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      status: UserStatus.ACTIVE
    }
  });
}

export async function setupMfa(userId: string, email: string) {
  const secret = generateMfaSecret(email, env.mfaIssuer);
  const qrCodeDataUrl = await generateMfaQrDataUrl(secret.otpauth_url!);

  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret.base32 }
  });

  return {
    secret: secret.base32,
    qrCodeDataUrl
  };
}

export async function verifyAndEnableMfa(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.mfaSecret) throw new Error('MFA not initialized');

  const valid = verifyMfaToken(user.mfaSecret, token);
  if (!valid) throw new Error('Invalid MFA token');

  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true }
  });
}

export async function revokeSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() }
  });
}

export async function getLoginHistory(userId: string) {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

export async function listSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function disableExternalAccess(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { externalAccessActive: false }
  });
}

export async function enableExternalAccess(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { externalAccessActive: true }
  });
}
