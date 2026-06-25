import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, setAccessToken } from '../lib/api';
import { getAuthUser } from '../lib/auth';

type Session = {
  id: string;
  deviceName?: string;
  ipAddress?: string;
  createdAt: string;
};

type LoginHistory = {
  id: string;
  success: boolean;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [message, setMessage] = useState('');
  const user = getAuthUser();

  useEffect(() => {
    async function load() {
      try {
        const [sessionsRes, historyRes] = await Promise.all([
          api.get('/auth/sessions'),
          api.get('/auth/login-history')
        ]);
        setSessions(sessionsRes.data);
        setHistory(historyRes.data);
      } catch {
        setMessage('You are not authenticated.');
      }
    }

    load();
  }, []);

  const home = useMemo(() => {
    if (!user) return { title: 'Dashboard', subtitle: 'Protected access area.' };

    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          title: 'Administration Dashboard',
          subtitle: 'Manage users, access, sessions, and platform security.'
        };
      case 'DIRECTOR':
        return {
          title: 'Director Dashboard',
          subtitle: 'High-level visibility for internal operations and secure collaboration.'
        };
      case 'MANAGER':
        return {
          title: 'Manager Dashboard',
          subtitle: 'Operational workspace for managing staff and protected workflows.'
        };
      case 'STAFF':
        return {
          title: 'Staff Dashboard',
          subtitle: 'Secure workspace for internal daily work.'
        };
      default:
        return {
          title: 'External Dashboard',
          subtitle: 'Controlled access area for external professionals.'
        };
    }
  }, [user]);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{home.title}</h1>
            <p className="mt-2 text-slate-300">{home.subtitle}</p>
            {user && (
              <p className="mt-2 text-sm text-slate-400">
                {user.email} • {user.role} • {user.userType}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <>
                <Link to="/admin/users" className="btn-secondary !w-auto px-5">
                  Admin Users
                </Link>
                <Link to="/admin/invite" className="btn-secondary !w-auto px-5">
                  Invite User
                </Link>
              </>
            )}

            <Link to="/settings/mfa" className="btn-secondary !w-auto px-5">
              MFA Setup
            </Link>

            <Link to="/settings/devices" className="btn-secondary !w-auto px-5">
              Devices
            </Link>

            <button
              className="btn-secondary !w-auto px-5"
              onClick={async () => {
                try {
                  await api.post('/auth/logout');
                } catch {}
                setAccessToken();
                window.location.href = '/sign-in';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {message}
          </div>
        )}

        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="card p-6">
            <p className="text-sm text-slate-400">Role</p>
            <p className="mt-2 text-2xl font-semibold text-white">{user?.role || 'Unknown'}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-slate-400">Active Sessions</p>
            <p className="mt-2 text-2xl font-semibold text-white">{sessions.length}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-slate-400">Recent Login Events</p>
            <p className="mt-2 text-2xl font-semibold text-white">{history.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-xl font-semibold">Active Sessions</h2>
            <div className="mt-4 space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium">{session.deviceName || 'Unknown device'}</p>
                  <p className="mt-1 text-sm text-slate-300">{session.ipAddress || 'Unknown IP'}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Started {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {!sessions.length && <p className="text-sm text-slate-400">No active sessions loaded.</p>}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-semibold">Login History</h2>
            <div className="mt-4 space-y-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className={`font-medium ${item.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {item.success ? 'Successful login' : 'Failed login'}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{item.reason || 'No reason'}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {!history.length && <p className="text-sm text-slate-400">No login history loaded.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
