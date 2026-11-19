import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as controller from '../controllers/event.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';
import { createEventSchema, listEventsQuery, statusSchema, updateEventSchema } from '../validators/event.validator.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

// Public (guests, customers) - admins get extra visibility through optionalAuth.
router.get('/', optionalAuth, validate({ query: listEventsQuery }), controller.list);
router.get('/categories', optionalAuth, controller.categories); // must stay above '/:id'
router.get('/:id', optionalAuth, validate({ params: idParam }), controller.getOne);

// Admin
router.post('/', ...adminOnly, validate({ body: createEventSchema }), controller.create);
router.put('/:id', ...adminOnly, validate({ params: idParam, body: updateEventSchema }), controller.update);
router.patch('/:id/status', ...adminOnly, validate({ params: idParam, body: statusSchema }), controller.updateStatus);
router.delete('/:id', ...adminOnly, validate({ params: idParam }), controller.remove);

export default router;
