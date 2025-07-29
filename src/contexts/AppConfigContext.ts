import { createContext } from 'react';
import type { AppConfig } from '../constants/appConfig';

// Context
export const AppConfigContext = createContext<AppConfig | null>(null);