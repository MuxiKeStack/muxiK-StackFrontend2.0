import Taro from '@tarojs/taro';

import { SHORT_TOKEN, VISITOR } from '@/common/constants/auth';

const checkToken = () => {
  const token: string = Taro.getStorageSync(SHORT_TOKEN);
  const isVisitor = Taro.getStorageSync(VISITOR);
  const accountInfo = Taro.getAccountInfoSync();
  void Taro.setStorage({
    key: 'accountInfo',
    data: accountInfo,
  });
  // 有 token 或游客模式时不改路由，保留分享/扫码进入的子页面
  if (!token?.trim() && !isVisitor) {
    void Taro.redirectTo({ url: '/pages/login/index' });
  }
};

export default checkToken;
