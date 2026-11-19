import http from './http.js';
export const registerUser = (payload) => http.post('/auth/register', payload);
export const loginUser = (payload) => http.post('/auth/login', payload);
export const fetchMe = () => http.get('/auth/me');
