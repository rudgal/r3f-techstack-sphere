import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Texture } from 'three';
import type { Technology } from '../types/techstack.ts';

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
 * Falls back to individual texture loading if atlas is not available
 */
export function useTextureAtlas(technologies: Technology[]): {
  getTexture: (technology: Technology) => Texture | null;
  isAtlasMode: boolean;
  isLoading: boolean;
} {
  // Check if atlas is available
  const isAtlasAvailable = Boolean(typedAtlasMapping);

  // Determine texture URLs - always return a consistent array
  const textureUrls = useMemo(() => {
    if (isAtlasAvailable) {
      // Use atlas
      return ['/techstack-atlas.webp'];
    } else {
      // Fall back to individual textures
      return technologies.map((tech) => tech.icon);
    }
  }, [isAtlasAvailable, technologies]);

  // Always call useTexture with consistent array
  const textures = useTexture(textureUrls);

  // Create texture lookup function
  const textureData = useMemo(() => {
    if (isAtlasAvailable && typedAtlasMapping && textureUrls.length === 1) {
      // Atlas mode
      const atlasTexture = Array.isArray(textures) ? textures[0] : textures;
      
      if (!atlasTexture) {
        return {
          getTexture: () => null,
          isAtlasMode: true,
          isLoading: false
        };
      }

      // Configure atlas texture
      atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
      atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
      atlasTexture.needsUpdate = true;

      const getTexture = (technology: Technology): Texture | null => {
        // Direct lookup using technology ID
        const mapping = typedAtlasMapping.textures[technology.id];

        if (!mapping) {
          console.warn(`No atlas mapping found for technology: ${technology.id} (${technology.name})`);
          return null;
        }


        // Clone the atlas texture and set UV coordinates
        const clonedTexture = atlasTexture.clone();
        clonedTexture.offset.set(mapping.uvOffset[0], mapping.uvOffset[1]);
        clonedTexture.repeat.set(mapping.uvRepeat[0], mapping.uvRepeat[1]);
        clonedTexture.needsUpdate = true;

        return clonedTexture;
      };

      return {
        getTexture,
        isAtlasMode: true,
        isLoading: false
      };

    } else {
      // Individual texture mode (fallback)
      const textureArray = Array.isArray(textures) ? textures : [textures];
      const textureMap = new Map<string, Texture | null>();

      technologies.forEach((tech, index) => {
        const texture = textureArray[index] || null;

        if (texture && texture.image) {
          // Configure texture to show full image
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.repeat.set(1, 1);
          texture.offset.set(0, 0);
          texture.center.set(0.5, 0.5);
          texture.rotation = 0;
          texture.needsUpdate = true;
        }

        textureMap.set(tech.id, texture);
      });

      const getTexture = (technology: Technology): Texture | null => {
        return textureMap.get(technology.id) || null;
      };

      return {
        getTexture,
        isAtlasMode: false,
        isLoading: false
      };
    }
  }, [textures, isAtlasAvailable, technologies, textureUrls.length]);

  return textureData;
}