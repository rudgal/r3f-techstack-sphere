import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Edges } from '@react-three/drei';
import * as THREE from 'three';
import type { Technology } from '../types/techstack';

// Tile dimensions
const TILE_SIZE = 0.4;
export const TILE_DEPTH = 0.03;
const TILE_RADIUS = 0.02; // Rounded corner radius
const TILE_HOVERED_SCALE_FACTOR = 1.3;

interface TileProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  technology: Technology;
  index: number;
  isBlank?: boolean;
  onHover?: (isHovered: boolean) => void;
}

export function Tile({ position, rotation, technology, isBlank = false, onHover }: TileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  // Smooth scale animation
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const targetScale = hovered ? TILE_HOVERED_SCALE_FACTOR : 1;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 8);
    setCurrentScale(newScale);

    meshRef.current.scale.setScalar(newScale);
  });

  const handleClick = () => {
    if (!isBlank && technology.url) {
      window.open(technology.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <RoundedBox
      ref={meshRef}
      args={[TILE_SIZE, TILE_SIZE, TILE_DEPTH]}
      radius={TILE_RADIUS}
      smoothness={4}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover?.(true);
        document.body.style.cursor = isBlank ? 'default' : 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover?.(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      {isBlank ? (
        <>
          <meshBasicMaterial
            transparent={true}
            opacity={0}
          />
          <Edges
            color={technology.backgroundColor}
            lineWidth={2}
          />
        </>
      ) : (
        <meshStandardMaterial
          color={technology.backgroundColor}
          emissive={hovered ? technology.backgroundColor : 'black'}
          emissiveIntensity={hovered ? 0.3 : 0}
          roughness={0.4}
          metalness={0.1}
        />
      )}
    </RoundedBox>
  );
}
