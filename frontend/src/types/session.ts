export type AuthUser = {
  sub: string;
  email: string;
  role: string;
  userType: string;
  sessionId: string;
  exp?: number;
  iat?: number;
};
