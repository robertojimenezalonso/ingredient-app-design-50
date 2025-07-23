import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Inicializar Capacitor
if (Capacitor.isNativePlatform()) {
  import('@capacitor/haptics');
}

createRoot(document.getElementById("root")!).render(<App />);
