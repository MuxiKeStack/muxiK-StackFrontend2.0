import { VirtualList } from '@/common/components';
import { NavigationBar } from '@/modules/navigation';
import { Text, View } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { memo, useMemo, useState } from 'react';
import { MessageItemProps } from '../type';
import { renderMessageItem } from './component/MessageItem';
import './index.scss';

// 标题映射
const TITLE_MAP = {
  comment: '评论',
  support: '点赞',
  official: '官方消息',
};

const COMMENT_TYPE = {
  COURSE: 'course',
  QUESTION: 'question',
};

const ListPage: React.FC = memo(() => {
  const router = useRouter();
  const { data, type } = router.params;
  const [activeCommentType, setActiveCommentType] = useState(COMMENT_TYPE.COURSE);

  const messageData = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(data || '[]')) as MessageItemProps[];
    } catch {
      return [];
    }
  }, [data]);

  const footerContent = useMemo(() => {
    if (type === 'comment') {
      return '——进入课程主页即可向已选过课的同学提问哦——';
    }
    if (type === 'support') {
      return '——暂无更多——';
    }
    return '';
  }, [type]);

  const title = useMemo(() => {
    return TITLE_MAP[type as keyof typeof TITLE_MAP] || '消息详情';
  }, [type]);

  const renderCommentTypeBar = () => {
    if (type !== 'comment') return null;

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
        itemData={messageData}
        itemCount={messageData.length}
        itemSize={280}
        onScroll={() => {}}
        FooterChildren={footerContent}
      />
    </View>
  );
});

export default ListPage;
