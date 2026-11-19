import * as dashboardService from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const stats = asyncHandler(async (_req, res) => sendSuccess(res, await dashboardService.getStats()));

export const recentBookings = asyncHandler(async (req, res) =>
  sendSuccess(res, await dashboardService.getRecentBookings(req.query.limit)));
