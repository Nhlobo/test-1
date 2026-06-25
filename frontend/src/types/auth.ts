export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userType: 'INTERNAL' | 'EXTERNAL';
  status: string;
  externalAccessActive: boolean;
  emailVerifiedAt?: string | null;
  mfaEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
};
