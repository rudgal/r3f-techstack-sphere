import { Helper, Html, PresentationControls } from '@react-three/drei';
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

      <directionalLight position={[1, 2, 3]} intensity={4.5}>
        <Helper type={DirectionalLightHelper} args={[1]} />
      </directionalLight>
      <ambientLight intensity={1.5} />

      <Suspense fallback={null}>
        <PresentationControls
          enabled={true}
          global={true} // Only rotate when dragging on the sphere
          cursor={true} // Show grab cursor
          snap={false} // Don't snap back to center
          speed={1} // Rotation speed
          rotation={[0, 0, 0]} // Initial rotation
          polar={[-0.1, 0.01]} // Limit vertical rotation to ±5.7 degrees
          azimuth={[-Infinity, Infinity]} // Unlimited horizontal rotation
          damping={0.15} // Spring config
        >
          <TechStackSphere selectedCategory={selectedCategory} />
        </PresentationControls>
      </Suspense>
    </>
  );
}
