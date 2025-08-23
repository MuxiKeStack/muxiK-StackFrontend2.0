/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// Comment.tsx
import { Image, Text, View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import { formatIsoDate, get } from '@/common/utils';
// eslint-disable-next-line import/first
import { useCourseStore } from '@/pages/main/store/store';

interface CommentProps {
  comments: CommentType[];
  onCommentClick: (comment: CommentType) => void;
}

const CommentComponent: React.FC<CommentProps> = ({ comments, onCommentClick }) => {
  const [allComments, setAllComments] = useState<CommentType[]>(comments);
  const dispatch = useCourseStore(({ getPublishers }) => ({ getPublishers }));
  useEffect(() => {
    const fetchAllReplies = async () => {
      const topLevelComments = allComments.filter(
        (c) => c.parent_comment_id === 0 && c.root_comment_id === 0
      );

      const promises = topLevelComments.map(async (comment) => {
        const res = await get(
          `/comments/replies/list?root_id=${comment.id}&cur_comment_id=0&limit=10`
        );
        if (res.code === 0 && Array.isArray(res.data)) {
          const replies = res.data.map((reply) => ({
            ...reply,
          }));
          return { ...comment, replies };
        }
        return { ...comment, replies: [] };
      });

      const updatedComments = await Promise.all(promises);

      const commentsWithUserInfo = await Promise.all(
        updatedComments.map(async (comment) => {
          const user = await dispatch.getPublishers(comment.commentator_id);
          return { ...comment, user };
        })
      );

      const commentsWithRepliesAndUserInfo = await Promise.all(
        commentsWithUserInfo.map(async (comment) => {
          const replies = comment.replies || [];
          const repliesWithUserInfo = await Promise.all(
            replies.map(async (reply) => {
              const user = await dispatch.getPublishers(reply.commentator_id);
              return { ...reply, user };
            })
          );
          return { ...comment, replies: repliesWithUserInfo };
        })
      );

      // console.log(commentsWithRepliesAndUserInfo);

      setAllComments(commentsWithRepliesAndUserInfo);
    };

    void fetchAllReplies();
  }, []);

  // 辅助函数：获取回复者的昵称
  const getReplyToNickname = (replyToUid: number): string => {
    // 遍历所有评论的回复
    for (const comment of allComments) {
      const reply = comment.replies?.find((r) => r.commentator_id === replyToUid);
      if (reply && reply.user) {
        return reply.user.nickname;
      }
    }
    return '未知用户'; // 如果没有找到回复者，返回默认昵称
  };

  return (
    <View className="comments">
      {allComments.map((comment) => (
        <View
          key={comment.id}
          className="acomment"
          onTouchEnd={(e) => {
            e.stopPropagation();
            onCommentClick(comment);
          }}
        >
          <View className="comment-header">
            <Image src={comment.user?.avatar ?? ''} className="avatar" />
            <Text className="nickname">{comment.user?.nickname}</Text>
            <View className="time">
              {formatIsoDate(new Date(comment.ctime).toISOString())}
            </View>
          </View>
          <View className="comment-content">
            <Text>{comment.content}</Text>
          </View>
          <View className="replies">
            {comment.replies?.map((reply) => (
              <View
                key={reply.id}
                className="reply"
                onTouchEnd={(e) => {
                  onCommentClick(reply);
                  e.stopPropagation();
                }}
              >
                <View className="reply-header">
                  <Image src={reply.user?.avatar ?? ''} className="avatar" />
                  <Text className="nickname">
                    {reply.user?.nickname}
                    {reply.root_comment_id !== reply.parent_comment_id ? (
                      <Text className="reply-indicator">
                        回复 {getReplyToNickname(reply.reply_to_uid)}
                      </Text>
                    ) : null}
                  </Text>
                  <View className="time">
                    {formatIsoDate(new Date(comment.ctime).toISOString())}
                  </View>
                </View>
                <View className="reply-content">
                  <Text>{reply.content}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default CommentComponent;
