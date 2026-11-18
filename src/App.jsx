import { AppRouter } from './app/AppRouter.jsx';
import { useTheme } from './core/hooks/useTheme.js';
import { SplashGate } from './app/SplashGate.jsx';
import './index.css';

export default function App() {
  useTheme();

  return (
    <SplashGate>
      <AppRouter />
    </SplashGate>
  );
}
