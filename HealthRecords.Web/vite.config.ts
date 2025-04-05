import {platform} from 'node:os'
import {existsSync, readFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

const appdata = platform() === 'win32' ? process.env.APPDATA : platform() === 'linux' ? `${process.env.HOME}/.local/share` : '';
const key = `${appdata}/HealthRecords/cert.key`;
const cert = `${appdata}/HealthRecords/cert.pem`;
if (!existsSync(key) || !existsSync(cert)) {
  if (0 !== spawnSync('dotnet', [
    'dev-certs',
    'https',
    '--export-path',
    cert,
    '--format',
    'Pem',
    '--no-password'
  ], {stdio: 'inherit'}).status) {
    throw new Error('Failed to generate HTTPS certificate');
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api': {
        target: 'https://localhost:8081',
        secure: false,
      }
    },
    port: 8082,
    strictPort: true,
    https: {
      key: readFileSync(key),
      cert: readFileSync(cert),
    }
  }
})
