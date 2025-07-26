import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Texture } from 'three';
import type { Technology } from '../types/techstack';

/**
 * Hook to load textures for technology logos with fallback handling
 * Uses @react-three/drei's useTexture for efficient loading and caching
 * Note: This hook will suspend during loading (handled by Suspense boundary)
 */
export function useTechnologyTextures(technologies: Technology[]): {
  getTexture: (technology: Technology) => Texture | null;
} {
  // Extract texture paths directly from technology data and load them
  const textureUrls = useMemo(() => {
    return technologies.map((tech) => tech.icon);
  }, [technologies]);

  // Always call useTexture - React hooks must be called unconditionally
  // Note: useTexture will suspend during loading and handle errors internally
  const textures = useTexture(textureUrls);

  // Configure textures and create lookup function
  const getTexture = useMemo(() => {
    const textureMap = new Map<string, Texture | null>();

    technologies.forEach((tech, index) => {
      // Handle both single texture and array cases
      const textureArray = Array.isArray(textures) ? textures : [textures];
      const texture = textureArray[index] || null;

      if (texture && texture.image) {
        // Configure texture to show full image (similar to objectFit: 'contain')
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Reset to defaults first
        texture.repeat.set(1, 1);
        texture.offset.set(0, 0);
        texture.center.set(0.5, 0.5);
        texture.rotation = 0;

        // Update texture
        texture.needsUpdate = true;
      }

      textureMap.set(tech.id, texture);
    });

    return (technology: Technology): Texture | null => {
      return textureMap.get(technology.id) || null;
    };
  }, [technologies, textures]);

  return {
    getTexture,
  };
}
