import Taro from '@tarojs/taro';

function checkToken() {
  const token: string = Taro.getStorageSync('shortToken');
  if (token) {
    // eslint-disable-next-line no-console
    console.log('Token 有');
    void Taro.switchTab({ url: '/pages/main/index' });
  } else {
    // eslint-disable-next-line no-console
    console.log('无token先登陆');
    void Taro.switchTab({ url: '/pages/login/index' });
  }
}
export default checkToken;
