import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

function normalize(err) {
  if (err instanceof ApiError) return err;
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new ApiError(422, details[0]?.message || 'Validation failed', details);
  }
  if (err instanceof mongoose.Error.CastError) return new ApiError(400, `Invalid value for "${err.path}"`);
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {}).join(', ');
    return new ApiError(409, `Duplicate value for ${fields || 'unique field'}`);
  }
  if (err.type === 'entity.parse.failed') return new ApiError(400, 'Malformed JSON body');
  if (err.type === 'entity.too.large') return new ApiError(413, 'Request body too large');
  return new ApiError(500, 'Internal server error');
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const error = normalize(err);
  if (error.statusCode >= 500) console.error(err);
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(env.NODE_ENV !== 'production' && error.statusCode >= 500 && { stack: err.stack }),
  });
}
