import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://stackoverflow.com/questions/70709987/how-to-load-environment-variables-from-env-file-using-vite
export default defineConfig({
    plugins: [react()],
    envDir: '../Server' // Sharing Server .env
})