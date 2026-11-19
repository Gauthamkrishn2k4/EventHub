import { useState } from 'react';
import { fetchCategories, fetchEvents } from '../api/events.api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EventCard from '../components/EventCard.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { dayRange } from '../utils/format.js';

export default function EventList() {
  const [filters, setFilters] = useState({ search: '', category: '', date: '', sort: 'date_asc', page: 1 });
  const search = useDebounce(filters.search);

  // Any filter change goes back to page 1.
  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const { data: cats } = useAsync(fetchCategories, []);
  const { data, loading, error, reload } = useAsync(
    () => fetchEvents({
      search: search || undefined,
      category: filters.category || undefined,
      ...(filters.date ? dayRange(filters.date) : {}),
      sort: filters.sort,
      page: filters.page,
      limit: 9,
    }),
    [search, filters.category, filters.date, filters.sort, filters.page]
  );

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1>What's on</h1>
          <p className="muted" style={{ margin: 0 }}>Browse upcoming events and book your tickets.</p>
        </div>
      </div>
      <div className="toolbar">
        <SearchBar value={filters.search} onChange={(search) => update({ search })} />
        <FilterPanel categories={cats?.data} filters={filters} onChange={update} />
        {(filters.search || filters.category || filters.date) && (
          <button className="btn btn--ghost btn--small" onClick={() => update({ search: '', category: '', date: '' })}>Clear filters</button>
        )}
      </div>

      <ErrorMessage error={error} onRetry={reload} />
      {loading ? <LoadingSpinner /> : data && (
        data.data.length === 0 ? (
          <EmptyState title="No events found">Try a different title, category or date.</EmptyState>
        ) : (
          <>
            <div className="cards">{data.data.map((e) => <EventCard key={e._id} event={e} />)}</div>
            <Pagination meta={data.meta} onChange={(page) => update({ page })} />
          </>
        )
      )}
    </main>
  );
}
