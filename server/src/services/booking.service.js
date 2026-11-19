import { BOOKING_STATUS, CANCEL_REASON, EVENT_STATUS, ROLES } from '../config/constants.js';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import { ApiError } from '../utils/ApiError.js';
import { generateBookingReference } from '../utils/bookingReference.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { roundMoney } from '../utils/money.js';
import { buildMeta, getPagination } from '../utils/pagination.js';

const EVENT_FIELDS = 'title eventDate startTime location category imageUrl status';
const MAX_REFERENCE_RETRIES = 5;

/**
 * Overbooking protection (see README "Concurrency"):
 * 1. Reserve: ONE atomic conditional update decrements availableTickets only if the event is
 *    published, upcoming and still has enough tickets. MongoDB serialises writes to a single
 *    document, so two simultaneous requests can never both take the last ticket.
 * 2. Record: insert the booking. If that fails, the reservation is released (compensation).
 */
export async function createBooking(user, { eventId, quantity }) {
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: EVENT_STATUS.PUBLISHED,
      eventDate: { $gt: new Date() },
      availableTickets: { $gte: quantity },
    },
    { $inc: { availableTickets: -quantity } },
    { new: true }
  );
  if (!event) throw await explainReservationFailure(eventId, quantity);

  try {
    const booking = await insertWithUniqueReference({
      userId: user._id,
      eventId: event._id,
      quantity,
      ticketPrice: event.ticketPrice,
      totalAmount: roundMoney(event.ticketPrice * quantity), // never taken from the client
      status: BOOKING_STATUS.CONFIRMED,
    });
    return booking.populate('eventId', EVENT_FIELDS);
  } catch (err) {
    await Event.updateOne({ _id: event._id }, { $inc: { availableTickets: quantity } });
    throw err;
  }
}

async function insertWithUniqueReference(data) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await Booking.create({ ...data, bookingReference: generateBookingReference() });
    } catch (err) {
      const isReferenceClash = err.code === 11000 && err.keyPattern?.bookingReference;
      if (!isReferenceClash || attempt >= MAX_REFERENCE_RETRIES) throw err;
    }
  }
}

/** The reservation failed; work out which rule was broken so the customer gets a precise message. */
async function explainReservationFailure(eventId, quantity) {
  const event = await Event.findById(eventId).select('status eventDate availableTickets');
  if (!event) return new ApiError(404, 'Event not found');
  if (event.status !== EVENT_STATUS.PUBLISHED) return new ApiError(409, 'This event is not open for booking');
  if (event.eventDate <= new Date()) return new ApiError(409, 'This event has already started');
  if (event.availableTickets === 0) return new ApiError(409, 'This event is sold out');
  return new ApiError(409, `Only ${event.availableTickets} ticket(s) left. You asked for ${quantity}.`);
}

export async function listMyBookings(userId, query) {
  const pagination = getPagination(query);
  const filter = { userId, ...(query.status && { status: query.status }) };
  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ bookedAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate('eventId', EVENT_FIELDS),
    Booking.countDocuments(filter),
  ]);
  return { bookings, meta: buildMeta(pagination, total) };
}

export async function listAllBookings(query) {
  const pagination = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.eventId) filter.eventId = query.eventId;
  if (query.reference) filter.bookingReference = { $regex: escapeRegex(query.reference), $options: 'i' };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ bookedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('userId', 'name email')
      .populate('eventId', EVENT_FIELDS),
    Booking.countDocuments(filter),
  ]);
  return { bookings, meta: buildMeta(pagination, total) };
}

export async function getBooking(user, id) {
  const booking = await Booking.findById(id).populate('userId', 'name email').populate('eventId', EVENT_FIELDS);
  if (!booking) throw new ApiError(404, 'Booking not found');
  assertCanAccess(user, booking);
  return booking;
}

function assertCanAccess(user, booking) {
  const ownerId = booking.userId._id ?? booking.userId;
  if (user.role !== ROLES.ADMIN && !ownerId.equals(user._id)) {
    throw new ApiError(403, 'You can only access your own bookings');
  }
}

/**
 * Cancellation is idempotent: the status flip is a conditional update (Confirmed -> Cancelled), and tickets
 * are restored only by the request that actually performed the flip. Repeated calls restore nothing.
 */
export async function cancelBooking(user, id) {
  const booking = await Booking.findById(id).populate('eventId', 'eventDate');
  if (!booking) throw new ApiError(404, 'Booking not found');
  assertCanAccess(user, booking);

  if (booking.status === BOOKING_STATUS.CANCELLED) throw new ApiError(409, 'This booking is already cancelled');
  if (booking.eventId.eventDate <= new Date()) throw new ApiError(409, 'Bookings cannot be cancelled once the event has started');

  const cancelled = await Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.CONFIRMED },
    {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy: user._id,
      cancellationReason: CANCEL_REASON.CUSTOMER,
    },
    { new: true }
  );
  if (!cancelled) throw new ApiError(409, 'This booking is already cancelled'); // lost a race with another cancel

  await Event.updateOne({ _id: booking.eventId._id }, { $inc: { availableTickets: booking.quantity } });
  return getBooking(user, id);
}
