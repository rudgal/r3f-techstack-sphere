import './App.css';
import { StrictMode } from 'react';
import { AppConfigProvider } from './contexts/AppConfigProvider';
import { AppContent } from './AppContent';
import { TileDebug } from './components/TileDebug';

function App() {
  // Check if debug mode is enabled via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get('debug') === 'tile';

  return (
    <StrictMode>
      <AppConfigProvider>
        {isDebugMode ? <TileDebug /> : <AppContent />}
      </AppConfigProvider>
    </StrictMode>
  );
}

export default App;
