import Taro from '@tarojs/taro';

const preUrl = 'https://kstack.muxixyz.com';

export async function post(url = '', data = {}, isToken = true) {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  const getToken = () => {
    return new Promise((resolve, reject) => {
      Taro.getStorage({
        key: 'token',
        success: (res) => {
          const token = res.data;
          if (token) {
            resolve(token); // 如果token存在，解析Promise
          } else {
            reject(new Error('No token found')); // 如果没有token，拒绝Promise
            Taro.navigateTo({ url: '/pages/login/index' }); // 导航到登录页面
          }
        },
        fail: (err) => {
          reject(new Error(`Failed to get token: ${err}`)); // 存储操作失败时拒绝Promise
        },
      });
    });
  };

  if (isToken) header['Authorization'] = `Bearer ${await getToken()}`;

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method: 'POST',
      header,
      data: JSON.stringify(data),
    });

    if (!response.statusCode.toString().startsWith('2')) {
      if (response.statusCode === 401) {
        throw new Error('401');
      } else if (response.statusCode === 400) {
        const errorData = response.data as { code: number; msg: string };
        throw new Error(`${errorData.code}`);
      }
    }

    return response.data;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

export async function get(url = '', isToken = true) {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  const getToken = () => {
    return new Promise((resolve, reject) => {
      Taro.getStorage({
        key: 'token',
        success: (res) => {
          const token = res.data;
          if (token) {
            resolve(token); // 如果token存在，解析Promise
          } else {
            reject(new Error('No token found')); // 如果没有token，拒绝Promise
            Taro.navigateTo({ url: '/pages/login/index' }); // 导航到登录页面
          }
        },
        fail: (err) => {
          reject(new Error(`Failed to get token: ${err}`)); // 存储操作失败时拒绝Promise
        },
      });
    });
  };

  if (isToken) header['Authorization'] = `Bearer ${await getToken()}`;

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method: 'GET',
      header,
      // redirect: 'follow',
    });

    if (!response.statusCode.toString().startsWith('2')) {
      if (response.statusCode === 401) {
        throw new Error('401');
      } else if (response.statusCode === 400) {
        const errorData = response.data as { code: number; msg: string };
        throw new Error(`${errorData.code}`);
      }
    }

    return response.data;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

export async function put(url = '', data = {}, isToken = true) {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  if (isToken) {
    Taro.getStorage({
      key: 'token',
      success: (res) => {
        const token = res.data;
        if (token) header['Authorization'] = token;
        else {
          Taro.navigateTo({ url: '/pages/login/index' });
        }
      },
    });
  }

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method: 'PUT',
      header,
      data: JSON.stringify(data),
    });

    if (!response.statusCode.toString().startsWith('2')) {
      if (response.statusCode === 401) {
        throw new Error('401');
      } else if (response.statusCode === 400) {
        const errorData = response.data as { code: number; msg: string };
        throw new Error(`${errorData.code}`);
      }
    }

    return response.data;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

export async function postPwd(url = '', data = {}, token: string) {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  if (token) header['Authorization'] = token;
  else {
    Taro.navigateTo({ url: '/pages/login/index' });
  }

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method: 'POST',
      header,
      data: JSON.stringify(data),
    });

    if (!response.statusCode.toString().startsWith('2')) {
      throw new Error(`${response.statusCode}`);
    }

    return response.data;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

export async function postLogin(url = '', data = {}, isToken = true) {
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  if (isToken) {
    Taro.getStorage({
      key: 'token',
      success: (res) => {
        const token = res.data;
        if (token) header['Authorization'] = token;
        else {
          Taro.navigateTo({ url: '/pages/login/index' });
        }
      },
    });
  }

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method: 'POST',
      header,
      data: JSON.stringify(data),
    });

    if (!response.statusCode.toString().startsWith('2')) {
      if (response.statusCode === 401) {
        throw new Error('401');
      } else if (response.statusCode === 400) {
        const errorData = response.data as { code: number; msg: string };
        throw new Error(`${errorData.code}`);
      }
    }

    return response.header; //返回相应体头部
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}
const handleLogin = async (data = {}) => {
  //const systemInfo = Taro.getSystemInfoSync();
  //后期看情况决定是不是加User-Agent
  const header = {
    'Content-Type': 'application/json;charset=utf-8',
    //"User-Agent":systemInfo.model
  };

  Taro.setStorage({
    key: 'shortToken',
    data: 'shortToken',
  });

  Taro.setStorage({
    key: 'longToken',
    data: 'longToken',
  });

  try {
    const response = await Taro.request({
      method: 'POST',
      url: `${preUrl}/users/login_ccnu`,
      header,
      data: JSON.stringify(data),
    });

    const headers = response.header || {};
    const shortToken = headers['X-Jwt-Token'];
    const longToken = headers['X-Refresh-Token'];

    if (shortToken && longToken) {
      Taro.setStorage({
        key: 'shortToken',
        data: shortToken.toString(),
        success: () => {
          console.log('shortToken 设置成功');
          // 方便看情况 log 出 shortToken 后期上线之前删除掉这个
          console.log(shortToken);
        },
      });

      Taro.setStorage({
        key: 'longToken',
        data: longToken.toString(),
        success: () => {
          console.log('longToken 设置成功');
          // 方便看情况 log 出 longToken 后期上线之前删除掉这个
          console.log(longToken);
        },
      });
      Taro.navigateTo({
        url: '/pages/personalPage/index',
      });
    }

    if (response.data.code !== 0) {
      console.log('登陆失败(code 不为 0)');
    }

    if (!response.statusCode.toString().startsWith('2')) {
      throw new Error(`${response.statusCode}`);
    }
  } catch (error) {
    console.log(error);
  }
};

export default handleLogin;
