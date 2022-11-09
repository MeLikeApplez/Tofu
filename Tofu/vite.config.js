import { defineConfig } from 'vite'
// import vueJsx from '@vitejs/plugin-vue-jsx'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react({
            // jsxRuntime: 'classic'
        })
    ],
})