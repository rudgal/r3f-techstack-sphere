import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tile, TILE_DEPTH, TILE_SIZE } from './Tile';
import techStackDataRaw from '../data/techstack.json';
import type { Technology, TechStackData, Category } from '../types/techstack';

const techStackData = techStackDataRaw as TechStackData;

interface TechStackSphereProps {
  selectedCategory: Category | null;
}

// Configuration constants
const MIN_TILE_SEPARATION = 0.6; // Minimum distance between tile centers
const BASE_SPHERE_RADIUS = 1.5; // Minimum sphere radius
const MAX_SPHERE_RADIUS = 3.0; // Maximum sphere radius to prevent excessive size
const ROTATION_SPEED = 0.2; // Radians per second
const ROTATION_SPEED_TILE_HOVERED = 0.05; // Slower rotation when tile is hovered
const SPEED_LERP_FACTOR = 3; // How quickly rotation speed changes
const RADIUS_LERP_FACTOR = 2; // How quickly radius changes
const RADIUS_THRESHOLD = 0.001; // Minimum change to update radius

export function TechStackSphere({ selectedCategory }: TechStackSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hoveredTileIndexRef = useRef<number | null>(null);
  const currentSpeedRef = useRef(ROTATION_SPEED);
  const currentRadiusRef = useRef(BASE_SPHERE_RADIUS);

  // Filter technologies based on selected category
  const technologies: Technology[] = useMemo(() => {
    if (!selectedCategory) {
      return techStackData.technologies;
    }
    return techStackData.technologies.filter((tech) =>
      tech.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  // Calculate target sphere radius based on tile count
  const targetRadius = useMemo(() => {
    return calculateSphereRadius(technologies.length, TILE_SIZE);
  }, [technologies.length]);

  // Generate tile data with positions and rotations
  const tilesData = useMemo(() => {
    const points = fibonacciSphere(technologies.length, 1); // Use unit sphere for base calculations
    const radius = targetRadius;
    currentRadiusRef.current = radius;

    return points.map((point, index) => {
      const normal = point.clone().normalize();
      const rotation = calculateTileRotation(normal);
      const position = calculateTilePosition(normal, radius);

      return {
        position,
        rotation,
        technology: technologies[index],
        normalizedPosition: normal, // Store normalized position to avoid recalculating
      };
    });
  }, [technologies, targetRadius]);

  // Animation helpers
  const animateRotationSpeed = (delta: number) => {
    const targetSpeed =
      hoveredTileIndexRef.current !== null
        ? ROTATION_SPEED_TILE_HOVERED
        : ROTATION_SPEED;

    currentSpeedRef.current = THREE.MathUtils.lerp(
      currentSpeedRef.current,
      targetSpeed,
      delta * SPEED_LERP_FACTOR
    );
  };

  const animateRadius = (delta: number) => {
    const currentRadius = currentRadiusRef.current;
    const newRadius = THREE.MathUtils.lerp(
      currentRadius,
      targetRadius,
      delta * RADIUS_LERP_FACTOR
    );

    if (Math.abs(newRadius - currentRadius) > RADIUS_THRESHOLD) {
      currentRadiusRef.current = newRadius;
    }
  };

  // Auto-rotation and smooth radius transitions
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    animateRotationSpeed(delta);
    animateRadius(delta);

    groupRef.current.rotation.y += delta * currentSpeedRef.current;
  });

  const handleTileHover = useCallback((index: number, isHovered: boolean) => {
    hoveredTileIndexRef.current = isHovered ? index : null;
  }, []);

  return (
    <group ref={groupRef}>
      {tilesData.map((tileData, index) => {
        const position = calculateTilePosition(
          tileData.normalizedPosition,
          currentRadiusRef.current
        );

        return (
          <Tile
            key={tileData.technology.id}
            position={position}
            rotation={tileData.rotation}
            technology={tileData.technology}
            onHover={(isHovered) => handleTileHover(index, isHovered)}
          />
        );
      })}
    </group>
  );
}

// Utility functions
function calculateSphereRadius(tileCount: number, tileSize: number): number {
  if (tileCount === 0) return BASE_SPHERE_RADIUS;
  if (tileCount === 1) return BASE_SPHERE_RADIUS;

  // Calculate required surface area per tile (including separation)
  const areaPerTile = Math.pow(tileSize + MIN_TILE_SEPARATION, 2);
  const totalRequiredArea = tileCount * areaPerTile;

  // Calculate radius from surface area: Surface Area = 4πr²
  const calculatedRadius = Math.sqrt(totalRequiredArea / (4 * Math.PI));

  // Apply reasonable bounds
  return Math.max(
    BASE_SPHERE_RADIUS,
    Math.min(MAX_SPHERE_RADIUS, calculatedRadius)
  );
}

function fibonacciSphere(samples: number, radius: number): THREE.Vector3[] {
  if (samples === 0) return [];
  if (samples === 1) return [new THREE.Vector3(0, radius, 0)];

  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2; // y from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }

  return points;
}

function calculateTileRotation(normal: THREE.Vector3): THREE.Euler {
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);

  // If the point is at the poles, use a different reference vector
  if (Math.abs(normal.y) > 0.999) {
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  } else {
    // Calculate the rotation that aligns Z-axis with normal and keeps Y-axis pointing toward equator
    const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
    const bitangent = new THREE.Vector3()
      .crossVectors(normal, tangent)
      .normalize();

    const matrix = new THREE.Matrix4();
    matrix.makeBasis(tangent, bitangent, normal);
    quaternion.setFromRotationMatrix(matrix);
  }

  rotation.setFromQuaternion(quaternion);
  return rotation;
}

function calculateTilePosition(
  normal: THREE.Vector3,
  radius: number
): THREE.Vector3 {
  // For a sphere, the normal is the same as the normalized position
  return normal.clone().multiplyScalar(radius + TILE_DEPTH / 2);
}
