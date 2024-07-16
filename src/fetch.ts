import Taro from '@tarojs/taro';

const preUrl = 'https://kstack.muxixyz.com/api/v1';

export async function post(url = '', data = {}, isToken = true) {
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
