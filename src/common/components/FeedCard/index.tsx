import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { useCourseStore } from '@/store/useCourseStore';

import { ActionItem, UserIdentity } from '@/common/components';
import { COURSE_FEATURE_MAP } from '@/common/constants/courseLabels';
import type { CommentInfo } from '@/common/types/commentTypes';
import { CourseDetailsType, PublisherDetailsType } from '@/common/types/courseType';
import { formatDate } from '@/common/utils';

import FeatureLabel from '../FeatureLabel';
import ShowStar from '../ShowStar';

interface FeedCardProps {
  comment: CommentInfo;
  type?: string;
  isHot?: boolean;
  showTag?: boolean;
  showAll?: boolean;
  onClick?: (comment: CommentInfo) => void;
  onCommentClick?: (comment: CommentInfo) => void;
  onLikeClick?: (comment: CommentInfo) => void;
  classNames?: string;
  isEditable?: boolean;
  initialVisibility?: 'public' | 'private';
  onVisibilityChange?: (id: number, visibility: 'public' | 'private') => void;
  hideStar?: boolean;
}

interface ReviewHeaderProps {
  comment: CommentInfo;
  isHot?: boolean;
  isEditable?: boolean;
  initialVisibility?: 'public' | 'private';
  onVisibilityChange?: (id: number, visibility: 'public' | 'private') => void;
  hideStar?: boolean;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  comment: { course_id, publisher, course_name, teacher_name, star_rating, id },
  isHot,
  isEditable,
  initialVisibility = 'public',
  onVisibilityChange,
  hideStar,
}) => {
  const [publisherInfo, setPublisherInfo] = useState<PublisherDetailsType>();
  const [courseInfo, setCourseInfo] = useState<CourseDetailsType>();
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;

    if (course_id && course_name) {
      setCourseInfo({ name: course_name, teacher: teacher_name || '', school: '' });
    } else if (course_id) {
      useCourseStore
        .getState()
        .getCourseDetail(course_id)
        .then((res) => {
          if (fetchId === fetchIdRef.current && res) setCourseInfo(res);
        })
        .catch(() => {});
    }

    if (publisher?.nickname) {
      setPublisherInfo({
        id: publisher.id ?? 0,
        avatar: publisher.avatar || '',
        nickname: publisher.nickname,
        using_title: publisher.using_title,
        level: publisher.level,
      });
    }
  }, [
    course_id,
    course_name,
    teacher_name,
    publisher?.id,
    publisher?.avatar,
    publisher?.nickname,
    publisher?.using_title,
    publisher?.level,
  ]);

  const handleClickToClass = useCallback(
    (e: any) => {
      e.stopPropagation();
      void Taro.navigateTo({ url: `/pages/classInfo/index?course_id=${course_id}` });
    },
    [course_id]
  );

  const toggleVisibility = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (!isEditable || !id) return;
      const newVisibility = initialVisibility === 'public' ? 'private' : 'public';
      onVisibilityChange?.(id, newVisibility);
    },
    [isEditable, id, initialVisibility, onVisibilityChange]
  );

  const userLevel = publisherInfo?.level ?? 0;
  const userTitle = publisherInfo?.using_title;

  return (
    <>
      <View className="review_header_row">
        <View className="class_title" onClick={handleClickToClass}>
          {courseInfo?.name
            ? `${courseInfo?.name} (${courseInfo?.teacher}) `
            : '加载中 ...'}
        </View>
        <View className="header_right_area">
          {isEditable && (
            <View
              className={`visibility_btn ${initialVisibility}`}
              onClick={toggleVisibility}
            >
              <Text className="btn_text">
                {initialVisibility === 'public' ? '设为私密' : '设为公开'}
              </Text>
            </View>
          )}
          {!hideStar && <ShowStar score={star_rating as any} />}
        </View>
      </View>
      <View className="reviewer_info">
        <UserIdentity
          avatar={publisherInfo?.avatar || ''}
          username={publisherInfo?.nickname || '匿名用户'}
          level={userLevel}
          title={userTitle}
          avatarSize={48}
          avatarClassName="cr_avatar"
        />
        <Image
          style={`display:${isHot ? 'block' : 'none'}`}
          className="hot_icon"
          src="https://s2.loli.net/2023/11/12/2ITKRcDPMZaQCvk.png"
        />
      </View>
    </>
  );
};

interface ReviewFooterProps {
  comment: CommentInfo;
  type?: string;
  fatherRecord?: CommentInfo;
  onLikeClick?: (comment: CommentInfo) => void;
  onCommentClick?: (comment: CommentInfo) => void;
}

const ReviewFooter: React.FC<ReviewFooterProps> = ({
  comment: {
    ctime,
    stance,
    total_comment_count,
    total_oppose_count,
    total_support_count,
    id,
  },
  comment,
  type,
  fatherRecord,
  onLikeClick,
  onCommentClick,
}) => {
  const isInner = type === 'inner';

  return (
    <View className="review_footer">
      <View className="footer_time">
        <Text>{ctime ? formatDate(ctime as number) : ''}</Text>
      </View>
      <View className="footer_actions">
        <ActionItem
          type="like"
          count={total_support_count}
          id={id}
          stance={stance}
          onClick={(updated) => onLikeClick?.(updated ?? comment)}
          disabled={!isInner}
        />
        <ActionItem
          type="comment"
          count={total_comment_count}
          onClick={() => onCommentClick?.(comment)}
          disabled={!isInner || !fatherRecord}
        />
        {!isInner && <ActionItem type="oppose" count={total_oppose_count} />}
      </View>
    </View>
  );
};

const FeedCard: React.FC<FeedCardProps> = memo(
  ({
    comment,
    type,
    showAll,
    showTag,
    onClick,
    onLikeClick,
    onCommentClick,
    classNames,
    isHot,
    isEditable,
    initialVisibility,
    onVisibilityChange,
    hideStar,
  }) => {
    const handleClick = useCallback(() => {
      if (comment) onClick?.(comment);
    }, [onClick, comment]);

    if (!comment) return null;
    const { content, id, features } = comment;
    const fatherRecord = useCourseStore.getState().getComment(id ?? 0);

    return (
      <View className={`feed_card_container ${classNames || ''}`} onClick={handleClick}>
        <View className="review_content_wrapper">
          <ReviewHeader
            comment={comment}
            isHot={isHot}
            isEditable={isEditable}
            initialVisibility={initialVisibility}
            onVisibilityChange={onVisibilityChange}
            hideStar={hideStar}
          />

          <View className={`review_text ${!showAll ? 'text_overflow' : 'text_show_all'}`}>
            {content}
          </View>

          {showTag && features && features.length > 0 && (
            <View className="feature_tags_container">
              {features.map((item, index) => {
                const label = COURSE_FEATURE_MAP[item] || item;
                return <FeatureLabel checked key={index} content={label} />;
              })}
            </View>
          )}

          <ReviewFooter
            comment={comment}
            type={type}
            fatherRecord={type === 'inner' ? fatherRecord : undefined}
            onLikeClick={onLikeClick}
            onCommentClick={onCommentClick}
          />
        </View>
      </View>
    );
  }
);

export default FeedCard;
