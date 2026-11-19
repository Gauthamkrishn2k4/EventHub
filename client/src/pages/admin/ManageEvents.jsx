import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteEvent, fetchEvents, updateEventStatus } from '../../api/events.api.js';
import ConfirmationModal from '../../components/ConfirmationModal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDate, formatMoney } from '../../utils/format.js';

const ACTIONS = {
  publish: { title: 'Publish this event?', message: 'It becomes visible and bookable for customers.', label: 'Publish' },
  unpublish: { title: 'Move to draft?', message: 'Customers will no longer see this event. Existing bookings stay as they are.', label: 'Move to draft' },
  cancel: { title: 'Cancel this event?', message: 'All confirmed bookings will be cancelled and tickets released. This cannot be undone.', label: 'Cancel event', danger: true },
  delete: { title: 'Delete this event?', message: 'This permanently removes the event. Events with bookings cannot be deleted.', label: 'Delete', danger: true },
};

export default function ManageEvents() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { type, event }
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const q = useDebounce(search);
  const { data, loading, error, reload } = useAsync(
    () => fetchEvents({ search: q || undefined, status: status || undefined, page, limit: 10, sort: 'date_desc' }),
    [q, status, page]
  );

  const run = async () => {
    const { type, event } = pending;
    setBusy(true);
    setActionError(null);
    try {
      if (type === 'delete') await deleteEvent(event._id);
      else await updateEventStatus(event._id, { publish: 'Published', unpublish: 'Draft', cancel: 'Cancelled' }[type]);
      reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const cfg = pending && ACTIONS[pending.type];
  return (
    <>
      <div className="page-head">
        <h1>Events</h1>
        <Link className="btn" to="/admin/events/new">New event</Link>
      </div>
      <div className="toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <select className="input" aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option>Draft</option><option>Published</option><option>Cancelled</option>
        </select>
      </div>
      <ErrorMessage error={error || actionError} onRetry={error ? reload : undefined} />
      {loading ? <LoadingSpinner /> : data && (data.data.length === 0 ? <EmptyState title="No events">Create your first event to get started.</EmptyState> : (
        <>
          <div className="table-wrap"><table>
            <thead><tr><th>Event</th><th>Date</th><th>Price</th><th>Sold</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.data.map((e) => (
                <tr key={e._id}>
                  <td>{e.title}<br /><span className="muted">{e.category}</span></td>
                  <td>{formatDate(e.eventDate)}</td>
                  <td>{formatMoney(e.ticketPrice)}</td>
                  <td>{e.totalTickets - e.availableTickets}/{e.totalTickets}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>
                    {e.status !== 'Cancelled' && <Link className="btn btn--small btn--ghost" to={`/admin/events/${e._id}/edit`}>Edit</Link>}
                    {e.status === 'Draft' && <button className="btn btn--small" onClick={() => setPending({ type: 'publish', event: e })}>Publish</button>}
                    {e.status === 'Published' && <button className="btn btn--small btn--ghost" onClick={() => setPending({ type: 'unpublish', event: e })}>Deactivate</button>}
                    {e.status !== 'Cancelled' && <button className="btn btn--small btn--ghost" onClick={() => setPending({ type: 'cancel', event: e })}>Cancel</button>}
                    <button className="btn btn--small btn--danger" onClick={() => setPending({ type: 'delete', event: e })}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Pagination meta={data.meta} onChange={setPage} />
        </>
      ))}
      <ConfirmationModal open={Boolean(pending)} danger={cfg?.danger} title={cfg?.title} message={cfg ? `${pending.event.title}: ${cfg.message}` : ''} confirmLabel={cfg?.label} busy={busy} onConfirm={run} onCancel={() => setPending(null)} />
    </>
  );
}
