import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.eda8bb8260c4427e8f1e2cd677392303',
  appName: 'ingredient-app-design-50',
  webDir: 'dist',
  server: {
    url: "https://eda8bb82-60c4-427e-8f1e-2cd677392303.lovableproject.com?forceHideBadge=true",
    hostname: "ygmlvvveoacykrqsmnva.supabase.co",
    androidScheme: "https",
    iosScheme: "https", 
    cleartext: true,
    allowNavigation: [
      "ygmlvvveoacykrqsmnva.supabase.co",
      "images.unsplash.com"
    ]
  },
  plugins: {
    Haptics: {
      vibrationDuration: 50
    },
    CapacitorHttp: {
      enabled: true
    },
    Keyboard: {
      resize: 'none',
      style: 'dark',
      resizeOnFullScreen: false
    }
  }
};

export default config;