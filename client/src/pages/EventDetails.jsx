import { Link, useParams } from 'react-router-dom';
import { fetchEvent } from '../api/events.api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { formatDate, formatMoney } from '../utils/format.js';

export default function EventDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { data, loading, error, reload } = useAsync(() => fetchEvent(id), [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <main className="container"><ErrorMessage error={error} onRetry={error.status === 404 ? undefined : reload} /><Link to="/">Back to events</Link></main>;

  const event = data.data;
  const started = new Date(event.eventDate) <= new Date();
  const bookable = event.status === 'Published' && !started && event.availableTickets > 0;
  const time = event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : null;

  return (
    <main className="container detail">
      <section>
        {event.imageUrl && <img className="hero-img" src={event.imageUrl} alt="" />}
        <h1>{event.title}</h1>
        <p className="muted">{event.category}</p>
        <p style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
      </section>
      <aside className="panel">
        <div className="kv"><span className="muted">Date</span><span>{formatDate(event.eventDate)}</span></div>
        {time && <div className="kv"><span className="muted">Time</span><span>{time}</span></div>}
        <div className="kv"><span className="muted">Location</span><span>{event.location}</span></div>
        <div className="kv"><span className="muted">Price</span><strong>{formatMoney(event.ticketPrice)}</strong></div>
        <div className="kv"><span className="muted">Availability</span><span>{event.availableTickets} of {event.totalTickets} left</span></div>
        {isAdmin && <div className="kv"><span className="muted">Status</span><StatusBadge status={event.status} /></div>}
        <div style={{ marginTop: '1rem' }}>
          {isAdmin ? (
            <Link className="btn" to={`/admin/events/${event._id}/edit`}>Edit event</Link>
          ) : bookable ? (
            user ? <Link className="btn" to={`/events/${event._id}/book`}>Book tickets</Link>
              : <Link className="btn" to="/login" state={{ from: `/events/${event._id}/book` }}>Log in to book</Link>
          ) : (
            <span className="low">{started ? 'This event has started' : event.status !== 'Published' ? 'Not open for booking' : 'Sold out'}</span>
          )}
        </div>
      </aside>
    </main>
  );
}
