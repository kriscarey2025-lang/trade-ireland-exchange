import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swapskills.ireland',
  appName: 'SwapSkills Ireland',
  webDir: 'dist',
  server: {
    url: 'https://swap-skills.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
