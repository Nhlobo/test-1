import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generateMfaSecret(email: string, issuer: string) {
  return speakeasy.generateSecret({
    name: email,
    issuer
  });
}

export async function generateMfaQrDataUrl(otpauthUrl: string) {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyMfaToken(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });
}
