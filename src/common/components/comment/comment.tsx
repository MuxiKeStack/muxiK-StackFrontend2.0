/* eslint-disable simple-import-sort/imports */
/* eslint-disable import/first */
import { Image, Navigator, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useEffect, useTransition } from 'react';

import './comment.scss';

import { useCourseStore } from '@/pages/main/store/store';

import { CommentInfo } from '../../assets/types';
import IconFont from '../iconfont';
import ShowStar from '../showStar/showStar';

interface CommentProps extends CommentInfo {
  type?: string;
  isHot?: boolean;
  showAll?: boolean;
  onClick?: (comment: CommentInfo) => void;
}

const CommentHeader: React.FC<CommentProps> = memo(
  ({ course_id, publisher_id, ctime, isHot, star_rating }) => {
    const courseDetail = useCourseStore((state) => state.courseDetail);
    const publisher = useCourseStore((state) => state.publishers);

    const navigateToPage = async () => {
      await Taro.navigateTo({
        url: `/pages/classInfo/index?course_id=${course_id}`, // 传递 course_id 参数
      });
    };

    const handleClickToClass = () => {
      void navigateToPage().then((r) => console.log(r)); // 这里调用异步函数，但不返回 Promise
    };

    return (
      <>
        {!courseDetail[course_id || 0] ? (
          <>
            <View className="classTitle">pending</View>
          </>
        ) : (
          <>
            <View className="classTitle" onClick={handleClickToClass}>
              {`${courseDetail[course_id || 0]?.name} (${courseDetail[course_id || 0]?.teacher}) `}
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
  }
);

const Comment: React.FC<CommentProps> = memo(({ onClick, ...props }) => {
  const {
    course_id,
    publisher_id,
    showAll,
    type,
    content,
    total_support_count,
    total_comment_count,
    total_oppose_count,
  } = props;
  const [, startPublisherTransition] = useTransition();
  const [, startCourseTransition] = useTransition();

  const handleClick = () => {
    onClick && onClick(props);
  };

  useEffect(() => {
    startCourseTransition(() => {
      void useCourseStore.getState().getCourseDetail(course_id || 0);
    });
    startPublisherTransition(() => {
      void useCourseStore.getState().getPublishers(publisher_id || 0);
    });
  }, [course_id, publisher_id]);

  return (
    <View className="bigcomment" onClick={handleClick}>
      <View className="commentplus">
        <CommentHeader {...props}></CommentHeader>
        <View className={`content ${!showAll ? 'text-overflow' : 'text-showAll'}`}>
          {content}
          {/* {!showAll && <Text>...</Text>} */}
        </View>

        {type === 'inner' && (
          <View className="likes">
            <View className="icon">
              <IconFont name="like" />
              {/* <Navigator className="iconfont">&#xe786;</Navigator> */}
            </View>
            <Text className="text1">{total_support_count}</Text>
            <View className="icon">
              <IconFont name="comment" />
              {/* <Navigator className="iconfont">&#xe769;</Navigator> */}
            </View>
            <Text className="text1">{total_comment_count}</Text>
          </View>
        )}
      </View>
      {type !== 'inner' && (
        <View className="likes">
          <View className="icon">
            <Navigator className="iconfont">&#xe786;</Navigator>
          </View>
          <Text className="text1">{total_support_count}</Text>
          <View className="icon">
            <Navigator className="iconfont">&#xe769;</Navigator>
          </View>
          <Text className="text1">{total_comment_count}</Text>
          <View className="icon">
            <Navigator className="iconfont">&#xe785;</Navigator>
          </View>
          <Text className="text1">{total_oppose_count}</Text>
        </View>
      )}
    </View>
  );
});

export default Comment;
