import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'
import fs from 'fs'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'copy-web-config',
            closeBundle() {
                fs.copyFileSync(
                    resolve(__dirname, 'web.config'),
                    resolve(__dirname, 'build/web.config')
                )
            }
        }
    ],
    define: {
        'process.env': process.env, 
    },
    optimizeDeps: {
        include: ['@mui/material/Tooltip',],
    },
    build: {
        outDir: 'build',
        sourcemap: true,
        chunkSizeWarningLimit: 4000,

    },
    server: {
        port: 55578,
        host: true,
    },
    base: '/Quantum/',
})
