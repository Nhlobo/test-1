import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
});

export function setAccessToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('accessToken');
  }
}

const existing = localStorage.getItem('accessToken');
if (existing) setAccessToken(existing);
