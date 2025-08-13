import './App.css';
import { StrictMode } from 'react';
import { TechstackSphereConfigProvider } from './contexts/TechstackSphereConfigProvider.tsx';
import { AppContent } from './AppContent';
import { TileDebug } from './components/TileDebug';

function App() {
  // Check if debug mode is enabled via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get('debug') === 'tile';

  return (
    <StrictMode>
      <TechstackSphereConfigProvider>
        {isDebugMode ? <TileDebug /> : <AppContent />}
      </TechstackSphereConfigProvider>
    </StrictMode>
  );
}

export default App;
