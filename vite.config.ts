import {fileURLToPath,URL} from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {defineConfig} from 'vite';
export default defineConfig({base:'/Hidden-Guest-OS/',plugins:[react()],resolve:{alias:{'@':fileURLToPath(new URL('./',import.meta.url))}},css:{postcss:{plugins:[tailwindcss()]}}});
