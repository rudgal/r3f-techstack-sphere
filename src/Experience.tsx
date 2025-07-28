import { Helper, Html, OrbitControls } from '@react-three/drei';
import { TechStackSphere } from './components/TechStackSphere';
import { CategoryFilter } from './components/CategoryFilter';
import type { Category } from './types/techstack';
import { Suspense, useState } from 'react';
import { DirectionalLightHelper } from 'three';

export default function Experience() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleCategoryToggle = (category: Category | null) => {
    if (category === null) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory((prev) => (prev === category ? null : category));
    }
  };

  return (
    <>
      <Html fullscreen>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryToggle={handleCategoryToggle}
        />
      </Html>

      <OrbitControls />

      <directionalLight position={[1, 2, 3]} intensity={4.5}>
        <Helper type={DirectionalLightHelper} args={[1]} />
      </directionalLight>
      <ambientLight intensity={1.5} />

      <Suspense fallback={null}>
        <TechStackSphere selectedCategory={selectedCategory} />
      </Suspense>
    </>
  );
}
