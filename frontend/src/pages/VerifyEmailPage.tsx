import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { api } from '../lib/api';
import { getQueryParam } from '../lib/utils';

export default function VerifyEmailPage() {
  const email = getQueryParam('email');
  const token = getQueryParam('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    async function verify() {
      try {
        await api.post('/auth/verify-email', { email, token });
        setStatus('success');
        setMessage('Email verified successfully.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Verification failed.');
      }
    }

    verify();
  }, [email, token]);

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Email Verification"
          subtitle="We’re confirming your email address."
        />

        <div
          className={`rounded-xl px-4 py-4 text-sm ${
            status === 'success'
              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : status === 'error'
                ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200'
                : 'border border-white/10 bg-white/5 text-slate-300'
          }`}
        >
          {message}
        </div>

        {status !== 'loading' && (
          <Link to="/sign-in" className="btn-primary mt-5">
            Back to Sign In
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
