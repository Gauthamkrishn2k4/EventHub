import * as bookingService from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await bookingService.createBooking(req.user, req.body), { status: 201 }));

export const listMine = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.listMyBookings(req.user._id, req.query);
  sendSuccess(res, bookings, { meta });
});

export const listAll = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.listAllBookings(req.query);
  sendSuccess(res, bookings, { meta });
});

export const getOne = asyncHandler(async (req, res) => sendSuccess(res, await bookingService.getBooking(req.user, req.params.id)));

export const cancel = asyncHandler(async (req, res) => sendSuccess(res, await bookingService.cancelBooking(req.user, req.params.id)));
