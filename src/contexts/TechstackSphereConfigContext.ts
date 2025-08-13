import { createContext } from 'react';
import type { TechstackSphereConfig } from '../constants/techstackSphereConfig.ts';

// Context
export const TechstackSphereConfigContext =
  createContext<TechstackSphereConfig | null>(null);
