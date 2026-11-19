export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="alert alert--error" role="alert">
      {error.message || String(error)}
      {onRetry && (
        <button className="btn btn--small btn--ghost" style={{ marginLeft: '1rem' }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
