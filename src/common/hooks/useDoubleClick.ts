import { ITouchEvent } from '@tarojs/components';
import { useState } from 'react';

export function useDoubleClick(): (
  callback: (e: ITouchEvent) => void
) => (e: ITouchEvent) => void {
  const [lastClickTime, setClickTime] = useState<number>(0);

  return (callback: (e: ITouchEvent) => void) => (e: ITouchEvent) => {
    const currentTime = e.timeStamp;
    const gap = currentTime - lastClickTime;
    if (gap > 0 && gap < 300) {
      callback && callback(e);
    }
    setClickTime(currentTime);
  };
}
