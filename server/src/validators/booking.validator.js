import { z } from 'zod';
import { BOOKING_STATUS, MAX_TICKETS_PER_BOOKING } from '../config/constants.js';
import { objectId, paginationQuery } from './common.js';

// Note: no total/price field. The server derives money values itself.
export const createBookingSchema = z.object({
  eventId: objectId,
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_TICKETS_PER_BOOKING, `You can book at most ${MAX_TICKETS_PER_BOOKING} tickets at once`),
});

export const myBookingsQuery = z.object({
  ...paginationQuery,
  status: z.nativeEnum(BOOKING_STATUS).optional(),
});

export const adminBookingsQuery = myBookingsQuery.extend({
  reference: z.string().trim().max(40).optional(),
  eventId: objectId.optional(),
});

export const recentBookingsQuery = z.object({ limit: z.coerce.number().int().min(1).max(20).default(5) });
