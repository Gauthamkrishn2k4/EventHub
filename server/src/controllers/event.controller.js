import * as eventService from '../services/event.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => {
  const { events, meta } = await eventService.listEvents(req.query, req.user);
  sendSuccess(res, events, { meta });
});

export const categories = asyncHandler(async (req, res) => sendSuccess(res, await eventService.listCategories(req.user)));

export const getOne = asyncHandler(async (req, res) => sendSuccess(res, await eventService.getEvent(req.params.id, req.user)));

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await eventService.createEvent(req.body, req.user._id), { status: 201 }));

export const update = asyncHandler(async (req, res) => sendSuccess(res, await eventService.updateEvent(req.params.id, req.body)));

export const updateStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await eventService.changeStatus(req.params.id, req.body.status)));

export const remove = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  sendSuccess(res, { message: 'Event deleted' });
});
