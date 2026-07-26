import Taro from '@tarojs/taro';

import { hasStoredSession, isColdStartOnLoginPage } from '@/common/auth/session';

const LOGIN_URL = '/pages/login/index';
const MAIN_TAB_URL = '/pages/main/index';

const checkToken = () => {
  const accountInfo = Taro.getAccountInfoSync();

  void Taro.setStorage({
    key: 'accountInfo',
    data: accountInfo,
  });

  if (!hasStoredSession()) {
    void Taro.redirectTo({ url: LOGIN_URL });
    return;
  }

  if (isColdStartOnLoginPage()) {
    void Taro.switchTab({ url: MAIN_TAB_URL });
  }
};

export default checkToken;
