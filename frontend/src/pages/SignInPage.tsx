import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api, setAccessToken } from '../lib/api';
import { getDeviceId, setDeviceId } from '../lib/device';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    mfaToken: '',
    trustDevice: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
        deviceId: getDeviceId() || undefined,
        trustDevice: form.trustDevice,
        ...(needsMfa && form.mfaToken ? { mfaToken: form.mfaToken } : {})
      };

      const { data } = await api.post('/auth/login', payload);
      setAccessToken(data.accessToken);
      if (data.deviceId) setDeviceId(data.deviceId);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Sign in failed';
      setError(message);

      if (
        String(message).toLowerCase().includes('mfa') ||
        String(message).toLowerCase().includes('invalid mfa')
      ) {
        setNeedsMfa(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout backTo="/sign-in">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white">Welcome Back</h1>
          <p className="mt-3 text-sm text-slate-300">Sign in to access your account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
          </div>

          {needsMfa && (
            <div>
              <label className="label">MFA Code</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={form.mfaToken}
                onChange={(e) => setForm((s) => ({ ...s, mfaToken: e.target.value }))}
              />
            </div>
          )}

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.trustDevice}
              onChange={(e) => setForm((s) => ({ ...s, trustDevice: e.target.checked }))}
            />
            Trust this device
          </label>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-brand-300 hover:text-brand-200">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : needsMfa ? 'Verify & Sign In' : 'Sign In'}
          </button>

          {String(error).toLowerCase().includes('email verification') && (
            <Link to={`/verify-email-notice?email=${encodeURIComponent(form.email)}`} className="btn-secondary">
              Verify Email
            </Link>
          )}
        </form>
      </div>
    </AuthLayout>
  );
}
