import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { api } from '../lib/api';
import { getQueryParam } from '../lib/utils';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const email = getQueryParam('email');
  const token = getQueryParam('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  }, [password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password });
      navigate('/sign-in');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Create New Password"
          subtitle="Enter and confirm your new password to secure your account."
        />

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <ul className="space-y-2 text-sm text-slate-300">
            <li className={checks.length ? 'text-emerald-300' : ''}>Minimum 8 characters</li>
            <li className={checks.uppercase ? 'text-emerald-300' : ''}>At least one uppercase letter</li>
            <li className={checks.lowercase ? 'text-emerald-300' : ''}>At least one lowercase letter</li>
            <li className={checks.number ? 'text-emerald-300' : ''}>At least one number</li>
            <li className={checks.special ? 'text-emerald-300' : ''}>At least one special character</li>
          </ul>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
