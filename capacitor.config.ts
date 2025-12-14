import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swapskills.ireland',
  appName: 'SwapSkills Ireland',
  webDir: 'dist',
  server: {
    url: 'https://5e5fdbe8-d406-4baf-8194-5acdc4b3d545.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
