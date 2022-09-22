import { defineConfig } from 'umi';

const cdnBasePath = 'https://storage-node.ipin.com/mece-new-h5/';

// const base = process.env.BASE ? `/${process.env.BASE}/` : '/m/'
// const cdnPath = isOnline ? cdnBasePath : process.env.NODE_ENV === 'production' ? base : ''
export default defineConfig({
  jsMinifier: 'terser',
  cssMinifier: 'cssnano',
  base: '/daodao',
  npmClient: 'yarn',
  alias: {
    '@': '../src',
  },
  cssLoaderModules: {
    // 配置驼峰式使用
    exportLocalsConvention: 'camelCase',
  },
  clientLoader: {},
  deadCode: {},
  hash: true,
  scripts: [],
  mfsu: false,
  styles: [],
  targets: {
    chrome: 50,
  },
  define: {
    runtimeConfigMap: {
      eventApi:
        process.env.NODE_ENV !== 'production'
          ? 'https://pre-r.wmzy.com'
          : 'https://r.wmzy.com',
      staticPrefix: '/daodao',
      channel_key: 'ios',
      RequestTimeout: 3000,
      PrefixApi: '/gw',
      DevDomain: 'pre-m.daodao.pro',
      Env: 'dev',
    },
  },
});
