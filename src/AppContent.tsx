import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Perf } from 'r3f-perf';
import { Loader, Preload } from '@react-three/drei';
import Experience from './Experience';
import { TailwindBreakpointsHelper } from './components/TailwindBreakpointsHelper.tsx';
import { CategoryFilter } from './components/CategoryFilter';
import { ViewToggle } from './components/ViewToggle';
import type { Category } from './types/techstack';
import { Leva } from 'leva';
import { useAppConfig } from './hooks/useAppConfig';
import { useTailwindBreakpoint } from './hooks/useTailwindBreakpoint';

export function AppContent() {
  const { scene } = useAppConfig();
  const { isMd } = useTailwindBreakpoint();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'sphere' | 'flat'>('sphere');

  const handleCategoryToggle = (category: Category | null) => {
    if (category === null) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory((prev) => (prev === category ? null : category));
    }
  };

  return (
    <>
      <Leva
        fill={false}
        flat={true}
        oneLineLabels={false}
        titleBar={true}
        collapsed={!isMd || import.meta.env.PROD}
        theme={{
          sizes: {
            rootWidth: '340px',
            controlWidth: '160px',
            numberInputMinWidth: '48px',
          },
        }}
      />
      <div className="relative h-[100dvh] w-screen">
        {/* UI Overlays */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryToggle={handleCategoryToggle}
          />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Three.js Canvas */}
        <Suspense fallback={null}>
          <Canvas
            className="three-canvas"
            shadows={scene.enableShadows}
            // orthographic
            // flat
            dpr={[1, 2]}
            gl={{
              // alpha: false,
              // antialias: false,
              // stencil: false,
              // depth: false,
              // powerPreference: "high-performance",
              // preserveDrawingBuffer: true,
              toneMapping: THREE.CineonToneMapping,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            onCreated={({ gl }) => {
              gl.shadowMap.type = THREE.VSMShadowMap;
            }}
            camera={{
              fov: 55,
              // zoom: 100,
              near: 0.1,
              far: 200,
              position: [0, 0, 4.5],
            }}
          >
            {isMd && (
              <Perf
                showGraph={true}
                chart={{ hz: 60, length: 240 }}
                position="top-left"
              />
            )}
            <Experience
              selectedCategory={selectedCategory}
              viewMode={viewMode}
            />
            <Preload all />
          </Canvas>
        </Suspense>
        <Loader
          containerStyles={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          }}
          innerStyles={{
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            width: '400px',
            height: '200px',
            borderRadius: '8px',
            padding: '40px',
          }}
          barStyles={{
            backgroundColor: '#5B7C99',
            height: '10px',
          }}
          dataStyles={{
            color: '#f3f3f3',
            fontSize: '18px',
            fontFamily: 'monospace',
          }}
        />
      </div>
      {import.meta.env.DEV && <TailwindBreakpointsHelper />}
    </>
  );
}
