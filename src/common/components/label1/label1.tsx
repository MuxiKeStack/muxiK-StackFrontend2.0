/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Text, View } from '@tarojs/components';
import { useCallback } from 'react';

import './label1.scss';

export default function Label1(props) {
  const handleClick = useCallback(
    (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      props.onClick(props.content);
    },
    [props]
  );

  return (
    <View className="label1" onTouchEnd={handleClick}>
      <Text className="labeltext">{props.content}</Text>
    </View>
  );
}
