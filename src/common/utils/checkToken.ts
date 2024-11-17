import Taro from '@tarojs/taro';

const checkToken = () => {
  const token: string = Taro.getStorageSync('shortToken');
  const accountInfo = Taro.getAccountInfoSync();
  void Taro.setStorage({
    key: 'accountInfo',
    data: accountInfo,
  });
  if (token) {
    void Taro.switchTab({ url: '/pages/main/index' });
  } else {
    void Taro.redirectTo({ url: '/pages/login/index' });
  }
};

export default checkToken;
