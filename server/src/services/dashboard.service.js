import { BOOKING_STATUS, EVENT_STATUS } from '../config/constants.js';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import { roundMoney } from '../utils/money.js';

const countOf = (rows, key) => rows.find((r) => r._id === key)?.count ?? 0;

/**
 * "Total booking value" = sum of totalAmount over CONFIRMED bookings only.
 * Cancelled bookings are excluded because the (simulated) payment is refunded.
 */
export async function getStats() {
  const now = new Date();
  const [eventRows, bookingRows, upcomingEvents, mostBooked] = await Promise.all([
    Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' }, tickets: { $sum: '$quantity' } } },
    ]),
    Event.find({ status: EVENT_STATUS.PUBLISHED, eventDate: { $gte: now } })
      .sort({ eventDate: 1 })
      .limit(5)
      .select('title eventDate location availableTickets totalTickets'),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.CONFIRMED } },
      { $group: { _id: '$eventId', ticketsSold: { $sum: '$quantity' }, bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { ticketsSold: -1, _id: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' },
      { $project: { _id: 0, eventId: '$_id', title: '$event.title', eventDate: '$event.eventDate', ticketsSold: 1, bookings: 1, revenue: 1 } },
    ]),
  ]);

  const confirmed = bookingRows.find((r) => r._id === BOOKING_STATUS.CONFIRMED);
  return {
    events: {
      total: eventRows.reduce((sum, r) => sum + r.count, 0),
      published: countOf(eventRows, EVENT_STATUS.PUBLISHED),
      draft: countOf(eventRows, EVENT_STATUS.DRAFT),
      cancelled: countOf(eventRows, EVENT_STATUS.CANCELLED),
    },
    bookings: {
      total: bookingRows.reduce((sum, r) => sum + r.count, 0),
      confirmed: countOf(bookingRows, BOOKING_STATUS.CONFIRMED),
      cancelled: countOf(bookingRows, BOOKING_STATUS.CANCELLED),
      ticketsSold: confirmed?.tickets ?? 0,
      confirmedValue: roundMoney(confirmed?.amount ?? 0),
    },
    upcomingEvents,
    mostBooked: mostBooked.map((m) => ({ ...m, revenue: roundMoney(m.revenue) })),
  };
}

export const getRecentBookings = (limit) =>
  Booking.find()
    .sort({ bookedAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('eventId', 'title eventDate');
