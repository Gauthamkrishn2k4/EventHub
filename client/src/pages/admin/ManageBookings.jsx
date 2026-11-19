import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cancelBooking, fetchAllBookings } from '../../api/bookings.api.js';
import { fetchEvents } from '../../api/events.api.js';
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDateTime, formatTotal } from '../../utils/format.js';

export default function ManageBookings() {
  const [reference, setReference] = useState('');
  const [eventId, setEventId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const ref = useDebounce(reference);

  const events = useAsync(() => fetchEvents({ limit: 50, sort: 'date_desc' }), []);
  const { data, loading, error, reload } = useAsync(
    () => fetchAllBookings({ reference: ref || undefined, eventId: eventId || undefined, status: status || undefined, page, limit: 10 }),
    [ref, eventId, status, page]
  );

  const reset = (setter) => (value) => { setter(value); setPage(1); };

  const cancel = async () => {
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
    <>
      <h1>Bookings</h1>
      <div className="toolbar">
        <SearchBar value={reference} onChange={reset(setReference)} placeholder="Search by booking reference" />
        <select className="input" aria-label="Event" value={eventId} onChange={(e) => reset(setEventId)(e.target.value)}>
          <option value="">All events</option>
          {events.data?.data.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
        <select className="input" aria-label="Status" value={status} onChange={(e) => reset(setStatus)(e.target.value)}>
          <option value="">All statuses</option>
          <option>Confirmed</option><option>Cancelled</option>
        </select>
      </div>
      <ErrorMessage error={error || actionError} onRetry={error ? reload : undefined} />
      {loading ? <LoadingSpinner /> : data && (data.data.length === 0 ? <EmptyState title="No bookings match">Adjust the filters to see more.</EmptyState> : (
        <>
          <div className="table-wrap"><table>
            <thead><tr><th>Reference</th><th>Customer</th><th>Event</th><th>Qty</th><th>Amount</th><th>Status</th><th>Booked</th><th /></tr></thead>
            <tbody>
              {data.data.map((b) => (
                <tr key={b._id}>
                  <td><Link to={`/bookings/${b._id}`}>{b.bookingReference}</Link></td>
                  <td>{b.userId?.name}<br /><span className="muted">{b.userId?.email}</span></td>
                  <td>{b.eventId?.title}</td>
                  <td>{b.quantity}</td>
                  <td>{formatTotal(b.totalAmount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>{formatDateTime(b.bookedAt)}</td>
                  <td>{b.status === 'Confirmed' && b.eventId && new Date(b.eventId.eventDate) > new Date() && <button className="btn btn--small btn--danger" onClick={() => setTarget(b)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Pagination meta={data.meta} onChange={setPage} />
        </>
      ))}
      <ConfirmationModal open={Boolean(target)} danger title="Cancel this booking?" message={target ? `${target.bookingReference} will be cancelled and ${target.quantity} ticket(s) released.` : ''} confirmLabel="Cancel booking" busy={busy} onConfirm={cancel} onCancel={() => setTarget(null)} />
    </>
  );
}
