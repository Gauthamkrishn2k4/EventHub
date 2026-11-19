import { Link, useNavigate, useParams } from 'react-router-dom';
import { createEvent, fetchEvent, updateEvent } from '../../api/events.api.js';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EventForm from '../../components/EventForm.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useAsync } from '../../hooks/useAsync.js';

/** One page for both /admin/events/new and /admin/events/:id/edit. */
export default function EventEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => (id ? fetchEvent(id) : Promise.resolve(null)), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const save = async (payload) => {
    if (id) await updateEvent(id, payload);
    else await createEvent(payload);
    navigate('/admin/events');
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-head">
        <h1>{id ? 'Edit event' : 'New event'}</h1>
        <Link to="/admin/events">Back to events</Link>
      </div>
      <EventForm initial={data?.data} onSubmit={save} />
    </div>
  );
}
