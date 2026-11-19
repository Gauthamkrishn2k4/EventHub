import { ApiError } from '../utils/ApiError.js';

/**
 * validate({ body, params, query }) - each value is a zod schema.
 * Parsed (coerced / stripped) values replace the originals, so handlers never see unvalidated input.
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(new ApiError(422, details[0]?.message || 'Validation failed', details));
    }
    req[key] = result.data;
  }
  next();
};
