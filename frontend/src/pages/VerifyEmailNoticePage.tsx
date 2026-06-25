import { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { api } from '../lib/api';
import { getQueryParam } from '../lib/utils';

export default function VerifyEmailNoticePage() {
  const email = getQueryParam('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function resend() {
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('Verification email sent.');
    } catch {
      setMessage('Unable to resend verification email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Verify Your Email"
          subtitle="Your account must be verified before you can sign in."
        />

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
          Check your inbox for the verification link.
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
          {email || 'No email provided'}
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <button className="btn-primary mt-5" onClick={resend} disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
    </AuthLayout>
  );
}
