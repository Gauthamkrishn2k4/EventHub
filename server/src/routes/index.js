import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookingRoutes from './booking.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import eventRoutes from './event.routes.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/dashboard', dashboardRoutes);
export default router;
