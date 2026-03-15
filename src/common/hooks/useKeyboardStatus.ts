import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

interface keyboardStatus {
  isKeyboardShow: boolean;
  keyboardHeight: number;
}

const useKeyboardStatus = () => {
  const [keyboardInfo, setKeyboardInfo] = useState<keyboardStatus>({
    keyboardHeight: 0,
    isKeyboardShow: false,
  });

  useEffect(() => {
    const cancelKeyboardListener = Taro.onKeyboardHeightChange((res) => {
      setKeyboardInfo({
        keyboardHeight: res.height,
        isKeyboardShow: res.height > 0,
      });
    });

    return () => {
      Taro.offKeyboardHeightChange(void cancelKeyboardListener);
    };
  }, []);

  return keyboardInfo;
};

export default useKeyboardStatus;
