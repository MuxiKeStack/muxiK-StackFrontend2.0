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

type CommentProps = CommentInfo & {
  type?: string;
  isHot?: boolean;
  showAll?: boolean;
  onClick?: (comment: CommentInfo) => void;
};
export default function Comment({ onClick, ...props }: CommentProps) {
  const { course_id, publisher_id, showAll } = props;
  const [, startPublisherTransition] = useTransition();
  const [, startCourseTransition] = useTransition();
  const handleClick = () => {
    onClick && onClick(props);
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
        <CommentHeader {...props}></CommentHeader>
        <View className={`content ${!showAll ? 'text-overflow' : 'text-showAll'}`}>
          {props.content}
          {/* {!showAll && <Text>...</Text>} */}
        </View>

        {props.type === 'inner' && (
          <View className="likes">
            <View className="icon">
              <Navigator className="iconfont">&#xe786;</Navigator>
            </View>
            <Text className="text1">{props.total_support_count}</Text>
            <View className="icon">
              <Navigator className="iconfont">&#xe769;</Navigator>
            </View>
            <Text className="text1">{props.total_comment_count}</Text>
          </View>
        )}
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

const CommentHeader = ({
  course_id,
  publisher_id,
  ctime,
  isHot,
  star_rating,
}: CommentProps) => {
  const courseDetail = useCourseStore((state) => state.courseDetail);
  const publisher = useCourseStore((state) => state.publishers);
  async function navigateToPage() {
    await Taro.navigateTo({
      url: '/pages/classInfo/index', // 确保路径正确
    });
  }

  function handleClickToClass() {
    navigateToPage().then((r) => console.log(r)); // 这里调用异步函数，但不返回 Promise
  }
  return (
    <>
      {!courseDetail[course_id || 0] ? (
        <>
          <View className="classTitle">pending</View>
        </>
      ) : (
        <>
          <View className="classTitle" onClick={handleClickToClass}>
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
            <View className="time">{new Date(ctime as number).toLocaleString()}</View>
            <View className="stars">
              <ShowStar score={star_rating}></ShowStar>
            </View>
            <Image
              style={`display:${isHot ? 'block' : 'none'}`}
              className="fire"
              src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
            ></Image>
          </>
        )}
      </View>
    </>
  );
};
