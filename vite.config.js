import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [
    vue(),
    AutoImport({
    resolvers: [ElementPlusResolver()],
    }),
    Components({
    resolvers: [ElementPlusResolver()],
    }),
      
  ],
  devtool: 'source-map'
})
