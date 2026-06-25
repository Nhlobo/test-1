import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { api } from '../lib/api';
import { getQueryParam } from '../lib/utils';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(getQueryParam('email'));
  const [token] = useState(getQueryParam('token'));
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/accept-invite', { email, token, password, code: code || undefined });
      navigate('/sign-in');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invite setup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Set Your Password"
          subtitle="Complete account setup before signing in to your dashboard."
        />

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Access Code (external users only)</label>
            <input
              className="input"
              placeholder="Enter code if provided"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              placeholder="Create your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Completing Setup...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
