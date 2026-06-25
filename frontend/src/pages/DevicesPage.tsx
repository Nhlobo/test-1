import { useEffect, useState } from 'react';
import AdminShell from '../components/AdminShell';
import Badge from '../components/Badge';
import { api } from '../lib/api';
import { getDeviceId } from '../lib/device';

type Device = {
  id: string;
  deviceId: string;
  name?: string;
  trusted: boolean;
  lastSeenAt?: string;
  createdAt: string;
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [message, setMessage] = useState('');
  const currentDeviceId = getDeviceId();

  async function load() {
    try {
      const { data } = await api.get('/auth/devices');
      setDevices(data);
      setMessage('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to load devices');
    }
  }

  async function toggle(device: Device) {
    try {
      await api.post(device.trusted ? '/auth/devices/untrust' : '/auth/devices/trust', {
        deviceId: device.deviceId
      });
      await load();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Unable to update device');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Trusted Devices</h2>
        <p className="mt-1 text-sm text-slate-400">Manage devices that can access this account.</p>

        {message && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{device.name || 'Unknown device'}</p>
                  <p className="mt-1 text-xs text-slate-400">{device.deviceId}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Last seen {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {device.deviceId === currentDeviceId && <Badge tone="blue">Current</Badge>}
                  <Badge tone={device.trusted ? 'green' : 'rose'}>
                    {device.trusted ? 'Trusted' : 'Untrusted'}
                  </Badge>
                  <button
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                    onClick={() => toggle(device)}
                  >
                    {device.trusted ? 'Remove Trust' : 'Trust Device'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!devices.length && <p className="text-sm text-slate-400">No devices found.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
