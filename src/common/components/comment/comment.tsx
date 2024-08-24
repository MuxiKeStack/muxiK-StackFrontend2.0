/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable simple-import-sort/imports */
/* eslint-disable @typescript-eslint/no-floating-promises */
// import React, { useEffect } from "react";
import { Image, Navigator, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useTransition } from 'react';

import { useCourseStore } from '@/pages/main/store/store';

import './comment.scss';

import { CommentInfo } from '../../assets/types';
import ShowStar from '../showStar/showStar';

export default function Comment(props: CommentInfo & { type?: string }) {
  const { course_id, ctime, publisher_id } = props;
  // 创建一个新的Date对象，传入时间戳
  const ctimeDate = new Date(ctime || 0);
  const courseDetail = useCourseStore((state) => state.courseDetail);
  const publisher = useCourseStore((state) => state.publishers);
  const [isPublisherInfoPending, startPublisherTransition] = useTransition();
  const [isCoursePending, startCourseTransition] = useTransition();
  const handleClick = () => {
    const serializedComment = encodeURIComponent(JSON.stringify(props));
    Taro.navigateTo({
      url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
    });
  };
  useEffect(() => {
    startCourseTransition(() => {
      useCourseStore.getState().getCourseDetail(course_id || 0);
    });
    startPublisherTransition(() => {
      useCourseStore.getState().getPublishers(publisher_id || 0);
    });
  }, [course_id, publisher_id]);

  return (
    <View className="bigcomment" onClick={handleClick}>
      <View className="commentplus">
        {!courseDetail[course_id || 0] ? (
          <>
            <View className="classTitle">pending</View>
          </>
        ) : (
          <>
            <View className="classTitle">
              {courseDetail[course_id || 0]?.name +
                ' (' +
                courseDetail[course_id || 0]?.teacher +
                ') '}
            </View>
          </>
        )}
        <View className="comment">
          {!publisher[publisher_id || 0] ? (
            <>
              <View>pending</View>
            </>
          ) : (
            <>
              <View
                className="tx"
                style={`background-image: url(${publisher[publisher_id || 0]?.avatar});`}
              ></View>
              <View className="userName">{publisher[publisher_id || 0]?.nickname}</View>
              <View className="time">{ctimeDate.toLocaleString()}</View>
              <View className="stars">
                <ShowStar score={props?.star_rating}></ShowStar>
              </View>
              <Image
                // style={`display:${props.isHot ? 'block' : 'none'}`}
                className="fire"
                src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
              ></Image>
            </>
          )}
          <View className="content">{props.content}</View>
          <View
            className="likes"
            style={`display:${props.type == 'inner' ? 'block' : 'none'}`}
          >
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
      <View
        className="likes"
        style={`display:${props.type == 'inner' ? 'none' : 'block'}`}
      >
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
        <Text className="text1">{props.total_oppose_count}</Text>
      </View>
    </View>
  );
}
