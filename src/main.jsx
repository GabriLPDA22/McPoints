import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fuentes empaquetadas: sin conexión y sin enviar la IP a Google en cada arranque.
import '@fontsource-variable/inter/wght.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
