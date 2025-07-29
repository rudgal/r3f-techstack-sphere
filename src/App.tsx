import './App.css';
import { StrictMode } from 'react';
import { AppConfigProvider } from './contexts/AppConfigProvider';
import { AppContent } from './AppContent';

function App() {
  return (
    <StrictMode>
      <AppConfigProvider>
        <AppContent />
      </AppConfigProvider>
    </StrictMode>
  );
}

export default App;
