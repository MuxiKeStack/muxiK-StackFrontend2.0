import Taro from '@tarojs/taro';

export const Nav = (navPath: string) => {
  return Taro.navigateTo({ url: navPath });
};
export const Back = () => {
  return Taro.navigateBack();
};
export const Redirect = (redirectPath: string) => {
  return Taro.reLaunch({ url: redirectPath });
};
