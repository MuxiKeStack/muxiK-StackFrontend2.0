/* eslint-disable */

import Taro from '@tarojs/taro';
import { Component, PropsWithChildren } from 'react';

import '@/common/styles/globals.scss';

import { checkToken } from '@/common/utils';

const interceptor: Taro.interceptor = function (chain: Taro.Chain) {
  const requestParams = chain.requestParams;

  return chain.proceed(requestParams).then((res) => {
    console.log(Taro.getStorageSync('shortToken'));

    if (res.statusCode === 401 && Taro.getStorageSync('visitor') !== true) {
      console.log(res, Taro.getStorageSync('visitor'));

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
  //TODO 写成加interceptor 但是我还没写明白 别急
  componentDidMount() {
    checkToken();
  }
  render() {
    return this.props.children;
  }
}

export default App;
