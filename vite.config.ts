import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateFile from 'vite-plugin-generate-file';
import { qrcode } from 'vite-plugin-qrcode';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    generateFile([
      {
        type: 'json',
        output: './build-info.json',
        data: {
          buildTime: new Date().toISOString(),
          version: process.env.npm_package_version,
        },
      },
    ]),
    qrcode(),
  ],
});
