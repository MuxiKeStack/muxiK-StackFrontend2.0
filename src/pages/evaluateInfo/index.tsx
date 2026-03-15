/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { getTopLevelComments } from '@/common/api/comment';
import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';
import './index.scss';

import { Icon, TopBackground } from '@/common/assets/img/login';
import { BottomInput, CourseReview, ReviewDiscussion } from '@/common/components';
import { postBool } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';

import { StatusResponse } from '../evaluate';
import { useCourseStore } from '../main/store/store';
import { COMMENT_ACTIONS } from '../main/store/types';

const Page: React.FC = () => {
  const [reviewComments, setReviewComments] = useState<CommentType[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [replyTo, setReplyTo] = useState<CommentType | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [placeholderContent, setPlaceholderContent] = useState('写下你的评论...');
  const textAreaRef = useRef(null);

  const [courseReview, setCourseReview] = useState<CommentInfoType | null>(null);
  const [bizId, setBizId] = useState<number | null>(null);
  const [test, setTest] = useState(false);

  const updateInfo = useCourseStore((state) => state.comment);

  const parseRouteComment = () => {
    const query = Taro.getCurrentInstance()?.router?.params;
    const serializedComment = query?.comment;
    if (serializedComment) {
      try {
        const parsedComment = JSON.parse(decodeURIComponent(serializedComment));
        setCourseReview(parsedComment);
        setBizId(parsedComment.id);
      } catch (error) {
        console.error('解析评论参数失败', error);
      }
    }
  };

  const loadComments = async () => {
    if (!bizId) return;
    Taro.showLoading({ title: '加载中' });
    try {
      const res = await getTopLevelComments({
        biz: 'Evaluation',
        biz_id: bizId,
        cur_comment_id: 0,
        limit: 100,
      });

      setReviewComments(res.data);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('加载评论失败', error);
    } finally {
      Taro.hideLoading();
    }
  };

  const checkTestStatus = async () => {
    try {
      const res = (await postBool('/checkStatus', { name: 'kestack' })) as StatusResponse;
      setTest(res.data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleCommentClick = (clickedComment: CommentType | null) => {
    if (clickedComment) {
      setReplyTo(clickedComment);
      setPlaceholderContent(`回复给${clickedComment.user?.nickname}: `);
    }

    if (textAreaRef.current) {
      (textAreaRef.current as unknown as { focus: () => void }).focus();
    }
  };

  const handleReplyChange = (value: string) => {
    setReplyContent(value);
  };

  const clearReply = () => {
    setReplyTo(null);
    setReplyContent('');
    setPlaceholderContent('写下你的评论...');
  };

  const refreshComments = async () => {
    setCommentsLoaded(false);
    await loadComments();
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !bizId) return;

    const res = await updateInfo({
      biz: 'Evaluation',
      action: COMMENT_ACTIONS.COMMENT,
      id: bizId,
      content: replyContent,
      parentId: replyTo?.id || 0,
      rootId:
        replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
    });
    setCourseReview(res as CommentInfoType);
    clearReply();
    await refreshComments();
  };

  const handleLikeClick = (props: any) => {
    setCourseReview({
      ...courseReview,
      total_support_count:
        props.total_support_count ?? (courseReview?.total_support_count || 0),
    } as CommentInfoType);
  };

  useEffect(() => {
    parseRouteComment();
    checkTestStatus();
  }, []);

  useEffect(() => {
    if (bizId !== null) {
      loadComments();
    }
  }, [bizId]);

  if (!test) {
    return (
      <View className="evaluateInfo_page_unauthorized_container">
        <Image
          src={TopBackground as string}
          className="evaluateInfo_page_background_image"
        />
        <View className="evaluateInfo_page_unauthorized_content">
          <View className="evaluateInfo_page_unauthorized_icon_wrapper">
            <Image src={Icon as string} className="evaluateInfo_page_unauthorized_icon" />
          </View>
          <Text className="evaluateInfo_page_unauthorized_text">
            木犀课栈 此功能敬请期待
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="evaluateInfo_page_container" onClick={clearReply}>
      <NavigationBar title="评课详细" isBackToPage />
      <View className="evaluateInfo_page_comment_wrapper">
        <CourseReview
          showAll
          {...courseReview}
          type="inner"
          onLikeClick={handleLikeClick}
          onCommentClick={() => handleCommentClick(null)}
        />
      </View>

      <View className="evaluateInfo_page_comments_title">评论区</View>
      <View className="evaluateInfo_page_divider" />
      {commentsLoaded && (
        <View className="evaluateInfo_page_comments_list">
          <ReviewDiscussion
            comments={reviewComments}
            onCommentClick={handleCommentClick}
          />
        </View>
      )}
      {/* <View className="evaluateInfo_page_reply_input_container">
        <Textarea
          className="evaluateInfo_page_reply_textarea"
          confirmType="send"
          ref={textAreaRef}
          placeholderClass="evaluateInfo_page_reply_placeholder"
          placeholder={placeholderContent}
          onClick={(e) => e.stopPropagation()}
          value={replyContent}
          onInput={handleReplyChange}
          onConfirm={handleReplySubmit}
        />
        <Button className="evaluateInfo_page_reply_button" onClick={handleReplySubmit}>
          <Text className="evaluateInfo_page_reply_button_text">发送</Text>
        </Button>
      </View> */}
      <BottomInput
        value={replyContent}
        onChange={handleReplyChange}
        onSubmit={handleReplySubmit}
      />
    </View>
  );
};

export default Page;
