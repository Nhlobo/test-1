import { Router } from 'express';
import { Role, UserStatus, UserType } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import {
  activateUser,
  adminInviteUser,
  disableExternalAccess,
  enableExternalAccess,
  revokeAllUserSessions,
  updateUserStatus
} from '../services/auth.service.js';
import { prisma } from '../lib/prisma.js';
import { permissions } from '../lib/permissions.js';

const router = Router();

router.use(requireAuth);

router.get('/permissions', async (req, res) => {
  const role = req.auth!.role;

  const granted = Object.entries(permissions)
    .filter(([, roles]) => roles.includes(role))
    .map(([key]) => key);

  res.json({
    role,
    permissions: granted
  });
});

router.get('/users', requirePermission('manage_users'), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      userType: true,
      status: true,
      externalAccessActive: true,
      emailVerifiedAt: true,
      mfaEnabled: true,
      lastLoginAt: true,
      createdAt: true
    }
  });

  res.json(users);
});

router.post('/users/invite', requirePermission('invite_users'), async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.nativeEnum(Role),
      userType: z.nativeEnum(UserType)
    }).parse(req.body);

    if (body.role === Role.SUPER_ADMIN && req.auth!.role !== Role.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Only super administrators can create super administrators' });
    }

    const result = await adminInviteUser(body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invite failed' });
  }
});

router.post('/users/:userId/external-access/disable', requirePermission('manage_external_access'), async (req, res) => {
  const user = await disableExternalAccess(req.params.userId);
  res.json(user);
});

router.post('/users/:userId/external-access/enable', requirePermission('manage_external_access'), async (req, res) => {
  const user = await enableExternalAccess(req.params.userId);
  res.json(user);
});

router.post('/users/:userId/suspend', requirePermission('suspend_users'), async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target.role === Role.SUPER_ADMIN && req.auth!.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Only super administrators can suspend super administrators' });
  }

  const user = await updateUserStatus(req.params.userId, UserStatus.SUSPENDED);
  await revokeAllUserSessions(req.params.userId);
  res.json(user);
});

router.post('/users/:userId/disable', requirePermission('disable_users'), async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target.role === Role.SUPER_ADMIN && req.auth!.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Only super administrators can disable super administrators' });
  }

  const user = await updateUserStatus(req.params.userId, UserStatus.DISABLED);
  await revokeAllUserSessions(req.params.userId);
  res.json(user);
});

router.post('/users/:userId/activate', requirePermission('manage_users'), async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target.role === Role.SUPER_ADMIN && req.auth!.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Only super administrators can activate super administrators' });
  }

  const user = await activateUser(req.params.userId);
  res.json(user);
});

export default router;
