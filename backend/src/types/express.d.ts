import { Role, UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        role: Role;
        userType: UserType;
        sessionId: string;
      }
    }
  }
}

export {};
