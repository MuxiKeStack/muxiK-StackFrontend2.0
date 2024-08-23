// 假如你使用的框架/工具不支持 postcss.config.js，则可以使用内联的写法
// 其中 `autoprefixer` 有可能已经内置了，假如框架内置了可以去除
export const plugins = {
  tailwindcss: {},
  autoprefixer: {},
  cssnano: {},
  'postcss-rem-to-responsive-pixel': {
    // 32 意味着 1rem = 32rpx
    rootValue: 32,
    // 默认所有属性都转化
    propList: ['*'],
    // 转化的单位,可以变成 px / rpx
    transformUnit: 'rpx',
  },
};
