import { Router } from 'express';
import { Role, UserType } from '@prisma/client';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';
import { adminInviteUser, disableExternalAccess, enableExternalAccess } from '../services/auth.service.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles(Role.SUPER_ADMIN, Role.ADMIN));

router.post('/users/invite', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.nativeEnum(Role),
      userType: z.nativeEnum(UserType)
    }).parse(req.body);

    const result = await adminInviteUser(body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invite failed' });
  }
});

router.post('/users/:userId/external-access/disable', async (req, res) => {
  const user = await disableExternalAccess(req.params.userId);
  res.json(user);
});

router.post('/users/:userId/external-access/enable', async (req, res) => {
  const user = await enableExternalAccess(req.params.userId);
  res.json(user);
});

export default router;
