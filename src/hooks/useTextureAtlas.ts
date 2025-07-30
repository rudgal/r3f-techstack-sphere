import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Texture } from 'three';

// Import atlas mapping directly
import atlasMapping from '../data/techstack-atlas-mapping.json' assert { type: 'json' };

interface AtlasMapping {
  textureSize: number[];
  cellSize: number;
  gridSize: number;
  padding: number;
  textures: {
    [key: string]: {
      uvOffset: number[];
      uvRepeat: number[];
    };
  };
}

// Type the imported atlas mapping
const typedAtlasMapping = atlasMapping as AtlasMapping;

/**
 * Hook to load texture atlas and provide UV-mapped textures for technologies
 * Uses technology.id as the lookup key
 */
export function useTechnologyTextures(): {
  getTexture: (technologyId: string) => Texture | null;
} {
  // Load the atlas texture
  const atlasTexture = useTexture('/techstack-atlas.webp');

  // Create texture lookup function
  const getTexture = useMemo(() => {
    if (!atlasTexture) {
      return () => null;
    }

    // Configure atlas texture
    atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    atlasTexture.needsUpdate = true;

    return (technologyId: string): Texture | null => {
      // Direct lookup using technology ID
      const mapping = typedAtlasMapping.textures[technologyId];

      if (!mapping) {
        console.warn(`No atlas mapping found for technology: ${technologyId}`);
        return null;
      }

      // Clone the atlas texture and set UV coordinates
      const clonedTexture = atlasTexture.clone();
      clonedTexture.offset.set(mapping.uvOffset[0], mapping.uvOffset[1]);
      clonedTexture.repeat.set(mapping.uvRepeat[0], mapping.uvRepeat[1]);
      clonedTexture.needsUpdate = true;

      return clonedTexture;
    };
  }, [atlasTexture]);

  return { getTexture };
}
