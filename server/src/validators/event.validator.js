import { z } from 'zod';
import { EVENT_STATUS } from '../config/constants.js';
import { paginationQuery } from './common.js';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format');

const base = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  category: z.string().trim().min(1, 'Category is required').max(60),
  location: z.string().trim().min(1, 'Location is required').max(200),
  eventDate: z.coerce.date({ invalid_type_error: 'Event date is invalid' }),
  startTime: time.optional(),
  endTime: time.optional(),
  ticketPrice: z.coerce.number().min(0, 'Ticket price cannot be negative'),
  totalTickets: z.coerce.number().int('Capacity must be a whole number').min(1, 'Capacity must be greater than zero'),
  imageUrl: z.string().trim().url('Image URL is invalid').optional().or(z.literal('')),
});

const checkTimes = (value, ctx) => {
  if (value.startTime && value.endTime && value.endTime <= value.startTime) {
    ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be after start time' });
  }
};

export const createEventSchema = base
  .extend({ status: z.enum([EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED]).default(EVENT_STATUS.DRAFT) })
  .superRefine((value, ctx) => {
    checkTimes(value, ctx);
    if (value.eventDate.getTime() <= Date.now()) {
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'Event date cannot be in the past' });
    }
  });

export const updateEventSchema = base
  .partial()
  .superRefine(checkTimes)
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export const statusSchema = z.object({ status: z.nativeEnum(EVENT_STATUS) });

export const listEventsQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.nativeEnum(EVENT_STATUS).optional(), // honoured for admins only
  sort: z.enum(['date_asc', 'date_desc', 'price_asc', 'price_desc']).default('date_asc'),
});
