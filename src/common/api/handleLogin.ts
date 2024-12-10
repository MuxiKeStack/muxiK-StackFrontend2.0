import Taro from '@tarojs/taro';

const preUrl = 'https://kstack.muxixyz.com';

type LoginResponseHeaders = {
  'X-Jwt-Token'?: string;
  'X-Refresh-Token'?: string;
};

const handleLogin = async (data: Record<string, unknown> = {}) => {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  try {
    void Taro.showLoading({
      title: '登录中...',
      mask: true,
    });
    const response = await Taro.request({
      method: 'POST',
      url: `${preUrl}/users/login_ccnu`,
      header,
      data: JSON.stringify(data),
    });
    Taro.hideLoading();
    const headers: LoginResponseHeaders = response.header || {};
    const shortToken = headers['X-Jwt-Token'];
    const longToken = headers['X-Refresh-Token'];

    if (shortToken && longToken) {
      void Taro.setStorage({
        key: 'shortToken',
        data: shortToken.toString(),
      });

      void Taro.setStorage({
        key: 'longToken',
        data: longToken.toString(),
      });

      void Taro.switchTab({
        url: '/pages/main/index',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (response.data.code !== 0) {
      // 登陆失败(code 不为 0)
      void Taro.showToast({
        icon: 'error',
        title: '登录失败，请重试',
      });
    }

    if (!response.statusCode.toString().startsWith('2')) {
      throw new Error(`请求失败，状态码：${response.statusCode}`);
    }
  } catch (error) {
    void Taro.showToast({
      icon: 'error',
      title: (error as Error).message || '登录过程中发生错误',
    });
  }
};

export default handleLogin;
