import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent build errors when environment variables are not set.
    // The index.html script block provides safe runtime fallbacks.
    __firebase_config: JSON.stringify(process.env.VITE_FIREBASE_CONFIG || '{}'),
    __app_id: JSON.stringify(process.env.VITE_APP_ID || 'nexus-os-v15'),
    __initial_auth_token: JSON.stringify(process.env.VITE_INITIAL_AUTH_TOKEN || ''),
  },
});
