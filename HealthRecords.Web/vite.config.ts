import { platform } from 'node:os'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from "node:path";

const appdata = platform() === 'win32' ? process.env.APPDATA : platform() === 'linux' ? `${process.env.HOME}/.local/share` : '';
const key = `${appdata}/HealthRecords/cert.key`;
const cert = `${appdata}/HealthRecords/cert.pem`;
if (!existsSync(key) || !existsSync(cert)) {
  mkdirSync(`${appdata}/HealthRecords/`, { recursive: true })
  if (0 !== spawnSync('dotnet', [
    'dev-certs',
    'https',
    '--export-path',
    cert,
    '--format',
    'Pem',
    '--no-password'
  ], { stdio: 'inherit' }).status) {
    throw new Error('Failed to generate HTTPS certificate');
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite({ autoCodeSplitting: true })],
  server: {
    proxy: {
      '^/api': {
        target: 'https://127.0.0.1:8081',
        secure: false,
      }
    },
    port: 8082,
    strictPort: true,
    https: {
      key: readFileSync(key),
      cert: readFileSync(cert),
    }
  },
  resolve: {
    alias: {
      '@assets': resolve(__dirname, 'src/assets'),
      '@components': resolve(__dirname, 'src/components'),
      '@ctypes': resolve(__dirname, 'src/types'),
      '@api': resolve(__dirname, 'src/api'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      '@': resolve(__dirname, 'src'),
    }
  }
})
