/* eslint-disable */

import Taro from '@tarojs/taro';
import { Component, PropsWithChildren } from 'react';

import '@/common/styles/globals.scss';

import { checkToken } from '@/common/utils';

// const fonts = [
//   {
//     family: 'Inter',
//     source: 'url("https://kstack.muxixyz.com/statics/font/Inter.ttf")',
//   },
//   {
//     family: 'SourceHanSans',
//     source: 'url("https://kstack.muxixyz.com/statics/font/SourceHanSans.ttf")',
//   },
// ];

const interceptor: Taro.interceptor = function (chain: Taro.Chain) {
  const requestParams = chain.requestParams;

  return chain.proceed(requestParams).then((res) => {
    // console.log(Taro.getStorageSync('shortToken'));

    if (res.statusCode === 401 && Taro.getStorageSync('visitor') !== true) {
      // console.log(res, Taro.getStorageSync('visitor'));

      void Taro.reLaunch({ url: '/pages/login/index' }).then(() => {
        Taro.showToast({
          title: '登录过期,请重新登录',
          icon: 'none',
        });
      });
    }
    return res;
  }) as Taro.Chain;
};
Taro.onAppShow(() => {
  Taro.setStorageSync('visitor', false);
});
Taro.addInterceptor(interceptor);

class App extends Component<PropsWithChildren> {
  state = {
    isLoading: true,
  };
  //TODO 写成加interceptor 但是我还没写明白 别急
  async componentDidMount() {
    // await this.loadFonts();
    checkToken();
  }

  // loadFonts = async () => {
  //   try {
  //     await Promise.all(
  //       fonts.map((font) => {
  //         Taro.loadFontFace({
  //           ...font,
  //           global: true,
  //           success: () => {
  //             console.log(`${font.family} 字体加载成功`);
  //           },
  //           fail: (err) => {
  //             console.error(`${font.family} 字体加载失败`, err);
  //             Taro.showToast({
  //               title: '字体加载失败',
  //               icon: 'none',
  //             });
  //           },
  //         });
  //       })
  //     );
  //     this.setState({ isLoading: true });
  //   } catch (error) {
  //     console.error('字体加载失败', error);
  //   }
  // };
  render() {
    return this.props.children;
  }
}

export default App;
