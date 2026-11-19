import { useEffect } from 'react';

export default function ConfirmationModal({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={busy}>Keep it</button>
          <button className={`btn ${danger ? 'btn--danger' : ''}`} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
