import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const register = asyncHandler(async (req, res) =>
  sendSuccess(res, await authService.registerCustomer(req.body), { status: 201 }));

export const login = asyncHandler(async (req, res) => sendSuccess(res, await authService.login(req.body)));

export const me = (req, res) => sendSuccess(res, { user: req.user });
