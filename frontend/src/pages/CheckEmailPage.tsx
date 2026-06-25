import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import { getQueryParam } from '../lib/utils';

export default function CheckEmailPage() {
  const email = getQueryParam('email') || 'user@example.com';

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <AuthHeader
          title="Check Your Email"
          subtitle={`We've sent a password reset link to ${email}. The link will expire in 60 minutes.`}
        />

        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-200">
          If you don’t see the email, check your spam or junk folder.
        </div>

        <Link to="/sign-in" className="btn-secondary">
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
