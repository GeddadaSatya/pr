import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sovereign.expensetracker',
  appName: 'Personal Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
