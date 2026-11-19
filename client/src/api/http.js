import axios from 'axios';

const TOKEN_KEY = 'eventhub_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response.data, // { success, data, meta? }
  (error) => {
    const status = error.response?.status;
    // An expired/invalid token on a request that carried one -> force logout.
    if (status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    const apiError = new Error(error.response?.data?.message || 'Network error. Please check your connection.');
    apiError.status = status;
    apiError.details = error.response?.data?.details;
    return Promise.reject(apiError);
  }
);

export default http;
