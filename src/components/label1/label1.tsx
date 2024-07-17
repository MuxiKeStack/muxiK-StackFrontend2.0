import { Text, View } from '@tarojs/components';

import './label1.scss';

export default function Label1(props) {

  const handleClick = () => props.onClick(props.content);

  return (
    <View className="label1"  onClick={handleClick}>
      <Text className="labeltext">{props.content}</Text>
    </View>
  );
}
