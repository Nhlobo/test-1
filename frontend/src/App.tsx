import { Navigate, Route, Routes } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import DashboardPage from './pages/DashboardPage';
import CheckEmailPage from './pages/CheckEmailPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInviteUserPage from './pages/AdminInviteUserPage';
import MfaSetupPage from './pages/MfaSetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import VerifyEmailNoticePage from './pages/VerifyEmailNoticePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DevicesPage from './pages/DevicesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/check-email" element={<CheckEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
      <Route path="/verify-email-notice" element={<VerifyEmailNoticePage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/mfa"
        element={
          <ProtectedRoute>
            <MfaSetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/devices"
        element={
          <ProtectedRoute>
            <DevicesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminUsersPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/invite"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminInviteUserPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
