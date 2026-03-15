/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button, Text, Textarea, View } from '@tarojs/components';
import React, { useEffect, useRef, useState } from 'react';

import './index.scss';

import { CourseReview, ReviewDiscussion } from '@/common/components';

interface InteractionSectionProps {
  // 核心数据
  initialMainItem?: any | null; // 主内容项（评论、问题等）
  initialReplies?: any[]; // 回复列表
  bizId?: number | null; // 业务ID

  // 回调函数
  onLoadReplies?: (bizId: number) => Promise<any[]>;
  onSubmitReply?: (params: {
    biz: string;
    action: string;
    id: number;
    content: string;
    parentId: number;
    rootId: number;
  }) => Promise<any>;
  onInteraction?: (props: any) => void; // 互动回调（点赞等）

  // 可配置项
  title?: string; // 区块标题
  placeholder?: string; // 输入框占位文本
  showTitle?: boolean; // 是否显示标题
  className?: string; // 自定义类名
  renderMainItem?: (
    item: any,
    onCommentClick: () => void,
    onInteraction: (props: any) => void
  ) => React.ReactNode; // 自定义主内容渲染
  renderReplyList?: (
    replies: any[],
    onReplyClick: (reply: any) => void
  ) => React.ReactNode; // 自定义回复列表渲染
}

const InteractionSection: React.FC<InteractionSectionProps> = ({
  initialMainItem = null,
  initialReplies = [],
  bizId = null,
  onLoadReplies,
  onSubmitReply,
  onInteraction,
  title = '互动区',
  placeholder = '写下你的想法...',
  showTitle = true,
  className = '',
  renderMainItem,
  renderReplyList,
}) => {
  const [replies, setReplies] = useState<any[]>(initialReplies);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [placeholderContent, setPlaceholderContent] = useState(placeholder);
  const [mainItem, setMainItem] = useState<any | null>(initialMainItem);
  const textAreaRef = useRef(null);

  const loadReplies = async () => {
    if (!bizId || !onLoadReplies) return;

    try {
      const res = await onLoadReplies(bizId);
      setReplies(res);
      setRepliesLoaded(true);
    } catch (error) {
      console.error('加载回复失败', error);
    }
  };

  const handleReplyClick = (clickedItem: any | null) => {
    if (clickedItem) {
      setReplyTo(clickedItem);
      setPlaceholderContent(`回复给${clickedItem.user?.nickname || '用户'}: `);
    }

    if (textAreaRef.current) {
      (textAreaRef.current as unknown as { focus: () => void }).focus();
    }
  };

  const handleReplyChange = (e: any) => {
    setReplyContent(e.target.value);
  };

  const clearReply = () => {
    setReplyTo(null);
    setReplyContent('');
    setPlaceholderContent(placeholder);
  };

  const refreshReplies = async () => {
    setRepliesLoaded(false);
    await loadReplies();
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !bizId || !onSubmitReply) return;

    const res = await onSubmitReply({
      biz: 'Evaluation',
      action: 'COMMENT',
      id: bizId,
      content: replyContent,
      parentId: replyTo?.id || 0,
      rootId:
        replyTo?.root_comment_id === 0 ? replyTo?.id : replyTo?.root_comment_id || 0,
    });

    setMainItem(res);
    clearReply();
    await refreshReplies();
  };

  const handleInteractionInternal = (props: any) => {
    if (onInteraction) {
      onInteraction(props);
    } else {
      // 默认的互动处理（点赞等）
      setMainItem({
        ...mainItem,
        total_support_count:
          props.total_support_count ?? (mainItem?.total_support_count || 0),
      });
    }
  };

  useEffect(() => {
    if (bizId !== null) {
      loadReplies();
    }
  }, [bizId]);

  return (
    <View className={`interaction_section_container ${className}`} onClick={clearReply}>
      {showTitle && <View className="interaction_section_title">{title}</View>}
      <View className="interaction_section_divider" />

      <View className="interaction_section_main_wrapper">
        {renderMainItem ? (
          renderMainItem(
            mainItem,
            () => handleReplyClick(null),
            handleInteractionInternal
          )
        ) : (
          <CourseReview
            showAll
            {...mainItem}
            type="inner"
            onLikeClick={handleInteractionInternal}
            onCommentClick={() => handleReplyClick(null)}
          />
        )}
      </View>

      {repliesLoaded && (
        <View className="interaction_section_replies_list">
          {renderReplyList ? (
            renderReplyList(replies, handleReplyClick)
          ) : (
            <ReviewDiscussion comments={replies} onCommentClick={handleReplyClick} />
          )}
        </View>
      )}

      <View className="interaction_section_input_container">
        <Textarea
          className="interaction_section_textarea"
          confirmType="send"
          ref={textAreaRef}
          placeholderClass="interaction_section_placeholder"
          placeholder={placeholderContent}
          onClick={(e) => e.stopPropagation()}
          value={replyContent}
          onInput={handleReplyChange}
          onConfirm={handleReplySubmit}
        />
        <Button className="interaction_section_button" onClick={handleReplySubmit}>
          <Text className="interaction_section_button_text">发送</Text>
        </Button>
      </View>
    </View>
  );
};

export default InteractionSection;
