import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';

async function resolveUser(header) {
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required');
  let payload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account no longer exists');
  return user;
}

/** Requires a valid JWT; attaches the user (with role from the DB, not the token) to req.user. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(req.headers.authorization);
  next();
});

/** Attaches req.user when a token is sent, otherwise continues as a guest. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  if (req.headers.authorization) req.user = await resolveUser(req.headers.authorization);
  next();
});

/** Role guard. Always use after `authenticate`. */
export const authorize =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role) ? next() : next(new ApiError(403, 'You do not have permission to perform this action'));
