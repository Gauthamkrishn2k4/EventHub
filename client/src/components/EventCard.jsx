import { Link } from 'react-router-dom';
import { dayParts, formatMoney } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

export default function EventCard({ event }) {
  const { day, month } = dayParts(event.eventDate);
  const soldOut = event.availableTickets === 0;
  return (
    <Link to={`/events/${event._id}`} className="ticket">
      <div className="ticket__stub">
        <strong>{day}</strong>
        <span>{month}</span>
      </div>
      <div className="ticket__body">
        {event.imageUrl && <div className="ticket__img" style={{ backgroundImage: `url(${event.imageUrl})` }} />}
        <h3>{event.title}</h3>
        <span className="muted">{event.category} · {event.location}</span>
        <div className="ticket__row">
          <span className="price">{formatMoney(event.ticketPrice)}</span>
          {event.status !== 'Published' ? <StatusBadge status={event.status} /> : soldOut ? <span className="low">Sold out</span>
            : event.availableTickets <= 10 ? <span className="low">{event.availableTickets} left</span>
            : <span className="muted">{event.availableTickets} available</span>}
        </div>
      </div>
    </Link>
  );
}
