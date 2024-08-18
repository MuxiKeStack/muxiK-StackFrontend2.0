// // import { useGlobalIconFont } from './common/components/iconfont/helper';

// export default defineAppConfig({
//   pages: [
//   ],
//   window: {
//     backgroundTextStyle: 'light',
//     navigationBarBackgroundColor: '#fff',
//     navigationBarTitleText: 'WeChat',
//     navigationBarTextStyle: 'black',
//   },
//   subpackages: [
//     //分包
//     {
//       root: 'subpackages/123',
//       pages: [
//         'pages/114514/index',
//       ],
//     },
//     {
//       root: 'subpackages/456',
//       pages: [
//         'pages/1919810/index',
//       ],
//     },
//   ],
//   tabBar: {
//     /* tab页面必须放在主包里 */
//     custom: true,
//     list: [
//       {
//         pagePath: 'pages/123/index',
//         text: '123',
//       },
//       { pagePath: 'pages/456/index', text: '456' },
//     ],
//   },
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   usingComponents: Object.assign({
//     iconfont: `common/components/iconfont/weapp/weapp`,
//   }),
//   lazyCodeLoading: 'requiredComponents',
// });

export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/main/index',
    'pages/classInfo/index',
    'pages/evaluateInfo/index',
    'pages/personalPage/index',
    'pages/myCollection/index',
    'pages/evaluateCourseHistory/index',
    'pages/messageNotification/index',
    'pages/officialNotification/index',
    'pages/feedback/index',
    'pages/evaluate/evaluate',
    'pages/myclass/myclass',
    'pages/research/research',
    'pages/index/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
});
