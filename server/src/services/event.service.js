import { BOOKING_STATUS, CANCEL_REASON, EVENT_STATUS, EVENT_TRANSITIONS, ROLES } from '../config/constants.js';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildMeta, getPagination } from '../utils/pagination.js';

const SORTS = {
  date_asc: { eventDate: 1, _id: 1 },
  date_desc: { eventDate: -1, _id: 1 },
  price_asc: { ticketPrice: 1, eventDate: 1, _id: 1 },
  price_desc: { ticketPrice: -1, eventDate: 1, _id: 1 },
};

const isAdmin = (viewer) => viewer?.role === ROLES.ADMIN;

function buildListFilter({ search, category, from, to, status }, viewer) {
  const filter = {};
  if (isAdmin(viewer)) {
    if (status) filter.status = status;
  } else {
    filter.status = EVENT_STATUS.PUBLISHED; // customers & guests only ever see published events
  }
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;

  const range = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  if (!isAdmin(viewer)) {
    const now = new Date();
    if (!range.$gte || range.$gte < now) range.$gte = now; // hide events that already started
  }
  if (Object.keys(range).length) filter.eventDate = range;
  return filter;
}

export async function listEvents(query, viewer) {
  const pagination = getPagination(query);
  const filter = buildListFilter(query, viewer);
  const [events, total] = await Promise.all([
    Event.find(filter).sort(SORTS[query.sort]).skip(pagination.skip).limit(pagination.limit),
    Event.countDocuments(filter),
  ]);
  return { events, meta: buildMeta(pagination, total) };
}

export async function listCategories(viewer) {
  const filter = isAdmin(viewer) ? {} : { status: EVENT_STATUS.PUBLISHED };
  return (await Event.distinct('category', filter)).sort((a, b) => a.localeCompare(b));
}

export async function getEvent(id, viewer) {
  const event = await Event.findById(id).populate('organizerId', 'name');
  // Hide unpublished events from non-admins as if they did not exist.
  if (!event || (!isAdmin(viewer) && event.status !== EVENT_STATUS.PUBLISHED)) {
    throw new ApiError(404, 'Event not found');
  }
  return event;
}

export function createEvent(data, organizerId) {
  return Event.create({ ...data, availableTickets: data.totalTickets, organizerId });
}

/** Wraps every value in $literal so strings starting with "$" are never read as field paths. */
const literalize = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, { $literal: v }]));

export async function updateEvent(id, data) {
  const existing = await Event.findById(id);
  if (!existing) throw new ApiError(404, 'Event not found');
  if (existing.status === EVENT_STATUS.CANCELLED) throw new ApiError(409, 'Cancelled events cannot be edited');
  if (data.eventDate && data.eventDate.getTime() !== existing.eventDate.getTime() && data.eventDate <= new Date()) {
    throw new ApiError(422, 'Event date cannot be in the past');
  }

  const { totalTickets, ...rest } = data;
  const set = { ...literalize(rest), updatedAt: new Date() };
  const filter = { _id: id };

  if (totalTickets !== undefined) {
    // Keep availableTickets = totalTickets - sold, and refuse to drop capacity below tickets already sold.
    // Done in one atomic pipeline update so a concurrent booking can't slip between check and write.
    set.totalTickets = { $literal: totalTickets };
    set.availableTickets = { $add: ['$availableTickets', { $subtract: [totalTickets, '$totalTickets'] }] };
    filter.$expr = { $gte: [{ $subtract: [totalTickets, { $subtract: ['$totalTickets', '$availableTickets'] }] }, 0] };
  }

  const updated = await Event.findOneAndUpdate(filter, [{ $set: set }], { new: true });
  if (!updated) throw new ApiError(409, 'Capacity cannot be lower than the number of tickets already sold');
  return updated;
}

export async function changeStatus(id, status) {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.status === status) return event;
  if (!EVENT_TRANSITIONS[event.status].includes(status)) {
    throw new ApiError(409, `An event cannot move from ${event.status} to ${status}`);
  }
  if (status === EVENT_STATUS.PUBLISHED && event.eventDate <= new Date()) {
    throw new ApiError(409, 'An event whose date has passed cannot be published');
  }

  // Guarded on the status we read, so two admins can't apply conflicting transitions.
  const updated = await Event.findOneAndUpdate({ _id: id, status: event.status }, { status }, { new: true });
  if (!updated) throw new ApiError(409, 'Event status changed in the meantime. Please retry.');
  if (status === EVENT_STATUS.CANCELLED) await cascadeEventCancellation(updated);
  return updated;
}

/**
 * Cancelling an event cancels all of its confirmed bookings (simulated refund) and releases the tickets.
 * Idempotent: re-running it changes nothing.
 */
async function cascadeEventCancellation(event) {
  await Booking.updateMany(
    { eventId: event._id, status: BOOKING_STATUS.CONFIRMED },
    { status: BOOKING_STATUS.CANCELLED, cancelledAt: new Date(), cancellationReason: CANCEL_REASON.EVENT }
  );
  await Event.updateOne({ _id: event._id }, [{ $set: { availableTickets: '$totalTickets' } }]);
}

export async function deleteEvent(id) {
  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, 'Event not found');
  const bookings = await Booking.countDocuments({ eventId: id });
  if (bookings > 0) {
    throw new ApiError(409, 'This event has bookings and cannot be deleted. Cancel the event instead.');
  }
  await event.deleteOne();
}
