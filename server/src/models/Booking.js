import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
    },
    ticketPrice: { type: Number, required: true, min: 0 }, // price captured at booking time
    totalAmount: { type: Number, required: true, min: 0 }, // always calculated by the backend
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.CONFIRMED },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
  },
  { timestamps: { createdAt: 'bookedAt', updatedAt: 'updatedAt' } }
);

bookingSchema.index({ userId: 1, bookedAt: -1 }); // "my bookings"
bookingSchema.index({ eventId: 1, status: 1 }); // admin filters, delete-guard, dashboard
bookingSchema.index({ status: 1, bookedAt: -1 }); // admin list + recent bookings

bookingSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);
