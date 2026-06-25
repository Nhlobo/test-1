import { NextFunction, Request, Response } from 'express';
import { Role, UserType } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt.js';
import { PermissionKey, roleHasPermission } from '../lib/permissions.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role as Role,
      userType: payload.userType as UserType,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });

    if (!roleHasPermission(req.auth.role, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
