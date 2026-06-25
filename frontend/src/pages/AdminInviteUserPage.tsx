import { FormEvent, useState } from 'react';
import AdminShell from '../components/AdminShell';
import { api } from '../lib/api';

const internalRoles = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MANAGER', 'STAFF'];
const externalRoles = ['REFERRING_ATTORNEY', 'MEDICAL_EXPERT'];

export default function AdminInviteUserPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userType: 'INTERNAL',
    role: 'STAFF'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const roleOptions = form.userType === 'INTERNAL' ? internalRoles : externalRoles;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/admin/users/invite', form);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to send invite');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Invite User</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create internal staff or external dashboard access.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">First Name</label>
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Last Name</label>
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">User Type</label>
                <select
                  className="input"
                  value={form.userType}
                  onChange={(e) => {
                    const userType = e.target.value;
                    setForm((s) => ({
                      ...s,
                      userType,
                      role: userType === 'INTERNAL' ? 'STAFF' : 'REFERRING_ATTORNEY'
                    }));
                  }}
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="EXTERNAL">EXTERNAL</option>
                </select>
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button className="btn-primary" disabled={loading}>
              {loading ? 'Sending Invite...' : 'Send Invite'}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold">Invite Result</h2>
          <p className="mt-1 text-sm text-slate-400">
            Use this when email sending is not wired up yet.
          </p>

          {!result ? (
            <p className="mt-6 text-sm text-slate-400">No invite created yet.</p>
          ) : (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Email</p>
                <p className="mt-1 text-white">{result.user.email}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Invite Link</p>
                <p className="mt-1 break-all text-brand-300">{result.inviteLink}</p>
              </div>

              {result.code && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">Access Code</p>
                  <p className="mt-1 text-lg font-semibold text-white">{result.code}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
