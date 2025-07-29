import './App.css';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Experience from './Experience';
import { Perf } from 'r3f-perf';
import { StrictMode, useState } from 'react';
import { TailwindBreakpointsHelper } from './components/TailwindBreakpointsHelper.tsx';
import { CategoryFilter } from './components/CategoryFilter';
import { ViewToggle } from './components/ViewToggle';
import type { Category } from './types/techstack';

function App() {
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
    <StrictMode>
      <div className="relative h-screen w-screen">
        {/* UI Overlays */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryToggle={handleCategoryToggle}
          />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Three.js Canvas */}
        <Canvas
          className="three-canvas"
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
          camera={{
            fov: 55,
            // zoom: 100,
            near: 0.1,
            far: 200,
            position: [0, 0, 4.5],
            // position: [0, 0, 4.5],
          }}
        >
          <Perf
            showGraph={true}
            chart={{ hz: 60, length: 240 }}
            position="top-left"
          />
          <Experience selectedCategory={selectedCategory} viewMode={viewMode} />
        </Canvas>
      </div>
      {import.meta.env.DEV && <TailwindBreakpointsHelper />}
    </StrictMode>
  );
}

export default App;
