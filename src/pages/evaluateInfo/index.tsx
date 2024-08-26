/* eslint-disable simple-import-sort/imports */
/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable import/first */
import { Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import Comment from '@/common/components/comment/comment';
import CommentComponent from '@/common/components/CommentComponent/CommentComponent';

import { get, post } from '@/common/utils/fetch';

import { CommentInfoType, Comment as CommentType } from '../../common/assets/types';

export default function Index() {
  const [allComments, setAllComments] = useState<CommentType[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false); // 新增状态，标记评论是否已加载
  const [replyTo, setReplyTo] = useState<CommentType | null>(null); // 新增状态，存储被回复的评论
  const [replyContent, setReplyContent] = useState(''); // 存储回复内容
  const [placeholderContent, setplaceholderContent] = useState('写下你的评论...'); // 存储占位内容

  const [comment, setComment] = useState<CommentInfoType | null>(null); //获取课评信息
  // const biz_id = 1;
  const [biz_id, setBiz_id] = useState<number | null>(null);

  useEffect(() => {
    const handleQuery = () => {
      const query = Taro.getCurrentInstance()?.router?.params; // 获取查询参数
      const serializedComment = query?.comment;
      if (serializedComment) {
        try {
          // 解析字符串
          const parsedComment = JSON.parse(decodeURIComponent(serializedComment));
          setComment(parsedComment);
          setBiz_id(parsedComment.id);
        } catch (error) {
          console.error('解析评论参数失败', error);
        }
      }
    };

    handleQuery();

    const fetchComments = async () => {
      // console.log(biz_id)
      try {
        const res = await get(
          `/comments/list?biz=Evaluation&biz_id=${biz_id}&cur_comment_id=0&limit=100`
        );
        // console.log(res.data);
        setAllComments(res.data);
        setCommentsLoaded(true);
      } catch (error) {
        console.error('加载评论失败', error);
      }
    };

    // 确保 biz_id 设置后再调用 fetchComments
    if (biz_id !== null) {
      console.log(1);
      fetchComments();
    }
  }, [biz_id, commentsLoaded]); // 依赖项中添加biz_id

  const handleCommentClick = (comment: CommentType) => {
    console.log(comment);
    setReplyTo(comment); // 设置回复目标
    setplaceholderContent(`回复给${comment.user?.nickname}: `); // 初始化回复内容
  };

  const handleReplyChange = (e: any) => {
    setReplyContent(e.target.value);
  };

  const handleClearReply = () => {
    console.log(2);
    setReplyTo(null);
    setReplyContent('');
    setplaceholderContent('写下你的评论...');
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return; // 忽略空内容

    try {
      await post('/comments/publish', {
        biz: 'Evaluation',
        biz_id,
        content: replyContent,
        parent_id: replyTo?.id || 0,
        root_id:
          replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
      });
      console.log('评论发布成功');

      // 清空回复目标和输入框
      setReplyTo(null);
      setReplyContent('');
      setplaceholderContent('写下你的评论...');

      // 评论发布成功后，重新加载评论
      setCommentsLoaded(false); // 先将commentsLoaded设为false，避免useEffect中的fetchComments不被调用
      const fetchComments = async () => {
        try {
          const res = await get(
            `/comments/list?biz=Evaluation&biz_id=${biz_id}&cur_comment_id=0&limit=100`
          );
          setAllComments(res.data);
          setCommentsLoaded(true);
        } catch (error) {
          console.error('加载评论失败', error);
        }
      };
      await fetchComments();
    } catch (error) {
      console.error('评论发布失败', error);
    }
  };

  // 仅当评论数据加载完成时渲染CommentComponent
  return (
    <View className="evaluateInfo" onClick={handleClearReply}>
      <Comment {...comment} />
      {commentsLoaded && (
        <CommentComponent comments={allComments} onCommentClick={handleCommentClick} />
      )}
      <View className="reply-input">
        <Input
          type="text"
          placeholder={placeholderContent}
          value={replyContent}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onInput={handleReplyChange}
          onConfirm={handleReplySubmit}
        />
      </View>
    </View>
  );
}
