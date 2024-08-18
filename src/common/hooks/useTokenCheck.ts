import Taro from '@tarojs/taro';

const useTokenCheck = () => {
  const checkToken = () => {
    const token = void Taro.getStorageSync('token');
    if (!token) {
      void Taro.login({
        success: (res) => {
          if (res.code) {
            void Taro.request({
              // 改一下
              url: '/api/v1/login',
              data: {
                code: res.code,
              },
              header: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
            }).then((response) => {
              if (response.statusCode === 200) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                Taro.setStorageSync('token', response.data.data);

                // eslint-disable-next-line no-console
                console.log('登录成功！');
              }
            });
          } else {
            // eslint-disable-next-line no-console
            console.error('登录失败！' + res.errMsg);
          }
        },
        fail: () => {
          // eslint-disable-next-line no-console
          console.error('登录操作被用户拒绝');
        },
      });
    }
  };

  return checkToken;
};

export default useTokenCheck;
