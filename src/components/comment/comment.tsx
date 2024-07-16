import React, { useEffect } from "react";
import { Text, View, Image, Navigator } from "@tarojs/components";
import "./comment.scss";
import ShowStar from "../showStar/showStar";

export default function comment(props) {
  
  // let className = "课程名";
  // let teacherName = "老师名";
  
  // 创建一个新的Date对象，传入时间戳
  const ctimeDate = new Date(props.ctime);
  const utimeDate = new Date(props.utime);


  return (
    <View className="bigcomment">
      <View className="commentplus">
      <View className="classTitle">
        {props.class_name  + " (" + props.teacher +") " }
      </View>
      <View className="comment">
        <View className="tx" style={`background-image: url(${props.avatar});`}></View>
          <View className="userName">{props.nickname}</View>
          <View className="time">
            {ctimeDate.toLocaleString()}
          </View>
          <View className="stars">
            <ShowStar score={props.star_rating}></ShowStar>
          </View>
          <Image
            style={`display:${props.isHot ? 'block' : 'none'}`}
            className="fire"
            src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
          ></Image>
        <View className="content">{props.content}</View>
        <View className="likes"  style={`display:${props.type=='inner' ? "block":  "none"}`}>
        <View className="icon">
          <Navigator className="iconfont">&#xe786;</Navigator>
        </View>
        <Text className="text1">{props.total_support_count}</Text>
        <View className="icon">
          <Navigator className="iconfont">&#xe769;</Navigator>
        </View>
        <Text className="text1">{props.total_comment_count}</Text>
      </View>
      </View>
      </View>
      <View className="likes"  style={`display:${props.type=='inner' ?  "none": "block"}`}>
        <View className="icon">
          <Navigator className="iconfont">&#xe786;</Navigator>
        </View>
        <Text className="text1">{props.total_support_count}</Text>
        <View className="icon">
          <Navigator className="iconfont">&#xe769;</Navigator>
        </View>
        <Text className="text1">{props.total_comment_count}</Text>
        <View className="icon">
          <Navigator className="iconfont">&#xe785;</Navigator>
        </View>
        <Text className="text1">{props.dislike}</Text>
      </View>
    </View>
  );
}
