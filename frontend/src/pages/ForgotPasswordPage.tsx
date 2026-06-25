import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      navigate(`/check-email?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Reset Password"
          subtitle="Enter your email address and we'll send you a link to reset your password."
        />

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
