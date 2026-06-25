const KEY = 'deviceId';

export function getDeviceId() {
  return localStorage.getItem(KEY) || '';
}

export function setDeviceId(deviceId: string) {
  localStorage.setItem(KEY, deviceId);
}
