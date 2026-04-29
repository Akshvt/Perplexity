/**
 * Programmatic Vite build — bypasses the .vite-temp config bundling
 * that causes ERR_MODULE_NOT_FOUND on Vercel's Node runtime.
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

await build({
    plugins: [react(), tailwindcss()],
});
