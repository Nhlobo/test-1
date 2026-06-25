import { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  children: ReactNode;
  backTo?: string;
};

export default function AuthLayout({ children, backTo = '/sign-in' }: Props) {
  return (
    <div className="min-h-screen bg-auth bg-cover bg-center p-6 md:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="hidden rounded-3xl border border-white/10 bg-slate-950/35 p-8 backdrop-blur md:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/10">
                    <ShieldCheck className="h-7 w-7 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-wide text-white">KUTLWANO</p>
                    <p className="text-sm uppercase tracking-[0.3em] text-brand-300">
                      Medico-Legal Services
                    </p>
                  </div>
                </div>

                <div className="max-w-md">
                  <h1 className="text-4xl font-semibold text-white">Secure internal access</h1>
                  <p className="mt-4 text-slate-300">
                    Authentication, authorization, session security, and controlled dashboard access for internal staff and external professionals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span>Secure</span>
                <span>•</span>
                <span>Confidential</span>
                <span>•</span>
                <span>Protected</span>
              </div>
            </div>
          </div>

          <div className="card mx-auto w-full max-w-xl p-6 sm:p-8">
            <Link to={backTo} className="mb-8 inline-flex text-sm text-brand-300 hover:text-brand-200">
              ← Back to Sign In
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
