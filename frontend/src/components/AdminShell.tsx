import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, setAccessToken } from '../lib/api';
import { getAuthUser } from '../lib/auth';

type Props = {
  children: ReactNode;
};

export default function AdminShell({ children }: Props) {
  const location = useLocation();
  const user = getAuthUser();

  const nav = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Admin Users', to: '/admin/users' },
    { label: 'Invite User', to: '/admin/invite' },
    { label: 'MFA Setup', to: '/settings/mfa' },
    { label: 'Devices', to: '/settings/devices' }
  ];

  async function signOut() {
    try {
      await api.post('/auth/logout');
    } catch {}
    setAccessToken();
    window.location.href = '/sign-in';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-slate-900/60 p-6 lg:block">
          <div className="mb-8">
            <p className="text-xl font-semibold">Internal System</p>
            <p className="mt-1 text-sm text-slate-400">Administration</p>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{user?.email || 'Signed in user'}</p>
            <p className="mt-1 text-xs text-slate-400">
              {user?.role || 'Unknown role'} • {user?.userType || 'Unknown type'}
            </p>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-xl px-4 py-3 text-sm transition ${
                    active ? 'bg-brand-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin</h1>
              <p className="mt-1 text-sm text-slate-400">Manage internal and external access.</p>
            </div>

            <button className="btn-secondary !w-auto px-5" onClick={signOut}>
              Sign Out
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
