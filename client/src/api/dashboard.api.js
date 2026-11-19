import http from './http.js';
export const fetchStats = () => http.get('/dashboard/stats');
export const fetchRecentBookings = (limit = 6) => http.get('/dashboard/recent-bookings', { params: { limit } });
