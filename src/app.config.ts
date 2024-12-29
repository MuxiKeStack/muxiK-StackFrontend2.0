import { useGlobalIconFont } from './common/components/iconfont/helper';

export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/main/index',
    'pages/publishQuestion/index',
    'pages/classInfo/index',
    'pages/evaluateInfo/index',
    'pages/profile/index',
    'pages/myCollection/index',
    'pages/notification/index',
    'pages/feedback/index',
    'pages/evaluate/index',
    'pages/questionInfo/index',
    'pages/myclass/index',
    'pages/research/index',
    'pages/index/index',
    'pages/editUser/index',
    'pages/guide/index',
    'pages/shareGrades/index',
    'pages/questionList/index',
  ],
  subpackages: [
    {
      root: 'subpackages/profile',
      pages: ['pages/history/index'],
    },
  ],
  usingComponents: Object.assign(useGlobalIconFont()),
  tabBar: {
    custom: true,
    list: [
      {
        pagePath: 'pages/main/index',
        text: 'Home',
      },
      {
        pagePath: 'pages/guide/index',
        text: 'Guide',
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
