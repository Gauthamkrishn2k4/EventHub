import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as controller from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminBookingsQuery, createBookingSchema, myBookingsQuery } from '../validators/booking.validator.js';
import { idParam } from '../validators/common.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize(ROLES.CUSTOMER), validate({ body: createBookingSchema }), controller.create);
router.get('/my', authorize(ROLES.CUSTOMER), validate({ query: myBookingsQuery }), controller.listMine); // above '/:id'
router.get('/', authorize(ROLES.ADMIN), validate({ query: adminBookingsQuery }), controller.listAll);
router.get('/:id', validate({ params: idParam }), controller.getOne); // owner or admin, enforced in the service
router.patch('/:id/cancel', validate({ params: idParam }), controller.cancel); // owner or admin

export default router;
