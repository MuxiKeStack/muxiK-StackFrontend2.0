/* eslint-disable simple-import-sort/imports */
/* eslint-disable import/first */
import { Image, Navigator, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useEffect, useState } from 'react';

import './style.scss';

import { useCourseStore } from '@/pages/main/store/store';

import IconFont from '@/common/components/iconfont';
import { CourseDetailsType, PublisherDetailsType } from '@/pages/main/store/types';
import ShowStar from '../showStar/showStar';

interface CommentProps extends CommentInfo {
  type?: string;
  isHot?: boolean;
  showAll?: boolean;
  onClick?: (comment: CommentInfo) => void;
}

const CommentHeader: React.FC<CommentProps> =
  memo((props) => {
    const { course_id, publisher_id, ctime, isHot, star_rating } = props;
    const [publisher_info, setPublisherInfo] = useState<PublisherDetailsType>();
    const [course_info, setCourseInfo] = useState<CourseDetailsType>();
    useEffect(() => {
      void useCourseStore
        .getState()
        .getCourseDetail(course_id || 0)
        .then((res) => {
          setCourseInfo(res);
        });
      void useCourseStore
        .getState()
        .getPublishers(publisher_id || 0)
        .then((res) => {
          setPublisherInfo(res);
        });
    }, [props.course_id, props.publisher_id]);
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
        {!course_info ? (
          <>
            <View className="classTitle">pending</View>
          </>
        ) : (
          <>
            <View className="classTitle" onClick={handleClickToClass}>
              {`${course_info?.name} (${course_info?.teacher}) `}
            </View>
          </>
        )}
        <View className="comment">
          {!publisher_info ? (
            <>
              <View>pending</View>
            </>
          ) : (
            <>
              <View
                className="tx"
                style={`background-image: url(${publisher_info?.avatar});`}
              ></View>
              <View className="userName">{publisher_info?.nickname}</View>
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
  })
;

const Comment: React.FC<CommentProps> = memo((props) => {
  const { showAll, type, content, id, onClick } = props;
  const getComment = useCourseStore((state) => state.getComment);
  const father_record = getComment(id ?? 0);
  const handleClick = useCallback(() => {
    onClick && onClick(props);
  }, [onClick]);

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
            <Text className="text1">
              {father_record?.total_support_count ?? props.total_support_count}
            </Text>
            <View className="icon">
              <IconFont name="comment" />
              {/* <Navigator className="iconfont">&#xe769;</Navigator> */}
            </View>
            <Text className="text1">
              {father_record?.total_comment_count ?? props.total_comment_count}
            </Text>
          </View>
        )}
      </View>
      {type !== 'inner' && (
        <View className="likes">
          <View className="icon">
            <Navigator className="iconfont">&#xe786;</Navigator>
          </View>
          <Text className="text1">
            {father_record?.total_support_count ?? props.total_support_count}
          </Text>
          <View className="icon">
            <Navigator className="iconfont">&#xe769;</Navigator>
          </View>
          <Text className="text1">
            {father_record?.total_comment_count ?? props.total_comment_count}
          </Text>
          <View className="icon">
            <Navigator className="iconfont">&#xe785;</Navigator>
          </View>
          <Text className="text1">
            {father_record?.total_oppose_count ?? props.total_oppose_count}
          </Text>
        </View>
      )}
    </View>
  );
});

export default Comment;
