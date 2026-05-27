function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <div className="skeleton-image skeleton-shimmer" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line-long skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-medium skeleton-shimmer" />
        <div className="skeleton-line skeleton-line-short skeleton-shimmer" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-price skeleton-shimmer" />
        <div className="skeleton-button skeleton-shimmer" />
      </div>
    </article>
  );
}

export default SkeletonCard;
