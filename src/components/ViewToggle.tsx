import styles from './ViewToggle.module.css';
import { TbWorld } from 'react-icons/tb';
import { BsGrid3X3Gap } from 'react-icons/bs';

interface ViewToggleProps {
  viewMode: 'sphere' | 'flat';
  onViewModeChange: (mode: 'sphere' | 'flat') => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.buttonGroup} ${viewMode === 'flat' ? styles.flat : ''}`}>
        <button
          className={`${styles.button} ${viewMode === 'sphere' ? styles.active : ''}`}
          onClick={() => onViewModeChange('sphere')}
          title="Sphere View"
        >
          <TbWorld size={24} />
        </button>
        <button
          className={`${styles.button} ${viewMode === 'flat' ? styles.active : ''}`}
          onClick={() => onViewModeChange('flat')}
          title="Flat View"
        >
          <BsGrid3X3Gap size={24} />
        </button>
      </div>
    </div>
  );
}
