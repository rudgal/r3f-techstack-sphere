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

export function CategoryFilter({
  selectedCategory,
  onCategoryToggle,
}: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${!selectedCategory ? styles.selected : ''}`}
          onClick={() => onCategoryToggle(null)}
        >
          SHOW ALL
        </button>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              className={`${styles.button} ${isSelected ? styles.selected : ''}`}
              onClick={() => onCategoryToggle(category)}
            >
              {CATEGORY_LABELS[category].toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
