import './Skeleton.css';

export const Skeleton = () => {
  return (
    <div className="project-skeleton">
      <div className="skeleton-title" />
      
      <div className="skeleton-row" />
      <div className="skeleton-row" />
      <div className="skeleton-row short" />

      <div className="skeleton-section">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    </div>
  );
};
