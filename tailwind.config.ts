import type { Config } from 'tailwindcss';

const config = {
  // 不在 content 包括的文件内编写的 class，不会生成对应的工具类
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // 不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false,
  },
} satisfies Config;

export default config;
