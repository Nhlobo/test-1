import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { PermissionResponse } from '../types/permission';

export function usePermissions() {
  const [data, setData] = useState<PermissionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/permissions');
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    permissions: data?.permissions || [],
    role: data?.role || '',
    loading
  };
}
