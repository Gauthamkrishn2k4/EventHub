import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as controller from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recentBookingsQuery } from '../validators/booking.validator.js';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/stats', controller.stats);
router.get('/recent-bookings', validate({ query: recentBookingsQuery }), controller.recentBookings);
export default router;
