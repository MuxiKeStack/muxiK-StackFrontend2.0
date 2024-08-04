// Comment.tsx
import React, { useState, useEffect } from 'react';
import { View, Text,Image } from '@tarojs/components';
import { Comment } from '../../assets/types';
import './index.scss'
import { getUserInfo } from '../../assets/userService';
import { get } from '@/fetch';

interface CommentProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
}

const CommentComponent: React.FC<CommentProps> = ({ comments, onCommentClick }) => {
  // console.log(comments);
  const [allComments, setAllComments] = useState<Comment[]>(comments);

  useEffect(() => {
    const fetchAllReplies = async () => {
      const topLevelComments = allComments.filter(c => c.parent_comment_id === 0 && c.root_comment_id === 0);

      const promises = topLevelComments.map(async (comment) => {
        const res = await get(`/comments/replies/list?root_id=${comment.id}&cur_comment_id=0&limit=10`);
        if (res.code === 0 && Array.isArray(res.data)) {
          const replies = res.data.map((reply) => ({
            ...reply
          }));
          return { ...comment, replies };
        }
        return { ...comment, replies: [] };
      });

      const updatedComments = (await Promise.all(promises));

      const commentsWithUserInfo = await Promise.all(
        updatedComments.map(async (comment) => {
          const user = await getUserInfo(comment.commentator_id);
          return { ...comment, user };
        })
      );

      const commentsWithRepliesAndUserInfo = await Promise.all(
        commentsWithUserInfo.map(async (comment) => {
          const replies = comment.replies || [];
          const repliesWithUserInfo = await Promise.all(
            replies.map(async (reply) => {
              const user = await getUserInfo(reply.commentator_id);
              return { ...reply, user };
            })
          );
          return { ...comment, replies: repliesWithUserInfo };
        })
      );

      console.log(commentsWithRepliesAndUserInfo)

      setAllComments(commentsWithRepliesAndUserInfo);
    };

    fetchAllReplies();
  }, []);

  const ctimeToString = (ctime: number)=>{
    const ctimeDate = new Date(ctime);
    return <Text className='time'>{ctimeDate.toLocaleString()}</Text>
  }

  // 辅助函数：获取回复者的昵称
const getReplyToNickname = (replyToUid: number): string => {
  // 遍历所有评论的回复
  for (const comment of allComments) {
    const reply = comment.replies?.find(r => r.commentator_id === replyToUid);
    if (reply && reply.user) {
      return reply.user.nickname;
    }
  }
  return '未知用户'; // 如果没有找到回复者，返回默认昵称
};

  return (
    <View className="comments">
      {allComments.map((comment) => (
        <View key={comment.id} className="acomment" onClick={(e) => {
          onCommentClick(comment)
          e.stopPropagation();
        }
          }>
          <View className="comment-header">
          <Image
            src={comment.user?.avatar ?? ''}
            className="avatar"
          />
            <Text className="nickname">{comment.user?.nickname}</Text>
            {
              ctimeToString(comment.ctime)
            }
          </View>
          <View className="comment-content">
            <Text>{comment.content}</Text>
          </View>
          <View className="replies">
            {comment.replies?.map((reply) => (
              <View key={reply.id} className="reply" onClick={(e) => {
                onCommentClick(reply);
                e.stopPropagation();}
                }>
                <View className="reply-header">
                  <Image
                    src={reply.user?.avatar ?? ''}
                    className="avatar"
                  />
                  <Text className="nickname">
                    {reply.user?.nickname} 
                    {reply.root_comment_id !== reply.parent_comment_id ? (
                      <Text className="reply-indicator">
                        回复 {getReplyToNickname(reply.reply_to_uid)}
                      </Text>
                    ) : null}
                    </Text>
                  {
                    ctimeToString(reply.ctime)
                  }
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
