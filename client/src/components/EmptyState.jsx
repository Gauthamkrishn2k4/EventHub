export default function EmptyState({ title, children }) {
  return (
    <div className="empty panel">
      <h3>{title}</h3>
      <div className="muted">{children}</div>
    </div>
  );
}
