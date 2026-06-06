import { useGlobalIconFont } from './common/components/iconfont/helper';

export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/main/index',
    'pages/classInfo/index',
    'pages/profile/index',
    'pages/myclass/index',
    'pages/notification/main/index',
    'pages/notification/list/index',
    'pages/research/index',
    'pages/guide/index',
  ],

  subpackages: [
    {
      root: 'subpackages/profile',
      pages: [
        'pages/myCollection/index',
        'pages/evaluationHistory/index',
        'pages/editUser/index',
      ],
    },
    {
      root: 'subpackages/feedback',
      pages: [
        'pages/main/index',
        'pages/writefeedback/index',
        'pages/history/index',
        'pages/detail/index',
      ],
    },
    {
      root: 'subpackages/course',
      pages: [
        'pages/evaluate/index',
        'pages/evaluateInfo/index',
        'pages/questionInfo/index',
        'pages/publishQuestion/index',
      ],
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
      { pagePath: 'pages/notification/main/index', text: 'Massage' },
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
