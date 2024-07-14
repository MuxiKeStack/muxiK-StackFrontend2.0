import { Image, Navigator, Text, View } from '@tarojs/components';

import './comment.scss';

import ShowStar from '../showStar/showStar';

export default function comment(props) {
  return (
    <View className="bigcomment">
      <View className="comment">
        <View className="tx"></View>
        <View className="p">
          <View className="userName">{props.username}</View>
          <View className="time">
            {props.date} {props.time}
          </View>
        </View>
        <View className="p">
          <View className="stars">
            <ShowStar score={props.score}></ShowStar>
          </View>
          <Image
            style={`display:${props.isHot ? 'block' : 'none'}`}
            className="fire"
            src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
          ></Image>
        </View>
        <View className="content">{props.content}</View>
      </View>
      <View className="likes">
        <View className="icon">
          <Navigator className="iconfont">&#xe786;</Navigator>
        </View>
        <Text className="text1">{props.like}</Text>
        <View className="icon">
          <Navigator className="iconfont">&#xe769;</Navigator>
        </View>
        <Text className="text1">{props.comment}</Text>
        <View className="icon">
          <Navigator className="iconfont">&#xe785;</Navigator>
        </View>
        <Text className="text1">{props.dislike}</Text>
      </View>
    </View>
  );
}
