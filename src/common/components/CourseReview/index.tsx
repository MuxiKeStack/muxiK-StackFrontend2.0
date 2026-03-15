/* eslint-disable simple-import-sort/imports */

import IconFont from '@/common/components/iconfont';
import { Image, Navigator, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';

import { useCourseStore } from '@/pages/main/store/store';

import { formatDate } from '@/common/utils';
import { features as featureMap } from '@/pages/evaluate/const';

import {
  COMMENT_ACTIONS,
  CourseDetailsType,
  PublisherDetailsType,
} from '@/pages/main/store/types';
import FeatureLabel from '../FeatureLabel';
import ShowStar from '../showStar/showStar';

interface CourseReviewProps extends CommentInfo {
  type?: string;
  isHot?: boolean;
  showTag?: boolean;
  showAll?: boolean;
  onClick?: (comment: CommentInfo) => void;
  onCommentClick?: (comment: CommentInfo) => void;
  onLikeClick?: (comment: CourseReviewProps) => void;
  classNames?: string;

  isEditable?: boolean;
  initialVisibility?: 'public' | 'private';
  onVisibilityChange?: (id: number, visibility: 'public' | 'private') => void;
}

interface ReviewFooterProps extends CourseReviewProps {
  father_record?: CommentInfo;
  handleEndorse?: () => void;
}

const ReviewHeader: React.FC<CourseReviewProps> = memo((props) => {
  const {
    course_id,
    publisher_id,
    isHot,
    star_rating,
    id,
    isEditable,
    initialVisibility = 'public',
    onVisibilityChange,
  } = props;
  const [visibility, setVisibility] = useState<'public' | 'private'>(initialVisibility);
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
  }, [course_id, publisher_id]);

  const navigateToPage = async () => {
    await Taro.navigateTo({
      url: `/pages/classInfo/index?course_id=${course_id}`,
    });
  };

  const handleClickToClass = () => {
    void navigateToPage().then((r) => console.log(r));
  };

  const toggleVisibility = useCallback(
    (e) => {
      e.stopPropagation();

      if (isEditable && id) {
        const newVisibility = visibility === 'public' ? 'private' : 'public';
        setVisibility(newVisibility);
        onVisibilityChange?.(id, newVisibility);
      }
    },
    [isEditable, id, visibility, onVisibilityChange]
  );

  // todos: 暂未实装
  const userLevel = useMemo(() => Math.floor(Math.random() * 7), []);
  const levelClass = `level-${Math.min(userLevel, 6)}`;

  return (
    <>
      <View className="review_header_row">
        <View className="class_title" onClick={handleClickToClass}>
          {course_info?.name
            ? `${course_info?.name} (${course_info?.teacher}) `
            : '加载中 ...'}
        </View>
        <View className="header_right_area">
          {isEditable && (
            <View className={`visibility_btn ${visibility}`} onClick={toggleVisibility}>
              <Text className="btn_text">
                {visibility === 'public' ? '设为公开' : '设为隐私'}
              </Text>
            </View>
          )}
          <ShowStar score={star_rating} />
        </View>
      </View>
      <View className="reviewer_info">
        <View className="user_info">
          <View
            className="user_avatar"
            style={`background-image: url(${publisher_info?.avatar});`}
          ></View>
          <View className="user_meta">
            <View className={`user_level ${levelClass}`}>lv{userLevel}</View>
            <View className="user_name">{publisher_info?.nickname}</View>
          </View>
        </View>

        <Image
          style={`display:${isHot ? 'block' : 'none'}`}
          className="hot_icon"
          src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
        ></Image>
      </View>
    </>
  );
});

const ReviewFooter: React.FC<ReviewFooterProps> = memo((props) => {
  const {
    type,
    ctime,
    father_record,
    total_comment_count,
    total_oppose_count,
    total_support_count,
    onCommentClick,
    handleEndorse,
  } = props;

  const isInner = type === 'inner';

  return (
    <View className="review_footer">
      <View className="footer_time">
        <Text>{formatDate(new Date(ctime as number).toISOString())}</Text>
      </View>

      <View className="footer_actions">
        <View className="action_item" onClick={() => isInner && void handleEndorse?.()}>
          <View className="action_icon">
            <IconFont name="like" />
          </View>
          <Text className="action_count">{total_support_count}</Text>
        </View>
        <View
          className="action_item"
          onClick={() => isInner && father_record && onCommentClick?.(props)}
        >
          <View className="action_icon">
            <IconFont name="comment" />
          </View>
          <Text className="action_count">{total_comment_count}</Text>
        </View>
        {!isInner && (
          <View className="action_item">
            <View className="action_icon">
              <Navigator className="iconfont">&#xe785;</Navigator>
            </View>
            <Text className="action_count">{total_oppose_count}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const CourseReview: React.FC<CourseReviewProps> = memo((props) => {
  const { showAll, type, content, id, onClick, stance, onLikeClick, features } = props;
  const [shouldSupport, setShouldSupport] = useState(stance === 1);
  const { getComment, enrose } = useCourseStore((state) => ({
    getComment: state.getComment,
    enrose: state.enrose,
  }));

  useEffect(() => {
    setShouldSupport(stance === 1);
  }, [stance]);

  const father_record = getComment(id ?? 0);

  const handleClick = useCallback(() => {
    onClick && onClick(props);
  }, [onClick]);

  const handleEndorse = async () => {
    setShouldSupport(!shouldSupport);
    const res = await enrose(
      id ?? 0,
      shouldSupport ? COMMENT_ACTIONS.DISLIKE : COMMENT_ACTIONS.LIKE
    );
    onLikeClick && onLikeClick(res);
  };

  return (
    <View
      className={`course_review_container ${props.classNames || ''}`}
      onClick={handleClick}
    >
      <View className="review_content_wrapper">
        <ReviewHeader {...props}></ReviewHeader>

        <View className={`review_text ${!showAll ? 'text_overflow' : 'text_show_all'}`}>
          {content}
        </View>

        <View className="feature_tags_container">
          {props.showTag &&
            features?.map((item, index) => {
              const feature = featureMap.find((feat) => feat.value === item);
              return (
                feature && (
                  <FeatureLabel
                    checked
                    key={index}
                    content={feature.content}
                  ></FeatureLabel>
                )
              );
            })}
        </View>

        {type === 'inner' && (
          <ReviewFooter
            {...props}
            father_record={father_record}
            handleEndorse={handleEndorse}
          />
        )}
      </View>

      {type !== 'inner' && <ReviewFooter {...props} />}
    </View>
  );
});

export default CourseReview;
