import { useTextureAtlas } from './useTextureAtlas';
import type { Texture } from 'three';
import type { Technology } from '../types/techstack.ts';

/**
 * Hook to load textures for technology logos with atlas optimization
 * Automatically uses texture atlas if available, falls back to individual textures
 * Note: This hook will suspend during loading (handled by Suspense boundary)
 */
export function useTechnologyTextures(technologies: Technology[]): {
  getTexture: (technology: Technology) => Texture | null;
  isAtlasMode: boolean;
} {
  return useTextureAtlas(technologies);
}
