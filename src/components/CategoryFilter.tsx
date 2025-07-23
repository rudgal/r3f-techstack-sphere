import type { Category } from '../types/techstack';
import { CATEGORIES } from '../types/techstack';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  selectedCategory: Category | null;
  onCategoryToggle: (category: Category | null) => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  web: 'Web',
  'java/jvm': 'Java/JVM',
  languages: 'Languages',
  quality: 'Quality',
  devops: 'DevOps',
  tools: 'Tools',
};

const CATEGORY_COLORS: Record<Category, string> = {
  web: '#61DAFB',
  'java/jvm': '#007396',
  languages: '#F7DF1E',
  quality: '#4CAF50',
  devops: '#FF9800',
  tools: '#9C27B0',
};

export function CategoryFilter({
  selectedCategory,
  onCategoryToggle,
}: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${!selectedCategory ? styles.selected : ''}`}
          style={{
            backgroundColor: !selectedCategory ? '#666' : 'transparent',
            borderColor: '#666',
            color: !selectedCategory ? '#fff' : '#666',
          }}
          onClick={() => onCategoryToggle(null)}
        >
          Show All
        </button>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              className={`${styles.button} ${isSelected ? styles.selected : ''}`}
              style={{
                backgroundColor: isSelected
                  ? CATEGORY_COLORS[category]
                  : 'transparent',
                borderColor: CATEGORY_COLORS[category],
                color: isSelected ? '#fff' : CATEGORY_COLORS[category],
              }}
              onClick={() => onCategoryToggle(category)}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
