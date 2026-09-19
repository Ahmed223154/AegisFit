import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aegisfit.gymtracker',
  appName: 'AegisFit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'ionic'
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile'
  }
};

export default config;
