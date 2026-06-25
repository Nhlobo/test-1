
import { useEffect, useState } from 'react';
import AdminShell from '../components/AdminShell';
import Badge from '../components/Badge';
import { api } from '../lib/api';
import { AdminUser } from '../types/auth';
import { usePermissions } from '../hooks/usePermissions';
import { hasPermission } from '../lib/permissions';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { permissions } = usePermissions();

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

  async function setStatus(user: AdminUser, action: 'activate' | 'suspend' | 'disable') {
    try {
      await api.post(`/admin/users/${user.id}/${action}`);
      await loadUsers();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to update user status');
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
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">MFA</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 align-top">
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
                      <Badge
                        tone={
                          user.status === 'ACTIVE'
                            ? 'green'
                            : user.status === 'PENDING_INVITE'
                              ? 'amber'
                              : 'rose'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={user.emailVerifiedAt ? 'green' : 'amber'}>
                        {user.emailVerifiedAt ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={user.mfaEnabled ? 'green' : 'slate'}>
                        {user.mfaEnabled ? 'Enabled' : 'Not Enabled'}
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
                      <div className="flex flex-wrap gap-2">
                        {user.userType === 'EXTERNAL' && hasPermission(permissions, 'manage_external_access') && (
                          <button
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                            onClick={() => toggleExternalAccess(user)}
                          >
                            {user.externalAccessActive ? 'Disable Access' : 'Enable Access'}
                          </button>
                        )}

                        {user.status !== 'ACTIVE' && hasPermission(permissions, 'manage_users') && (
                          <button
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
                            onClick={() => setStatus(user, 'activate')}
                          >
                            Activate
                          </button>
                        )}

                        {user.status !== 'SUSPENDED' && hasPermission(permissions, 'suspend_users') && (
                          <button
                            className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 hover:bg-amber-500/20"
                            onClick={() => setStatus(user, 'suspend')}
                          >
                            Suspend
                          </button>
                        )}

                        {user.status !== 'DISABLED' && hasPermission(permissions, 'disable_users') && (
                          <button
                            className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 hover:bg-rose-500/20"
                            onClick={() => setStatus(user, 'disable')}
                          >
                            Disable
                          </button>
                        )}
                      </div>
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
