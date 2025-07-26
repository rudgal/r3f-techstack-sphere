import './App.css';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Experience from './Experience';
import { Perf } from 'r3f-perf';

function App() {
  return (
    <Canvas
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
        position: [3, 2, 6],
      }}
    >
      <Perf showGraph={true} chart={{ hz: 60, length: 240 }} />
      <Experience />
    </Canvas>
  );
}

export default App;
