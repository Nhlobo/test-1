import dayjs from 'dayjs';
import { InviteType, TokenType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { randomCode, randomToken, sha256 } from '../lib/hash.js';
import { env } from '../lib/env.js';

export async function createOneTimeToken(userId: string, type: TokenType, options?: {
  inviteType?: InviteType;
  ttlMinutes?: number;
  ttlHours?: number;
  withCode?: boolean;
}) {
  const token = randomToken();
  const code = options?.withCode ? randomCode(6) : undefined;

  const expiresAt = options?.ttlMinutes
    ? dayjs().add(options.ttlMinutes, 'minute').toDate()
    : dayjs().add(options?.ttlHours ?? env.inviteTtlHours, 'hour').toDate();

  await prisma.oneTimeToken.create({
    data: {
      userId,
      type,
      tokenHash: sha256(token),
      codeHash: code ? sha256(code) : null,
      inviteType: options?.inviteType,
      expiresAt
    }
  });

  return { token, code, expiresAt };
}

export async function consumeToken(params: {
  userId: string;
  type: TokenType;
  token: string;
  code?: string;
}) {
  const record = await prisma.oneTimeToken.findFirst({
    where: {
      userId: params.userId,
      type: params.type,
      tokenHash: sha256(params.token),
      consumedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  if (record.codeHash) {
    if (!params.code || record.codeHash !== sha256(params.code)) return null;
  }

  await prisma.oneTimeToken.update({
    where: { id: record.id },
    data: { consumedAt: new Date() }
  });

  return record;
}
