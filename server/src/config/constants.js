export const ROLES = Object.freeze({ ADMIN: 'Admin', CUSTOMER: 'Customer' });

export const EVENT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
});

export const BOOKING_STATUS = Object.freeze({ CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled' });

/** Allowed event status transitions. Cancelled is terminal. */
export const EVENT_TRANSITIONS = Object.freeze({
  [EVENT_STATUS.DRAFT]: [EVENT_STATUS.PUBLISHED, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.PUBLISHED]: [EVENT_STATUS.DRAFT, EVENT_STATUS.CANCELLED],
  [EVENT_STATUS.CANCELLED]: [],
});

export const MAX_TICKETS_PER_BOOKING = 10;
export const PAGINATION = Object.freeze({ DEFAULT_LIMIT: 9, MAX_LIMIT: 50 });
export const CANCEL_REASON = Object.freeze({ CUSTOMER: 'CANCELLED_BY_USER', EVENT: 'EVENT_CANCELLED' });
