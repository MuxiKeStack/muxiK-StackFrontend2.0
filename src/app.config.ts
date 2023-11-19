export default defineAppConfig({
  pages: [
    'pages/classInfo/index',
    'pages/evaluate/evaluate',
    'pages/myclass/myclass',
    'pages/research/research',
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  usingComponents:{
    'ec-canvas':'components/ec-canvas/ec-canvas'
  }
})
