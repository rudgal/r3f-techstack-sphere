import { useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tile, TILE_SIZE } from './Tile';
import { useTechnologyTextures } from '../hooks/useTechnologyTextures';
import type { Category, Technology } from '../types/techstack';
import techStackDataRaw from '../data/techstack.json';

const ALL_TECHNOLOGIES = techStackDataRaw.technologies as Technology[];

interface TechStackSphereProps {
  selectedCategory: Category | null;
}

// Configuration constants
const MIN_TILE_SEPARATION = 0.6; // Minimum distance between tile centers
const BASE_SPHERE_RADIUS = 0.3; // Minimum sphere radius
const MAX_SPHERE_RADIUS = 3.0; // Maximum sphere radius to prevent excessive size
const ROTATION_SPEED = 0.2; // Radians per second
const ROTATION_SPEED_TILE_HOVERED = 0.05; // Slower rotation when tile is hovered
const SPEED_LERP_FACTOR = 3; // How quickly rotation speed changes
const RADIUS_LERP_FACTOR = 2; // How quickly radius changes
const RADIUS_THRESHOLD = 0.001; // Minimum change to update radius
const POLE_EXCLUSION_PERCENTAGE_TOP = 0.2;
const POLE_EXCLUSION_PERCENTAGE_BOTTOM = 0.5;

export function TechStackSphere({ selectedCategory }: TechStackSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hoveredTileIndexRef = useRef<number | null>(null);
  const currentSpeedRef = useRef(ROTATION_SPEED);
  const currentRadiusRef = useRef(BASE_SPHERE_RADIUS);

  // Filter technologies for sphere size calculation only
  const visibleTechnologies: Technology[] = useMemo(() => {
    if (!selectedCategory) {
      return ALL_TECHNOLOGIES;
    }
    return ALL_TECHNOLOGIES.filter((tech) =>
      tech.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  // Calculate Fibonacci points for the VISIBLE technology count (proper sphere distribution)
  const filteredFibonacciPoints = useMemo(() => {
    return fibonacciSphere(visibleTechnologies.length, 1);
  }, [visibleTechnologies.length]);

  // Create content mapping: assign visible technologies to properly distributed positions
  const tileContentMapping = useMemo(() => {
    const mapping = new Map<number, Technology>();
    const positionMapping = new Map<number, THREE.Vector3>(); // Map tile index to new position
    const rotationMapping = new Map<number, THREE.Euler>(); // Map tile index to new rotation

    visibleTechnologies.forEach((tech, index) => {
      if (
        index < ALL_TECHNOLOGIES.length &&
        index < filteredFibonacciPoints.length
      ) {
        const point = filteredFibonacciPoints[index];
        const normal = point.clone().normalize();
        const rotation = calculateTileRotation(normal);


        mapping.set(index, tech); // Assign technology to tile position `index`
        positionMapping.set(index, normal); // Store normalized position for this tile
        rotationMapping.set(index, rotation); // Store rotation for this tile
      }
    });

    return {
      technologyMapping: mapping,
      positionMapping,
      rotationMapping,
    };
  }, [visibleTechnologies, filteredFibonacciPoints]);

  // Load textures for all technologies (with atlas optimization)
  const { getTexture } = useTechnologyTextures(ALL_TECHNOLOGIES);

  // Calculate target sphere radius based on VISIBLE tile count
  const targetRadius = useMemo(() => {
    return calculateSphereRadius(visibleTechnologies.length, TILE_SIZE);
  }, [visibleTechnologies.length]);

  // Generate tile data for ALL technologies (positions will be calculated later per tile)
  const allTilesData = useMemo(() => {
    const points = fibonacciSphere(ALL_TECHNOLOGIES.length, 1); // Use unit sphere for base calculations

    return points.map((point, index) => {
      const normal = point.clone().normalize();
      const rotation = calculateTileRotation(normal);

      return {
        rotation,
        technology: ALL_TECHNOLOGIES[index],
        normalizedPosition: normal, // Store normalized position for later position calculation
        index, // Store index for stable positioning
      };
    });
  }, []); // Only calculate once - never changes!

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
      {allTilesData.map((tileData, index) => {
        // Get the technology assigned to this tile position (or null if none)
        const assignedTechnology =
          tileContentMapping.technologyMapping.get(index);
        const isVisible = assignedTechnology !== undefined;

        // Get the recalculated position and rotation for proper sphere distribution
        const filteredNormalizedPosition =
          tileContentMapping.positionMapping.get(index);
        const filteredRotation = tileContentMapping.rotationMapping.get(index);

        // Use assigned technology or fallback to original (for texture loading)
        const technologyToUse = assignedTechnology || tileData.technology;
        
        const texture = getTexture(technologyToUse);

        return (
          <Tile
            key={index} // Use stable index-based key instead of technology.id
            rotation={filteredRotation || tileData.rotation} // Use filtered rotation or fallback
            technology={technologyToUse} // Use assigned technology or fallback
            texture={texture}
            visible={isVisible}
            sphereRadius={targetRadius} // Pass target radius for position calculation
            normalizedPosition={
              filteredNormalizedPosition || tileData.normalizedPosition
            } // Use filtered position or fallback
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

  // Exclude poles based on configuration
  const yMax = 1 - POLE_EXCLUSION_PERCENTAGE_TOP; // Top exclusion
  const yMin = -(1 - POLE_EXCLUSION_PERCENTAGE_BOTTOM); // Bottom exclusion

  // Generate more points than needed to filter out poles
  const oversample = Math.ceil(samples * 1.5); // Generate 50% more points

  for (let i = 0; i < oversample; i++) {
    const y = 1 - (i / (oversample - 1)) * 2; // y from 1 to -1

    // Skip points in the polar regions
    if (y > yMax || y < yMin) continue;

    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));

    // Stop when we have enough valid points
    if (points.length >= samples) break;
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
