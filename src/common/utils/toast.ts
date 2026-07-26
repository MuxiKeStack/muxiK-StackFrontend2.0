import Taro from '@tarojs/taro';

/** 先关闭 Loading 再弹 Toast，避免微信小程序里 hideLoading 吞掉 Toast */
export function hideLoadingThenToast(options: Taro.showToast.Option): void {
  void Taro.hideLoading();
  void Taro.showToast(options);
}
