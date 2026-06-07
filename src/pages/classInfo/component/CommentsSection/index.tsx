import { ScrollView, Text, View } from '@tarojs/components';
import React from 'react';

import './index.scss';

import { FeedCard } from '@/common/components';
import type { CommentInfo } from '@/common/types/commentTypes';

interface Props {
  comments: CommentInfo[];
  onCommentClick: (props: CommentInfo) => void;
  onLikeClick: () => void;
  onEmptyClick: () => void;
}

const CommentsSection: React.FC<Props> = React.memo(
  ({ comments, onCommentClick, onLikeClick, onEmptyClick }) => (
    <View className="classInfo_page_comments_section">
      <View className="classInfo_page_comments_title">评论区</View>
      <ScrollView className="classInfo_page_comments_scroll" scrollY>
        <View className="classInfo_page_comments_list">
          {comments.map((comment) => (
            <FeedCard
              key={comment.id}
              classNames="classInfo_page_comment_item"
              showTag
              comment={comment}
              onClick={onCommentClick}
              onLikeClick={onLikeClick}
              type="inner"
            />
          ))}
        </View>
      </ScrollView>
      {comments.length === 0 && (
        <View className="classInfo_page_empty_comments" onClick={onEmptyClick}>
          <Text className="classInfo_page_empty_text">暂无课评, 快去评价一下吧 》</Text>
        </View>
      )}
    </View>
  )
);

export default CommentsSection;
