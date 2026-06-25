export const env = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  inviteTtlHours: Number(process.env.INVITE_TOKEN_TTL_HOURS || 72),
  passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 60),
  emailVerifyTtlHours: Number(process.env.EMAIL_VERIFY_TTL_HOURS || 24),
  maxFailedLoginAttempts: Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 5),
  accountLockMinutes: Number(process.env.ACCOUNT_LOCK_MINUTES || 30),
  mfaIssuer: process.env.MFA_ISSUER || 'Internal System',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};
