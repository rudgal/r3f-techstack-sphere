import { useContext } from 'react';
import { TechstackSphereConfigContext } from '../contexts/TechstackSphereConfigContext.ts';
import type { TechstackSphereConfig } from '../constants/techstackSphereConfig.ts';

// Custom hook to use the TechstackSphere configuration
export function useTechstackSphereConfig(): TechstackSphereConfig {
  const context = useContext(TechstackSphereConfigContext);
  if (!context) {
    throw new Error(
      'useTechstackSphereConfig must be used within an TechstackSphereConfigProvider'
    );
  }
  return context;
}
