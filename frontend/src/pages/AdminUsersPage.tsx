import { useEffect, useState } from 'react';
import AdminShell from '../components/AdminShell';
import Badge from '../components/Badge';
import { api } from '../lib/api';
import { AdminUser } from '../types/auth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
      setMessage('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleExternalAccess(user: AdminUser) {
    try {
      const endpoint = user.externalAccessActive
        ? `/admin/users/${user.id}/external-access/disable`
        : `/admin/users/${user.id}/external-access/enable`;

      await api.post(endpoint);
      await loadUsers();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to update external access');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <AdminShell>
      <div className="card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="mt-1 text-sm text-slate-400">
              Internal staff and external professionals with dashboard access.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="px-4 py-4 text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{user.email}</td>
                    <td className="px-4 py-4">
                      <Badge tone={user.userType === 'INTERNAL' ? 'blue' : 'amber'}>
                        {user.userType}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{user.role}</td>
                    <td className="px-4 py-4">
                      <Badge tone={user.status === 'ACTIVE' ? 'green' : 'rose'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {user.userType === 'EXTERNAL' ? (
                        <Badge tone={user.externalAccessActive ? 'green' : 'rose'}>
                          {user.externalAccessActive ? 'Enabled' : 'Disabled'}
                        </Badge>
                      ) : (
                        <Badge tone="slate">Internal</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {user.userType === 'EXTERNAL' ? (
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                          onClick={() => toggleExternalAccess(user)}
                        >
                          {user.externalAccessActive ? 'Disable Access' : 'Enable Access'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!users.length && <p className="mt-4 text-sm text-slate-400">No users found.</p>}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
