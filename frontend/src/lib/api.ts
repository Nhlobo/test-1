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

export async function refreshAccessToken() {
  const { data } = await api.post('/auth/refresh');
  setAccessToken(data.accessToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await refreshAccessToken();
        return api(original);
      } catch {
        setAccessToken();
      }
    }

    return Promise.reject(error);
  }
);

const existing = localStorage.getItem('accessToken');
if (existing) setAccessToken(existing);
