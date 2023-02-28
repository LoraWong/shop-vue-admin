import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://ceshi13.dishait.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/chart-api': {
        target: ' https://mock.mengxuegu.com/mock/63fca4927c016026ff2b8cc3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chart-api/, '/api'),
      },
    },
  },

  plugins: [vue(), WindiCSS()],
})
