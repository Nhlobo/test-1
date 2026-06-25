import { FormEvent, useEffect, useState } from 'react';
import AdminShell from '../components/AdminShell';
import { api } from '../lib/api';

export default function MfaSetupPage() {
  const [secret, setSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.post('/auth/mfa/setup');
        setSecret(data.secret);
        setQrCodeDataUrl(data.qrCodeDataUrl);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to initialize MFA');
      } finally {
        setSetupLoading(false);
      }
    }

    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/mfa/verify', { token });
      setMessage('MFA enabled successfully.');
      setToken('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to verify MFA code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Multi-Factor Authentication</h2>
          <p className="mt-1 text-sm text-slate-400">
            Scan the QR code with your authenticator app, then verify with a 6-digit code.
          </p>

          {setupLoading ? (
            <p className="mt-6 text-sm text-slate-400">Preparing MFA setup...</p>
          ) : (
            <>
              {error && (
                <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {message && (
                <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {message}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="label">Authenticator Code</label>
                  <input
                    className="input"
                    placeholder="Enter 6-digit code"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>

                <button className="btn-primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Enable MFA'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold">Setup Details</h2>

          {qrCodeDataUrl && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white p-4">
              <img src={qrCodeDataUrl} alt="MFA QR Code" className="mx-auto h-64 w-64 object-contain" />
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Manual secret</p>
            <p className="mt-2 break-all text-sm text-white">{secret || 'Not available'}</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
