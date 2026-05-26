function AdminModal({ title, message, confirmLabel, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onCancel}>
      <div className="admin-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>

        <div className="admin-modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
