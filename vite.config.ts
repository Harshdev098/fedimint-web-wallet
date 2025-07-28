import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/fedimint-web-wallet/',
    plugins: [
        react(),
        wasm(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Fedimint Web Wallet',
                short_name: 'Wallet',
                start_url: '/fedimint-web-wallet/',
                display: 'standalone',
                background_color: '#e5f1ffff',
                theme_color: '#111827',
                icons: [
                    {
                        src: '/fedimint-web-wallet/logo.webp',
                        sizes: '192x192',
                        type: 'image/webp'
                    }
                ]
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.destination === 'document',
                        handler: 'NetworkFirst'
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === 'script' || request.destination === 'worker',
                        handler: 'CacheFirst'
                    },
                    {
                        urlPattern: /.*\.wasm$/,
                        handler: 'CacheFirst'
                    }
                ]
            }

        })
    ],
    build: {
        target: 'esnext',
    },
    worker: {
        format: 'es',
        plugins: () => [
            wasm()
        ]
    },
    optimizeDeps: {
        exclude: ['@fedimint/core-web'],
    },
});
