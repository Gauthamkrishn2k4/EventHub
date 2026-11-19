export default function FilterPanel({ categories = [], filters, onChange }) {
  return (
    <>
      <select className="input" aria-label="Category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input className="input" type="date" aria-label="Date" value={filters.date} onChange={(e) => onChange({ date: e.target.value })} />
      <select className="input" aria-label="Sort" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
        <option value="date_asc">Soonest first</option>
        <option value="date_desc">Latest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </>
  );
}
