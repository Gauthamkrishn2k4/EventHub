import http from './http.js';
export const fetchEvents = (params) => http.get('/events', { params });
export const fetchCategories = () => http.get('/events/categories');
export const fetchEvent = (id) => http.get(`/events/${id}`);
export const createEvent = (payload) => http.post('/events', payload);
export const updateEvent = (id, payload) => http.put(`/events/${id}`, payload);
export const updateEventStatus = (id, status) => http.patch(`/events/${id}/status`, { status });
export const deleteEvent = (id) => http.delete(`/events/${id}`);
