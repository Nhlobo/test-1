import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  acceptInvite,
  getLoginHistory,
  listSessions,
  login,
  requestPasswordReset,
  resetPassword,
  revokeSession,
  setupMfa,
  verifyAndEnableMfa
} from '../services/auth.service.js';

const router = Router();

router.post('/accept-invite', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      token: z.string().min(10),
      code: z.string().optional(),
      password: z.string().min(8)
    }).parse(req.body);

    await acceptInvite(body);
    res.json({ message: 'Account setup complete' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid request' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      mfaToken: z.string().optional()
    }).parse(req.body);

    const result = await login({
      ...body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const body = z.object({
    email: z.string().email()
  }).parse(req.body);

  await requestPasswordReset(body.email);
  res.json({ message: 'If the account exists, a reset link has been sent' });
});

router.post('/reset-password', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      token: z.string().min(10),
      password: z.string().min(8)
    }).parse(req.body);

    await resetPassword(body);
    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Reset failed' });
  }
});

router.post('/mfa/setup', requireAuth, async (req, res) => {
  const result = await setupMfa(req.auth!.userId, req.auth!.email);
  res.json(result);
});

router.post('/mfa/verify', requireAuth, async (req, res) => {
  try {
    const body = z.object({
      token: z.string().min(6)
    }).parse(req.body);

    await verifyAndEnableMfa(req.auth!.userId, body.token);
    res.json({ message: 'MFA enabled' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Verification failed' });
  }
});

router.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await listSessions(req.auth!.userId);
  res.json(sessions);
});

router.post('/sessions/revoke', requireAuth, async (req, res) => {
  const body = z.object({
    sessionId: z.string()
  }).parse(req.body);

  await revokeSession(body.sessionId);
  res.json({ message: 'Session revoked' });
});

router.get('/login-history', requireAuth, async (req, res) => {
  const history = await getLoginHistory(req.auth!.userId);
  res.json(history);
});

export default router;
