import Taro from '@tarojs/taro';

import {
  hasStoredSession,
  isColdStartOnLoginPage,
  readResponseHeader,
} from '@/common/auth/session';
import { LONG_TOKEN, SHORT_TOKEN } from '@/common/constants/auth';
import { BASE_URL } from '@/common/request/constants';

const LOGIN_URL = '/pages/login/index';
const MAIN_TAB_URL = '/pages/main/index';

async function verifyTokenOnStartup(): Promise<boolean> {
  const longToken = Taro.getStorageSync<string>(LONG_TOKEN);
  if (!longToken || !longToken.trim()) {
    return false;
  }

  try {
    const response = await Taro.request({
      method: 'GET',
      url: `${BASE_URL}/users/refresh_token`,
      header: { Authorization: `Bearer ${longToken}` },
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      const headers = response.header as Record<string, unknown>;
      const newShortToken = readResponseHeader(headers, 'x-jwt-token');
      const newLongToken = readResponseHeader(headers, 'x-refresh-token');

      if (newShortToken && newShortToken.trim()) {
        Taro.setStorageSync(SHORT_TOKEN, newShortToken);
      }
      if (newLongToken && newLongToken.trim()) {
        Taro.setStorageSync(LONG_TOKEN, newLongToken);
      }
      return true;
    }

    if (response.statusCode === 401) {
      Taro.removeStorageSync(SHORT_TOKEN);
      Taro.removeStorageSync(LONG_TOKEN);
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

const checkToken = async () => {
  const accountInfo = Taro.getAccountInfoSync();

  void Taro.setStorage({
    key: 'accountInfo',
    data: accountInfo,
  });

  if (!hasStoredSession()) {
    void Taro.redirectTo({ url: LOGIN_URL });
    return;
  }

  const isValid = await verifyTokenOnStartup();
  if (!isValid) {
    void Taro.redirectTo({ url: LOGIN_URL });
    return;
  }

  if (isColdStartOnLoginPage()) {
    void Taro.switchTab({ url: MAIN_TAB_URL });
  }
};

export default checkToken;
