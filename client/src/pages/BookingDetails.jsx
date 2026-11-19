import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { cancelBooking, fetchBooking } from '../api/bookings.api.js';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatDateTime, formatTotal } from '../utils/format.js';

export default function BookingDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { state } = useLocation();
  const { data, loading, error, reload } = useAsync(() => fetchBooking(id), [id]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <main className="container"><ErrorMessage error={error} onRetry={reload} /></main>;

  const booking = data.data;
  const event = booking.eventId;
  const canCancel = booking.status === 'Confirmed' && new Date(event.eventDate) > new Date();

  const cancel = async () => {
    setBusy(true);
    try {
      await cancelBooking(booking._id);
      setConfirming(false);
      reload();
    } catch (err) {
      setActionError(err);
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 640 }}>
      {state?.justBooked && booking.status === 'Confirmed' && <div className="alert alert--success">Booking confirmed. Keep your reference handy.</div>}
      <ErrorMessage error={actionError} />
      <div className="panel">
        <div className="page-head" style={{ marginBottom: '.5rem' }}>
          <div>
            <span className="muted">Booking reference</span>
            <div className="ref">{booking.bookingReference}</div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <h2><Link to={`/events/${event._id}`}>{event.title}</Link></h2>
        <div className="kv"><span className="muted">When</span><span>{formatDateTime(event.eventDate)}</span></div>
        <div className="kv"><span className="muted">Where</span><span>{event.location}</span></div>
        {isAdmin && <div className="kv"><span className="muted">Customer</span><span>{booking.userId.name} ({booking.userId.email})</span></div>}
        <div className="kv"><span className="muted">Tickets</span><span>{booking.quantity} × {formatTotal(booking.ticketPrice)}</span></div>
        <div className="kv"><span className="muted">Total</span><strong>{formatTotal(booking.totalAmount)}</strong></div>
        <div className="kv"><span className="muted">Booked</span><span>{formatDateTime(booking.bookedAt)}</span></div>
        {booking.cancelledAt && <div className="kv"><span className="muted">Cancelled</span><span>{formatDateTime(booking.cancelledAt)}</span></div>}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '.6rem' }}>
          <Link className="btn btn--ghost" to={isAdmin ? '/admin/bookings' : '/my-bookings'}>Back to bookings</Link>
          {canCancel && <button className="btn btn--danger" onClick={() => setConfirming(true)}>Cancel booking</button>}
        </div>
      </div>
      <ConfirmationModal open={confirming} danger title="Cancel this booking?" message="Your tickets will be released and the booking can't be reinstated." confirmLabel="Cancel booking" busy={busy} onConfirm={cancel} onCancel={() => setConfirming(false)} />
    </main>
  );
}
