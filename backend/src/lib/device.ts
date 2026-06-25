import { UAParser } from 'ua-parser-js';
import { randomToken } from './hash.js';

export function getDeviceName(userAgent?: string) {
  const ua = new UAParser(userAgent);
  const browser = ua.getBrowser().name || 'Unknown Browser';
  const os = ua.getOS().name || 'Unknown OS';
  return `${browser} on ${os}`;
}

export function makeDeviceId() {
  return `dev_${randomToken(12)}`;
}
