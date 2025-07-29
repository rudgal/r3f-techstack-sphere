import { Helper, OrbitControls, PresentationControls } from '@react-three/drei';
import { TechStackSphere } from './components/TechStackSphere';
import type { Category } from './types/techstack';
import { Suspense } from 'react';
import { DirectionalLightHelper } from 'three';

interface ExperienceProps {
  selectedCategory: Category | null;
  viewMode: 'sphere' | 'flat';
}

export default function Experience({
  selectedCategory,
  viewMode,
}: ExperienceProps) {
  return (
    <>
      <directionalLight position={[1, 2, 3]} intensity={4.5}>
        <Helper type={DirectionalLightHelper} args={[1]} />
      </directionalLight>
      <ambientLight intensity={1.5} />

      <OrbitControls enabled={false} />

      <Suspense fallback={null}>
        <PresentationControls
          // key={controlsKey}
          enabled={true}
          global={true}
          cursor={false}
          snap={viewMode === 'flat'}
          speed={1}
          // zoom={1.05} // seems to have very negative impact on performance
          rotation={[0, 0, 0]}
          polar={[-0.1, 0.2]}
          azimuth={viewMode === 'flat' ? [-0.1, 0.1] : [-Infinity, Infinity]}
          damping={0.15}
        >
          <TechStackSphere
            selectedCategory={selectedCategory}
            viewMode={viewMode}
          />
        </PresentationControls>
      </Suspense>
    </>
  );
}
