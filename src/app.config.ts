// import { useGlobalIconFont } from './common/components/iconfont/helper';

export default defineAppConfig({
  pages: [
    'pages/questionInfo/index',
    'pages/login/index',
    'pages/main/index',
    'pages/classInfo/index',
    'pages/evaluateInfo/index',
    'pages/profile/index',
    'pages/myCollection/index',
    'pages/notification/index',
    'pages/feedback/index',
    'pages/evaluate/evaluate',
    'pages/myclass/myclass',
    'pages/research/research',
    'pages/index/index',
    'pages/editUser/index',
    'pages/publishQuestion/index',
  ],
  subpackages: [
    {
      root: 'subpackages/profile',
      pages: ['pages/history/index'],
    },
  ],
  /* eslint-disable */
  // usingComponents: Object.assign(useGlobalIconFont()),
  tabBar: {
    custom: true,
    list: [
      {
        pagePath: 'pages/main/index',
        text: 'Home',
      },
      { pagePath: 'pages/notification/index', text: 'Massage' },
      { pagePath: 'pages/profile/index', text: 'Profile' },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  lazyCodeLoading: 'requiredComponents',
});
