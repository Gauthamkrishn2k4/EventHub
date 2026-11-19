import { Link } from 'react-router-dom';
import { formatDateTime, formatTotal } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

export default function BookingCard({ booking, canCancel, onCancel }) {
  const event = booking.eventId;
  return (
    <article className="panel">
      <div className="page-head" style={{ marginBottom: '.5rem' }}>
        <div>
          <h3>{event?.title ?? 'Event removed'}</h3>
          <span className="muted">{event && formatDateTime(event.eventDate)}</span>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="kv"><span className="muted">Reference</span><strong>{booking.bookingReference}</strong></div>
      <div className="kv"><span className="muted">Tickets</span><span>{booking.quantity} × {formatTotal(booking.ticketPrice)}</span></div>
      <div className="kv"><span className="muted">Total</span><strong>{formatTotal(booking.totalAmount)}</strong></div>
      <div style={{ marginTop: '.9rem', display: 'flex', gap: '.5rem' }}>
        <Link className="btn btn--small btn--ghost" to={`/bookings/${booking._id}`}>Details</Link>
        {canCancel && <button className="btn btn--small btn--danger" onClick={() => onCancel(booking)}>Cancel booking</button>}
      </div>
    </article>
  );
}
