import { useMemo, useRef, useState } from 'react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Texture } from 'three';
import * as THREE from 'three';
import type { Technology } from '../types/techstack';
import { HoverLabel } from './HoverLabel';

// Tile dimensions
export const TILE_SIZE = 0.4;
export const TILE_DEPTH = 0.04;
const TILE_RADIUS = 0.02; // Rounded corner radius
const TILE_HOVER_SCALE_FACTOR = 1.4;
const TILE_HOVER_DISTANCE = 0.1; // Distance to move away from center on hover
const DEFAULT_BACKGROUND_COLOR = '#dee2e6';
const TEXTURE_SIZE_RATIO = 0.85; // Texture size relative to tile size

interface TileProps {
  rotation: THREE.Euler;
  technology: Technology;
  texture?: Texture | null;
  visible?: boolean;
  sphereRadius?: number; // For dynamic sphere radius
  normalizedPosition?: THREE.Vector3; // For base position calculation
  onHover?: (isHovered: boolean) => void;
}

export function Tile({
  rotation,
  technology,
  texture,
  visible = true,
  sphereRadius,
  normalizedPosition,
  onHover,
}: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Determine background color once
  const backgroundColor =
    technology.backgroundColor || DEFAULT_BACKGROUND_COLOR;

  // Calculate target position based on sphere radius and normalized position
  const targetPosition = useMemo(() => {
    // Calculate position from normalized position and sphere radius
    if (normalizedPosition && sphereRadius !== undefined) {
      return normalizedPosition
        .clone()
        .multiplyScalar(sphereRadius + TILE_DEPTH / 2);
    }

    // Fallback to origin if no position data
    return new THREE.Vector3(0, 0, 0);
  }, [normalizedPosition, sphereRadius]);

  // Smooth scale and position animation
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const targetScale = hovered ? TILE_HOVER_SCALE_FACTOR : 1;
    const targetOffset = hovered ? TILE_HOVER_DISTANCE : 0;

    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 8);
    const newOffset = THREE.MathUtils.lerp(
      currentOffset,
      targetOffset,
      delta * 8
    );

    setCurrentScale(newScale);
    setCurrentOffset(newOffset);

    groupRef.current.scale.setScalar(newScale);

    // Calculate final position with hover offset applied to the base position
    const normalizedDirection = targetPosition.clone().normalize();
    const finalPosition = targetPosition
      .clone()
      .add(normalizedDirection.multiplyScalar(newOffset));

    // Set position (smoothly lerp to new position when sphere radius changes)
    groupRef.current.position.lerp(finalPosition, delta * 5);
  });

  const handleClick = () => {
    if (technology.url) {
      window.open(technology.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  // Use a group to better handle textures
  return (
    <group ref={groupRef} rotation={rotation} visible={visible}>
      {/* Main tile body */}
      <RoundedBox
        args={[TILE_SIZE, TILE_SIZE, TILE_DEPTH]}
        radius={TILE_RADIUS}
        smoothness={4}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={backgroundColor}
          roughness={0.4}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Texture overlay - only render if we have a texture */}
      {texture && (
        <mesh position={[0, 0, TILE_DEPTH / 2 + 0.001]}>
          <planeGeometry args={calculateTextureDimensions(texture)} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            // alphaTest={0.1}
            roughness={0.4}
            metalness={0.1}
            // emissive={backgroundColor}
            // emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
      )}

      {/* Hover label */}
      <HoverLabel
        label={technology.name}
        visible={hovered}
        position={[0, TILE_SIZE * 0.7, 0]}
      />
    </group>
  );
}

/**
 * Calculate plane dimensions to maintain texture aspect ratio
 * while fitting within the tile bounds (similar to CSS object-fit: contain)
 */
function calculateTextureDimensions(texture: Texture): [number, number] {
  if (!texture.image)
    return [TILE_SIZE * TEXTURE_SIZE_RATIO, TILE_SIZE * TEXTURE_SIZE_RATIO];

  const imageAspect = texture.image.width / texture.image.height;
  const maxSize = TILE_SIZE * TEXTURE_SIZE_RATIO;

  let width, height;
  if (imageAspect > 1) {
    // Wider than tall
    width = maxSize;
    height = maxSize / imageAspect;
  } else {
    // Taller than wide or square
    width = maxSize * imageAspect;
    height = maxSize;
  }

  return [width, height];
}
