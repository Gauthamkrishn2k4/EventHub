export default function Pagination({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="btn btn--ghost btn--small" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        Previous
      </button>
      <span>Page {meta.page} of {meta.totalPages}</span>
      <button className="btn btn--ghost btn--small" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>
        Next
      </button>
    </nav>
  );
}
