import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.60f92ef10eeb4a2e8998b612d99f2537',
  appName: 'ingredient-app-design',
  webDir: 'dist',
  server: {
    url: "https://60f92ef1-0eeb-4a2e-8998-b612d99f2537.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Haptics: {
      vibrationDuration: 50
    }
  }
};

export default config;