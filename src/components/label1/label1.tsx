import { Text, View } from "@tarojs/components";
import "./label1.scss";

export default function Label1(props) {
  return (
    <View className="label1">
      <Text className="labeltext">{props.content}</Text>
    </View>
  );
}
