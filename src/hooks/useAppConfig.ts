import { useContext } from 'react';
import { AppConfigContext } from '../contexts/AppConfigContext';
import type { AppConfig } from '../constants/appConfig';

// Custom hook to use the app configuration
export function useAppConfig(): AppConfig {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}