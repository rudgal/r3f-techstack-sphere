import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Tile } from './Tile';
import { useTechnologyTextures } from '../hooks/useTextureAtlas';
import { AppConfigProvider } from '../contexts/AppConfigProvider';
import * as THREE from 'three';
import techstackData from '../data/techstack.json';
import type { TechStackData } from '../types/techstack';

function TileDebugScene({ selectedTechId }: { selectedTechId: string }) {
  const { getTexture } = useTechnologyTextures();

  const typedTechstackData = techstackData as TechStackData;
  const selectedTechnology = typedTechstackData.technologies.find(
    (tech) => tech.id === selectedTechId
  );

  if (!selectedTechnology) {
    return null;
  }

  const texture = getTexture(selectedTechId);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

      <Tile
        rotation={new THREE.Euler(0, 0, 0)}
        technology={selectedTechnology}
        texture={texture}
        visible={true}
        viewMode="sphere"
      />

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export function TileDebug() {
  const [selectedTechId, setSelectedTechId] = useState('jsp');
  const typedTechstackData = techstackData as TechStackData;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Technology selector */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <label style={{ color: 'white', marginRight: '10px' }}>
          Technology:
        </label>
        <select
          value={selectedTechId}
          onChange={(e) => setSelectedTechId(e.target.value)}
          style={{ padding: '5px' }}
        >
          {typedTechstackData.technologies.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        style={{ background: '#222' }}
      >
        <AppConfigProvider>
          <TileDebugScene selectedTechId={selectedTechId} />
        </AppConfigProvider>
      </Canvas>
    </div>
  );
}
