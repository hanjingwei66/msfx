import { resolve } from 'path';
import uni from '@dcloudio/vite-plugin-uni';
import { ConfigEnv, defineConfig, loadEnv, UserConfig, type ProxyOptions } from 'vite';

/** 当前执行 node 命令时文件夹的地址（工作目录） */
const root: string = process.cwd();

/**
 * 路径查找。
 *
 * @param dir - 目录。
 * @returns 绝对路径。
 */
function pathResolve(dir: string): string {
  return resolve(__dirname, '.', dir);
}

interface Env {
  /** APP 标题 */
  VITE_APP_TITLE: string;
  /** 服务端口 */
  VITE_PORT: number;
  /** 日志等级 */
  VITE_LOG_LEVEL: string;
  /** 接口地址 */
  VITE_PUBLIC_PATH: string;
}

/**
 * 处理环境变量。
 *
 * @param envConf - 环境变量。
 * @returns 类型转换后的 vite 环境变量。
 */
function wrapperEnv(envConf: Record<string, string>): Env {
  // 默认值
  const ret: Env = {
    VITE_APP_TITLE: 'Untitled',
    VITE_PORT: 2333,
    VITE_LOG_LEVEL: 'INFO',
    VITE_PUBLIC_PATH: '',
  };

  for (const envName of Object.keys(envConf)) {
    let realName: string | number | boolean = envConf[envName].replace(/\\n/g, '\n');

    // 类型转换
    switch (true) {
      case realName === 'true':
        realName = true;
        break;
      case realName === 'false':
        realName = false;
        break;
      case envName === 'VITE_PORT':
        realName = Number(realName);
        break;
    }
    ret[envName] = realName;
  }
  return ret;
}

/** 设置别名 */
const alias: Record<string, string> = {
  '@': pathResolve('src'),
};

/**
 * 按 VITE_*_URL 生成 H5 开发代理。
 * 浏览器请求服务路径，由 dev server 转发到对应内网地址。
 */
function buildServiceProxy(env: Record<string, string>): Record<string, ProxyOptions> {
  const proxy: Record<string, ProxyOptions> = {};

  Object.entries(env).forEach(([key, value]) => {
    if (!/^VITE_[A-Z0-9_]+_URL$/.test(key) || !/^https?:\/\//.test(value)) {
      return;
    }
    try {
      const url = new URL(value);
      const pathname = url.pathname.replace(/\/$/, '');
      if (!pathname || pathname === '/') {
        return;
      }
      proxy[pathname] = {
        target: url.origin,
        changeOrigin: true,
      };
    } catch {
      // 忽略无法解析的地址
    }
  });

  return proxy;
}

const viteConfig = defineConfig((config: ConfigEnv): UserConfig => {
  const { mode } = config;
  const env = loadEnv(mode, root);
  const { VITE_PUBLIC_PATH, VITE_PORT } = wrapperEnv(env);

  return {
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias,
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: '0.0.0.0',
      // 本地跨域代理
      proxy: buildServiceProxy(env),
    },
    plugins: [uni()],
    build: {
      sourcemap: false,
      // 消除打包大小超过 500kb 警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve('index.html'),
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/styles/uni.scss' as *;`,
        },
      },
    },
  };
});

export default viteConfig;
