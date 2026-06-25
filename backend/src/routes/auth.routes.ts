
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../lib/env.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  acceptInvite,
  getLoginHistory,
  listDevices,
  listSessions,
  login,
  requestPasswordReset,
  resendEmailVerification,
  resetPassword,
  revokeSession,
  setupMfa,
  trustDevice,
  untrustDevice,
  verifyAndEnableMfa,
  verifyEmail
} from '../services/auth.service.js';
import { rotateRefreshToken } from '../services/session.service.js';

const router = Router();

function setRefreshCookie(res: any, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    domain: env.cookieDomain,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

router.post('/accept-invite', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      token: z.string().min(10),
      code: z.string().optional(),
      password: z.string().min(8)
    }).parse(req.body);

    await acceptInvite(body);
    res.json({ message: 'Account setup complete. Verify your email before signing in.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Invalid request' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      token: z.string().min(10)
    }).parse(req.body);

    await verifyEmail(body);
    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Verification failed' });
  }
});

router.post('/resend-verification', async (req, res) => {
  const body = z.object({
    email: z.string().email()
  }).parse(req.body);

  await resendEmailVerification(body.email);
  res.json({ message: 'If the account exists, a verification email has been sent' });
});

router.post('/login', async (req, res) => {
  try {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      mfaToken: z.string().optional(),
      deviceId: z.string().optional(),
      trustDevice: z.boolean().optional()
    }).parse(req.body);

    const result = await login({
      ...body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    setRefreshCookie(res, result.refreshToken);

    res.json({
      accessToken: result.accessToken,
      session: result.session,
      deviceId: result.deviceId
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

    const result = await rotateRefreshToken(refreshToken);
    setRefreshCookie(res, result.refreshToken);

    res.json({ accessToken: result.accessToken });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Refresh failed' });
  }
});

router.post('/logout', async (_req, res) => {
  res.clearCookie('refreshToken', {
    path: '/api/auth/refresh'
  });

  res.json({ message: 'Logged out' });
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

router.get('/devices', requireAuth, async (req, res) => {
  const devices = await listDevices(req.auth!.userId);
  res.json(devices);
});

router.post('/devices/trust', requireAuth, async (req, res) => {
  const body = z.object({
    deviceId: z.string()
  }).parse(req.body);

  await trustDevice(req.auth!.userId, body.deviceId);
  res.json({ message: 'Device trusted' });
});

router.post('/devices/untrust', requireAuth, async (req, res) => {
  const body = z.object({
    deviceId: z.string()
  }).parse(req.body);

  await untrustDevice(req.auth!.userId, body.deviceId);
  res.json({ message: 'Device untrusted' });
});

router.get('/login-history', requireAuth, async (req, res) => {
  const history = await getLoginHistory(req.auth!.userId);
  res.json(history);
});

export default router;
