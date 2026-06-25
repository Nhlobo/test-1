import { Navigate } from 'react-router-dom';
import { getAuthUser, hasAnyRole, isAuthenticated } from '../lib/auth';

type Props = {
  roles: string[];
  children: JSX.Element;
};

export default function RoleGuard({ roles, children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }

  const user = getAuthUser();
  if (!user || !hasAnyRole(roles, user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
