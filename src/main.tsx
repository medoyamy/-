import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { patchConsole } from './lib/mapUtils';
import { testFirestoreConnection } from './firebase';
import './index.css';

// Apply global console patch to prevent circular JSON errors in AI Studio
patchConsole();

// Test connection on startup
testFirestoreConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
