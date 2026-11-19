import mongoose from 'mongoose';
import { EVENT_STATUS } from '../config/constants.js';

const timeRule = { type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format'] };

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 5000 },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    // Instant at which the event starts (date + start time, stored in UTC).
    eventDate: { type: Date, required: [true, 'Event date is required'] },
    startTime: timeRule, // display only, e.g. "18:30"
    endTime: timeRule,
    ticketPrice: { type: Number, required: true, min: [0, 'Ticket price cannot be negative'] },
    totalTickets: { type: Number, required: true, min: [1, 'Capacity must be greater than zero'] },
    availableTickets: {
      type: Number,
      required: true,
      min: [0, 'Available tickets cannot be negative'],
      validate: {
        // Runs on create/save. Updates go through atomic operators in the services.
        validator(value) {
          return this.totalTickets === undefined || value <= this.totalTickets;
        },
        message: 'Available tickets cannot exceed total tickets',
      },
    },
    imageUrl: { type: String, trim: true },
    status: { type: String, enum: Object.values(EVENT_STATUS), default: EVENT_STATUS.DRAFT },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, eventDate: 1 }); // public listing + date sorting
eventSchema.index({ status: 1, category: 1 });
eventSchema.index({ title: 1 });
eventSchema.index({ status: 1, ticketPrice: 1 });

eventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Event = mongoose.model('Event', eventSchema);
