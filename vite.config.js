import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173, // 开发服务器端口
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()], // 自动导入 Element Plus
      }),
      Components({
        resolvers: [ElementPlusResolver()], // 自动注册 Element Plus 组件
      }),
    ],
    devtool: 'source-map', // 启用 source-map
    define: {
      'process.env': env, // 注入环境变量
    },
  };
});