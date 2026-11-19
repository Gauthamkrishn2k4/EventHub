import { PAGINATION } from '../config/constants.js';

export function getPagination({ page, limit } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
  const safePage = Math.max(Number(page) || 1, 1);
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export const buildMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});
