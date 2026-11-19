import { Link } from 'react-router-dom';
import { fetchRecentBookings, fetchStats } from '../../api/dashboard.api.js';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { formatDate, formatDateTime, formatTotal } from '../../utils/format.js';

const Stat = ({ label, value }) => (
  <div className="panel stat"><span className="muted">{label}</span><strong>{value}</strong></div>
);

export default function Dashboard() {
  const stats = useAsync(fetchStats, []);
  const recent = useAsync(() => fetchRecentBookings(6), []);

  if (stats.loading) return <LoadingSpinner />;
  if (stats.error) return <ErrorMessage error={stats.error} onRetry={stats.reload} />;
  const { events, bookings, upcomingEvents, mostBooked } = stats.data.data;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        <Stat label="Total events" value={events.total} />
        <Stat label="Published events" value={events.published} />
        <Stat label="Total bookings" value={bookings.total} />
        <Stat label="Confirmed" value={bookings.confirmed} />
        <Stat label="Cancelled" value={bookings.cancelled} />
        <Stat label="Confirmed booking value" value={formatTotal(bookings.confirmedValue)} />
      </div>
      <p className="muted">Booking value counts confirmed bookings only; cancelled bookings are refunded.</p>

      <div className="two-col">
        <section className="panel">
          <h2>Recent bookings</h2>
          <ErrorMessage error={recent.error} onRetry={recent.reload} />
          {recent.loading ? <LoadingSpinner /> : recent.data?.data.length === 0 ? <p className="muted">No bookings yet.</p> : (
            <div className="table-wrap"><table><tbody>
              {recent.data?.data.map((b) => (
                <tr key={b._id}>
                  <td><Link to={`/bookings/${b._id}`}>{b.bookingReference}</Link><br /><span className="muted">{b.userId?.name} · {formatDateTime(b.bookedAt)}</span></td>
                  <td>{formatTotal(b.totalAmount)}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </section>

        <section className="panel">
          <h2>Upcoming events</h2>
          {upcomingEvents.length === 0 ? <p className="muted">No upcoming published events.</p> : (
            <div className="table-wrap"><table><tbody>
              {upcomingEvents.map((e) => (
                <tr key={e._id}>
                  <td><Link to={`/admin/events/${e._id}/edit`}>{e.title}</Link><br /><span className="muted">{formatDate(e.eventDate)}</span></td>
                  <td>{e.availableTickets}/{e.totalTickets} left</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </section>

        <section className="panel">
          <h2>Most-booked events</h2>
          {mostBooked.length === 0 ? <p className="muted">Bookings will appear here once tickets sell.</p> : (
            <div className="table-wrap"><table><tbody>
              {mostBooked.map((m) => (
                <tr key={m.eventId}>
                  <td>{m.title}<br /><span className="muted">{m.bookings} booking(s)</span></td>
                  <td>{m.ticketsSold} tickets</td>
                  <td>{formatTotal(m.revenue)}</td>
                </tr>
              ))}
            </tbody></table></div>
          )}
        </section>
      </div>
    </>
  );
}
