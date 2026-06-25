import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api, setAccessToken } from '../lib/api';

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    mfaToken: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      setAccessToken(data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Sign in failed';
      setError(message);
      if (String(message).toLowerCase().includes('mfa')) setNeedsMfa(true);
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
                placeholder="Enter 6-digit code"
                value={form.mfaToken}
                onChange={(e) => setForm((s) => ({ ...s, mfaToken: e.target.value }))}
              />
            </div>
          )}

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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-400">
          <span>Secure</span>
          <span>•</span>
          <span>Confidential</span>
          <span>•</span>
          <span>Protected</span>
        </div>
      </div>
    </AuthLayout>
  );
}
