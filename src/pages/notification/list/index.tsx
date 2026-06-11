import { Text, View } from '@tarojs/components';
import { memo, useEffect, useMemo, useState } from 'react';

import './index.scss';

import { VirtualList } from '@/common/components';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

import { MessageItemProps } from '../type';
import { renderMessageItem } from './component/MessageItem';

// 标题映射
const TITLE_MAP = {
  comment: '评论',
  support: '点赞',
  official: '官方消息',
};

const COMMENT_TYPE = {
  COURSE: 'course',
  QUESTION: 'question',
} as const;

export { getNotificationUrl } from '../load';

const ListPage: React.FC = memo(() => {
  const initialPayload = bus.getSticky('notification_list') as
    | { data: MessageItemProps[]; type: string }
    | undefined;
  const [messageData, setMessageData] = useState<MessageItemProps[]>(
    () => initialPayload?.data || []
  );
  const [listType, setListType] = useState<string>(() => initialPayload?.type || '');
  const [activeCommentType, setActiveCommentType] = useState<string>(COMMENT_TYPE.COURSE);

  useEffect(() => {
    const off = bus.onSticky(
      'notification_list',
      (payload: { data: MessageItemProps[]; type: string }) => {
        setMessageData(payload.data);
        setListType(payload.type);
      }
    );
    return () => off();
  }, []);

  // 根据子 tab 筛选评论：评课(Evaluation) / 提问(Answer)
  const filteredCommentData = useMemo(() => {
    if (listType !== 'comment') return messageData;
    const bizFilter = activeCommentType === COMMENT_TYPE.COURSE ? 'Evaluation' : 'Answer';
    return messageData.filter((m) => (m.biz || 'Evaluation') === bizFilter);
  }, [messageData, listType, activeCommentType]);

  const displayData = listType === 'comment' ? filteredCommentData : messageData;

  const footerContent = useMemo(() => {
    if (listType === 'comment') {
      return '——进入课程主页即可向已选过课的同学提问哦——';
    }
    if (listType === 'support') {
      return '——暂无更多——';
    }
    return '';
  }, [listType]);

  const title = useMemo(() => {
    return TITLE_MAP[listType as keyof typeof TITLE_MAP] || '消息详情';
  }, [listType]);

  const renderCommentTypeBar = () => {
    if (listType !== 'comment') return null;

    return (
      <View className="comment_type_bar">
        <View
          className={`comment_type_item ${activeCommentType === COMMENT_TYPE.COURSE ? 'active' : ''}`}
          onClick={() => setActiveCommentType(COMMENT_TYPE.COURSE)}
        >
          <Text className="comment_type_text">评课评论</Text>
        </View>
        <View
          className={`comment_type_item ${activeCommentType === COMMENT_TYPE.QUESTION ? 'active' : ''}`}
          onClick={() => setActiveCommentType(COMMENT_TYPE.QUESTION)}
        >
          <Text className="comment_type_text">提问评论</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="list_page_container">
      <NavigationBar title={title} isBackToPage />
      {renderCommentTypeBar()}
      <VirtualList
        height="90%"
        width="100%"
        item={renderMessageItem}
        itemData={displayData}
        itemCount={displayData.length}
        itemSize={280}
        onScroll={() => {}}
        FooterChildren={footerContent}
      />
    </View>
  );
});

export default ListPage;
