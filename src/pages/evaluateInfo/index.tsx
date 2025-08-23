/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button, Image, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import './style.scss';

import { Icon, TopBackground } from '@/common/assets/img/login';
import { Comment } from '@/common/components';
import CommentComponent from '@/common/components/CommentComponent/CommentComponent';
import { get } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';

import { StatusResponse } from '../evaluate';
import { useCourseStore } from '../main/store/store';
import { COMMENT_ACTIONS } from '../main/store/types';

const Page: React.FC = () => {
  const [allComments, setAllComments] = useState<CommentType[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false); // 新增状态，标记评论是否已加载
  const [replyTo, setReplyTo] = useState<CommentType | null>(null); // 新增状态，存储被回复的评论
  const [replyContent, setReplyContent] = useState(''); // 存储回复内容
  const [placeholderContent, setplaceholderContent] = useState('写下你的评论...'); // 存储占位内容
  const inputRef = useRef<typeof Textarea | null>(null);

  const [comment, setComment] = useState<CommentInfoType | null>(null); //获取课评信息
  // const biz_id = 1;
  const [biz_id, setBiz_id] = useState<number | null>(null);
  const updateInfo = useCourseStore((state) => state.comment);
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
  }, []);
  useEffect(() => {
    Taro.showLoading({
      title: '加载中',
    });
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
      Taro.hideLoading();
    };

    // 确保 biz_id 设置后再调用 fetchComments
    if (biz_id !== null) {
      fetchComments();
    }
  }, [biz_id, commentsLoaded]); // 依赖项中添加biz_id
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    void getParams();
  }, []);
  useEffect(() => {
    console.log('test status updated:', test);
  }, [test]);
  const handleCommentClick = (comment: CommentType | null) => {
    if (comment) {
      setReplyTo(comment);
      // 设置回复目标
      setplaceholderContent(`回复给${comment.user?.nickname}: `); // 初始化回复内容
      return;
    }
    if (inputRef.current) {
      (inputRef.current as unknown as { focus: () => void }).focus();
    }
  };

  const handleReplyChange = (e: any) => {
    setReplyContent(e.target.value);
  };

  const handleClearReply = () => {
    setReplyTo(null);
    setReplyContent('');
    setplaceholderContent('写下你的评论...');
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return; // 忽略空内容
    const res = await updateInfo({
      biz: 'Evaluation',
      action: COMMENT_ACTIONS.COMMENT,
      id: biz_id ?? 0,
      content: replyContent,
      parentId: replyTo?.id || 0,
      rootId:
        replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
    });
    setComment(res as CommentInfoType);
    handleClearReply();
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
  };

  // 仅当评论数据加载完成时渲染CommentComponent
  return !test ? (
    <View className="flex flex-col">
      <Image src={TopBackground as string} className="w-full"></Image>
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as string} className="h-full w-full"></Image>
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          木犀课栈 此功能敬请期待
        </Text>
      </View>
    </View>
  ) : (
    <View className="evaluateInfo mt-24" onClick={handleClearReply}>
      <NavigationBar title="评课详细" isBackToPage />
      <Comment
        showAll
        {...comment}
        type="inner"
        onLikeClick={(props) => {
          setComment({
            ...comment,
            total_support_count:
              props.total_support_count ?? (comment?.total_support_count || 0),
          } as CommentInfoType);
        }}
        onCommentClick={() => handleCommentClick(null)}
      />
      <View className="ml-4 mt-3 w-[90vw] text-lg text-[#3D3D3D]">评论区</View>
      {commentsLoaded && (
        <CommentComponent comments={allComments} onCommentClick={handleCommentClick} />
      )}
      <View className="h-[10vh] w-full"></View>
      <View className="fixed bottom-0 flex h-[8vh] w-full items-center justify-center text-sm">
        <Textarea
          className="ml-4 mr-4 h-7 w-[70%] rounded-2xl bg-[#D8D8D8] pl-3 pt-2"
          confirmType="send"
          ref={inputRef}
          placeholderClass="flex-1 justify-center text-sm text-gray-500"
          placeholder={placeholderContent}
          onClick={(e) => {
            e.stopPropagation();
          }}
          value={replyContent}
          onInput={handleReplyChange}
          onConfirm={handleReplySubmit}
        />
        <Button
          className="flex h-8 w-[20%] items-center justify-center rounded-2xl bg-[#EDA335] text-center text-base text-[#FFFFFF]"
          onClick={handleReplySubmit}
        >
          发送
        </Button>
      </View>
    </View>
  );
};

export default Page;
