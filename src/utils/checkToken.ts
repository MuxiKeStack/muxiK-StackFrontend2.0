import Taro from '@tarojs/taro';

function checkToken() {
  const token: string = Taro.getStorageSync('shortToken');
  if (token) {
    console.log('Token 有');
    void Taro.redirectTo({ url: '/pages/main/index' });
  } else {
    console.log('无token先登陆');
    void Taro.redirectTo({ url: '/pages/login/index' });
  }
}
export default checkToken;
