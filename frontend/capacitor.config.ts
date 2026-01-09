import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flexicash.app',
  appName: 'FlexiCash SA',
  webDir: 'build',
  server: {
    // Allow clear text traffic for local development
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
