import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tile } from './Tile';

// Configuration constants
const TILE_COUNT = 80;
const SPHERE_RADIUS = 2;
const TILE_SIZE = 0.98; // Controls gap size between tiles
const TILE_SEGMENTS = 8; // Subdivision for curved tile surface
const ROTATION_SPEED = 0.2; // Radians per second
const TILE_SPREAD_FACTOR = 0.5; // How much tiles spread on tangent plane

function fibonacciSphere(samples: number, radius: number): THREE.Vector3[] {
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

function createTileGeometry(
  center: THREE.Vector3,
  radius: number,
  tileSize: number = 0.95
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // Create a curved quad that follows the sphere surface
  const segments = TILE_SEGMENTS;
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate vertices in a grid pattern
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = (i / segments - 0.5) * tileSize; // tileSize controls gap size
      const v = (j / segments - 0.5) * tileSize;

      // Calculate position on tangent plane
      const up = new THREE.Vector3(0, 1, 0);
      const normal = center.clone().normalize();
      const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
      const bitangent = new THREE.Vector3()
        .crossVectors(normal, tangent)
        .normalize();

      // Create point on tangent plane
      const planePoint = center
        .clone()
        .add(tangent.clone().multiplyScalar(u * TILE_SPREAD_FACTOR))
        .add(bitangent.clone().multiplyScalar(v * TILE_SPREAD_FACTOR));

      // Project onto sphere
      const spherePoint = planePoint.normalize().multiplyScalar(radius);

      vertices.push(spherePoint.x, spherePoint.y, spherePoint.z);
      normals.push(
        spherePoint.x / radius,
        spherePoint.y / radius,
        spherePoint.z / radius
      );
      uvs.push(i / segments, j / segments);
    }
  }

  // Create indices for triangles
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

export function TechStackSphere() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate sphere points and tile geometries
  const { spherePoints, tileGeometries } = useMemo(() => {
    const points = fibonacciSphere(TILE_COUNT, SPHERE_RADIUS);
    const geometries = points.map((point) =>
      createTileGeometry(point, SPHERE_RADIUS, TILE_SIZE)
    );
    return { spherePoints: points, tileGeometries: geometries };
  }, []);

  // Auto-rotation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * ROTATION_SPEED;
    }
  });

  return (
    <group ref={groupRef}>
      {spherePoints.map((_point, index) => (
        <Tile
          key={index}
          geometry={tileGeometries[index]}
          color={`hsl(${(index / TILE_COUNT) * 360}, 70%, 50%)`}
          index={index}
        />
      ))}
    </group>
  );
}
