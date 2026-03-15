/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { getCommentReplies } from '@/common/api/comment';
import { CommentCard } from '@/common/components';
import { ScrollView, Text, View } from '@tarojs/components';
import React, { useCallback, useEffect, useState } from 'react';

import './index.scss';

import { useCourseStore } from '@/pages/main/store/store';

interface ReviewDiscussionProps {
  comments: CommentType[];
  onCommentClick: (comment: CommentType) => void;
}

const CHUNK_SIZE_FIRST = 3;
const CHUNK_SIZE_MORE = 10;

const getCommentsWithUserInfo = async (
  comments: CommentType[],
  getUserInfo: (userId: number) => Promise<any>
): Promise<CommentType[]> => {
  return Promise.all(
    comments.map(async (comment) => {
      const user = await getUserInfo(comment.commentator_id);
      return { ...comment, user };
    })
  );
};

const getRepliesWithUserInfo = async (
  comments: CommentType[],
  getUserInfo: (userId: number) => Promise<any>
): Promise<CommentType[]> => {
  return Promise.all(
    comments.map(async (comment) => {
      if (!comment.replies || comment.replies.length === 0) {
        return comment;
      }

      const repliesWithUserInfo = await getCommentsWithUserInfo(
        comment.replies,
        getUserInfo
      );

      return { ...comment, replies: repliesWithUserInfo };
    })
  );
};

const ReviewDiscussion: React.FC<ReviewDiscussionProps> = ({
  comments,
  onCommentClick,
}) => {
  const [allComments, setAllComments] = useState<CommentType[]>(comments);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  const [replyChunk, setReplyChunk] = useState<Record<number, number>>({});
  const getUserInfo = useCourseStore((state) => state.getPublishers);

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    if (!expandedReplies[commentId]) {
      setReplyChunk((prev) => ({
        ...prev,
        [commentId]: 1,
      }));
    }
  };

  const loadMoreReplies = (commentId: number, totalReplies: number) => {
    setReplyChunk((prev) => {
      const currentChunk = prev[commentId] || 1;
      const currentLoadedCount =
        currentChunk === 1
          ? CHUNK_SIZE_FIRST
          : CHUNK_SIZE_FIRST + (currentChunk - 1) * CHUNK_SIZE_MORE;

      if (currentLoadedCount >= totalReplies) {
        return prev;
      }

      const nextChunk = currentChunk + 1;
      return {
        ...prev,
        [commentId]: nextChunk,
      };
    });
  };

  const getVisibleReplies = (replies: any[], commentId: number) => {
    // if (!expandedReplies[commentId]) return [];
    const chunk = replyChunk[commentId] || 1;

    if (chunk === 1) {
      return replies.slice(0, CHUNK_SIZE_FIRST);
    } else {
      return replies.slice(0, CHUNK_SIZE_FIRST + (chunk - 1) * CHUNK_SIZE_MORE);
    }
  };

  const hasMoreReplies = (replies: any[], commentId: number) => {
    const chunk = replyChunk[commentId] || 1;
    const loadedCount =
      chunk === 1 ? CHUNK_SIZE_FIRST : CHUNK_SIZE_FIRST + (chunk - 1) * CHUNK_SIZE_MORE;
    return replies.length > loadedCount;
  };

  useEffect(() => {
    const fetchAllReplies = async () => {
      const topLevelComments = allComments.filter(
        (c) => c.parent_comment_id === 0 && c.root_comment_id === 0
      );

      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment) => {
          try {
            const res = await getCommentReplies({
              root_id: comment.id,
              cur_comment_id: 0,
              limit: 10,
            });

            if (res.code === 0 && Array.isArray(res.data)) {
              return { ...comment, replies: res.data };
            }
          } catch (error) {
            console.error(`获取评论 ${comment.id} 的回复失败:`, error);
          }

          return { ...comment, replies: [] };
        })
      );

      const commentsWithUserInfo = await getCommentsWithUserInfo(
        commentsWithReplies,
        getUserInfo
      );

      const finalComments = await getRepliesWithUserInfo(
        commentsWithUserInfo,
        getUserInfo
      );

      setAllComments(finalComments);
    };

    fetchAllReplies();
  }, [getUserInfo]);

  const getReplyToNickname = useCallback(
    (replyToUid: number): string => {
      for (const comment of allComments) {
        const reply = comment.replies?.find((r) => r.commentator_id === replyToUid);
        if (reply?.user) {
          return reply.user.nickname;
        }
      }
      return '未知用户';
    },
    [allComments]
  );

  return (
    <ScrollView className="review_comments_list" scrollY>
      {allComments.map((comment) => {
        const visibleReplies = getVisibleReplies(comment.replies || [], comment.id);
        const hasMore = hasMoreReplies(comment.replies || [], comment.id);
        const totalReplies = comment.replies?.length || 0;

        return (
          <View key={comment.id} className="review_comment_card">
            <CommentCard
              comment={comment}
              level="primary"
              onClick={onCommentClick}
              showBorder={!comment.replies || comment.replies.length === 0}
            />

            {comment.replies && comment.replies.length > 0 && (
              <View className="secondary_replies_container">
                <View
                  className={`secondary_replies_list ${expandedReplies[comment.id] ? 'expanded' : 'collapsing'}`}
                >
                  <View className="secondary_replies_list_inner">
                    {visibleReplies.map((reply, index) => (
                      <View
                        key={reply.id}
                        className="reply_item_wrapper"
                        style={{ '--index': index } as React.CSSProperties}
                      >
                        <CommentCard
                          comment={reply}
                          level="secondary"
                          onClick={onCommentClick}
                          showReplyIndicator={
                            reply.root_comment_id !== reply.parent_comment_id
                          }
                          replyToNickname={getReplyToNickname(reply.reply_to_uid)}
                          showBorder={false}
                        />
                      </View>
                    ))}
                  </View>
                </View>

                <View className="secondary_replies_footer">
                  {!expandedReplies[comment.id] ? (
                    <View
                      className="secondary_replies_toggle"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      <Text className="secondary_replies_toggle_text">
                        共 {totalReplies} 条回复
                      </Text>
                      {/* <Text className="secondary_replies_toggle_icon"></Text> */}
                    </View>
                  ) : (
                    <View className="secondary_replies_expanded_footer">
                      {hasMore && (
                        <View
                          className="secondary_replies_more"
                          onClick={() => loadMoreReplies(comment.id, totalReplies)}
                        >
                          <Text className="secondary_replies_more_text">展开更多</Text>
                        </View>
                      )}

                      <View
                        className="secondary_replies_collapse"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <Text className="secondary_replies_collapse_text">收起</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View className="secondary_replies_divider" />
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ReviewDiscussion;
