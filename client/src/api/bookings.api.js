import http from './http.js';
export const createBooking = (payload) => http.post('/bookings', payload);
export const fetchMyBookings = (params) => http.get('/bookings/my', { params });
export const fetchAllBookings = (params) => http.get('/bookings', { params });
export const fetchBooking = (id) => http.get(`/bookings/${id}`);
export const cancelBooking = (id) => http.patch(`/bookings/${id}/cancel`);
