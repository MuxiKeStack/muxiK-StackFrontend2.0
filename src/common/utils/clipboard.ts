import Taro from '@tarojs/taro';

interface CopyOptions {
  // 复制成功后的轻提示文案，默认「复制成功」
  successText?: string;
  // 复制失败后的轻提示文案，不传则失败时不提示
  failText?: string;
}

// 统一的复制到剪贴板逻辑，避免各页面重复书写 setClipboardData + showToast
export function copyToClipboard(data: string, options?: CopyOptions): void {
  const { successText = '复制成功', failText } = options || {};
  void Taro.setClipboardData({
    data,
    success: () => {
      void Taro.showToast({ title: successText, icon: 'success', duration: 1500 });
    },
    fail: () => {
      if (failText) {
        void Taro.showToast({ title: failText, icon: 'none', duration: 1500 });
      }
    },
  });
}
