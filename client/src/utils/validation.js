import { toEventInstant } from './format.js';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateEventForm(v, { isEdit = false } = {}) {
  const e = {};
  if (v.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
  if (!v.description.trim()) e.description = 'Description is required';
  if (!v.category.trim()) e.category = 'Category is required';
  if (!v.location.trim()) e.location = 'Location is required';
  if (!v.date) e.date = 'Choose a date';
  else if (!isEdit && new Date(toEventInstant(v.date, v.startTime)) <= new Date()) e.date = 'Event date cannot be in the past';
  if (v.startTime && !TIME_RE.test(v.startTime)) e.startTime = 'Use HH:mm';
  if (v.endTime && !v.startTime) e.endTime = 'Set a start time first';
  else if (v.endTime && v.endTime <= v.startTime) e.endTime = 'End time must be after start time';
  if (v.ticketPrice === '' || Number(v.ticketPrice) < 0) e.ticketPrice = 'Price cannot be negative';
  if (!Number.isInteger(Number(v.totalTickets)) || Number(v.totalTickets) < 1) e.totalTickets = 'Capacity must be a whole number above zero';
  if (v.imageUrl && !/^https?:\/\/\S+$/i.test(v.imageUrl)) e.imageUrl = 'Enter a full http(s) URL';
  return e;
}

export function validateAuthForm(v, mode) {
  const e = {};
  if (mode === 'register' && v.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address';
  if (mode === 'register') {
    if (v.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Use letters and numbers';
  } else if (!v.password) e.password = 'Password is required';
  return e;
}
