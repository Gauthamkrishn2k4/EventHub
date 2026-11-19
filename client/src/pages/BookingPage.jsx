import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBooking } from '../api/bookings.api.js';
import { fetchEvent } from '../api/events.api.js';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate, formatTotal } from '../utils/format.js';

const MAX_PER_BOOKING = 10;

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => fetchEvent(id), [id]);
  const [quantity, setQuantity] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <main className="container"><ErrorMessage error={error} onRetry={reload} /></main>;

  const event = data.data;
  const max = Math.min(MAX_PER_BOOKING, event.availableTickets);
  const valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= max;
  const estimate = valid ? quantity * event.ticketPrice : 0; // preview only; the server calculates the real total

  const confirm = async () => {
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await createBooking({ eventId: event._id, quantity });
      navigate(`/bookings/${res.data._id}`, { replace: true, state: { justBooked: true } });
    } catch (err) {
      setSubmitError(err);
      setConfirming(false);
      setBusy(false);
      if (err.status === 409) reload(); // availability changed; refresh numbers
    }
  };

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <h1>Book tickets</h1>
      <div className="panel">
        <h2>{event.title}</h2>
        <p className="muted">{formatDate(event.eventDate)} · {event.location}</p>
        <ErrorMessage error={submitError} />
        {max < 1 ? (
          <p className="low">No tickets available. <Link to="/">Browse other events</Link></p>
        ) : (
          <>
            <div className="kv"><span className="muted">Price per ticket</span><span>{formatTotal(event.ticketPrice)}</span></div>
            <div className="kv"><span className="muted">Tickets left</span><span>{event.availableTickets}</span></div>
            <div className="qty">
              <button className="btn btn--ghost btn--small" aria-label="Fewer tickets" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <input className="input" type="number" min="1" max={max} value={quantity} aria-label="Quantity" onChange={(e) => setQuantity(Number(e.target.value))} />
              <button className="btn btn--ghost btn--small" aria-label="More tickets" onClick={() => setQuantity((q) => Math.min(max, q + 1))}>+</button>
            </div>
            {!valid && <p className="field__error">Choose between 1 and {max} tickets.</p>}
            <div className="kv"><span>Total</span><span className="total">{formatTotal(estimate)}</span></div>
            <p className="muted" style={{ marginTop: '.75rem' }}>Payments are simulated: no card is needed. The final amount is confirmed by the server.</p>
            <button className="btn" disabled={!valid} onClick={() => setConfirming(true)}>Review booking</button>
          </>
        )}
      </div>
      <ConfirmationModal
        open={confirming}
        title="Confirm your booking"
        message={`${quantity} ticket(s) for ${event.title}, ${formatTotal(estimate)} in total.`}
        confirmLabel="Pay and confirm"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => !busy && setConfirming(false)}
      />
    </main>
  );
}
