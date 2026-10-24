import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: '.showcase-dist',
    rolldownOptions: {
      input: 'showcase/index.html',
      onwarn(warning, warn) {
        // 展示页是纯客户端应用，依赖中的 RSC 指令无需保留。
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return
        warn(warning)
      },
    },
  },
})
