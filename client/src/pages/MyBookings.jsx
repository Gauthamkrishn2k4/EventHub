import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking, fetchMyBookings } from '../api/bookings.api.js';
import BookingCard from '../components/BookingCard.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAsync } from '../hooks/useAsync.js';

export default function MyBookings() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const { data, loading, error, reload } = useAsync(() => fetchMyBookings({ status: status || undefined, page, limit: 6 }), [status, page]);

  const confirmCancel = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await cancelBooking(target._id);
      reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
      setTarget(null);
    }
  };

  return (
    <main className="container">
      <div className="page-head">
        <h1>My bookings</h1>
        <select className="input" style={{ width: 'auto' }} aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All bookings</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <ErrorMessage error={error || actionError} onRetry={error ? reload : undefined} />
      {loading ? <LoadingSpinner /> : data && (
        data.data.length === 0 ? (
          <EmptyState title="No bookings yet"><Link to="/">Find an event</Link> and your tickets will show up here.</EmptyState>
        ) : (
          <>
            <div className="cards">
              {data.data.map((b) => (
                <BookingCard key={b._id} booking={b} canCancel={b.status === 'Confirmed' && b.eventId && new Date(b.eventId.eventDate) > new Date()} onCancel={setTarget} />
              ))}
            </div>
            <Pagination meta={data.meta} onChange={setPage} />
          </>
        )
      )}
      <ConfirmationModal open={Boolean(target)} danger title="Cancel this booking?" message={target ? `${target.bookingReference} will be cancelled and its tickets released.` : ''} confirmLabel="Cancel booking" busy={busy} onConfirm={confirmCancel} onCancel={() => setTarget(null)} />
    </main>
  );
}
