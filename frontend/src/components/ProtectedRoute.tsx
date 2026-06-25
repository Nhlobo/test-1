import { Navigate } from 'react-router-dom';
import { getAuthUser, isAuthenticated } from '../lib/auth';

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }

  const user = getAuthUser();
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
