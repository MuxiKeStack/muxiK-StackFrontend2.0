/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Text, View } from '@tarojs/components';
import { useCallback } from 'react';

import './index.scss';

export default function SearchLabel(props) {
  const handleClick = useCallback(
    (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      props.onClick(props.content);
    },
    [props]
  );

  return (
    <View className="searchLabel" onClick={handleClick}>
      <Text className="labeltext">{props.content}</Text>
    </View>
  );
}
