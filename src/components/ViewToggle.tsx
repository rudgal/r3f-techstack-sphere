import styles from './ViewToggle.module.css';

interface ViewToggleProps {
  viewMode: 'sphere' | 'flat';
  onViewModeChange: (mode: 'sphere' | 'flat') => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${viewMode === 'sphere' ? styles.active : ''}`}
          onClick={() => onViewModeChange('sphere')}
          title="Sphere View"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <ellipse
              cx="12"
              cy="12"
              rx="4"
              ry="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          className={`${styles.button} ${viewMode === 'flat' ? styles.active : ''}`}
          onClick={() => onViewModeChange('flat')}
          title="Flat View"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
