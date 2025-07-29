import {
  OrbitControls,
  PresentationControls,
  useHelper,
} from '@react-three/drei';
import { TechStackSphere } from './components/TechStackSphere';
import { Suspense, useRef } from 'react';
import type { Category } from './types/techstack';
import type { DirectionalLight, OrthographicCamera } from 'three';
import { CameraHelper, DirectionalLightHelper } from 'three';

interface ExperienceProps {
  selectedCategory: Category | null;
  viewMode: 'sphere' | 'flat';
  showHelpers?: boolean;
}

export default function Experience({
  selectedCategory,
  viewMode,
  showHelpers = false,
}: ExperienceProps) {
  const lightRef = useRef<DirectionalLight>(null!);
  const shadowCameraRef = useRef<OrthographicCamera>(null!);

  useHelper(showHelpers ? lightRef : null, DirectionalLightHelper, 1);
  useHelper(showHelpers ? shadowCameraRef : null, CameraHelper);

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[6, 2, 4]}
        intensity={4}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-radius={8}
        shadow-blurSamples={10}
      >
        <orthographicCamera
          ref={shadowCameraRef}
          attach="shadow-camera"
          near={5.5}
          far={9.5}
          left={-1.5}
          right={1.5}
          top={1.5}
          bottom={-1.5}
        />
      </directionalLight>
      <ambientLight intensity={4} />

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
