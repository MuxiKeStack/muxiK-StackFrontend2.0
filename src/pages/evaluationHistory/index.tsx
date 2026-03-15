import { getEvalutionHistory } from '@/common/api/profile';
import { CourseReview, VirtualList } from '@/common/components';
import { NavigationBar } from '@/modules/navigation';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useState } from 'react';

import './index.scss';

const PAGE_SIZE = 10;
const STATUS = 'Public';

interface CommentItemProps {
  id: string | number;
  index: number;
  data: CommentInfo[];
}

const Page: React.FC = memo(() => (
  <>
    <NavigationBar title="评课历史" isBackToPage />
    <View className="mt-24"></View>
    <History></History>
  </>
));

export default Page;

const CommentItem = memo(({ id, index, data }: CommentItemProps) => {
  const item = data[index];
  return (
    <>
      <CourseReview
        key={id}
        type="inner"
        {...item}
        isEditable
        onClick={(props) => {
          const serializedComment = encodeURIComponent(JSON.stringify(props));
          Taro.navigateTo({
            url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
          });
        }}
      />
      <View className="h-4 w-full"></View>
    </>
  );
});

const History: React.FC = memo(() => {
  const [comments, setComments] = useState<CommentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState(0);

  const loadMore = useCallback(async () => {
    if (hasMore) {
      Taro.hideLoading();
      return;
    }

    Taro.showLoading({ title: '加载中' });

    try {
      const res = await getEvalutionHistory({
        cur_evaluation_id: lastId,
        limit: PAGE_SIZE,
        status: STATUS,
      });

      setComments((prev) => [...prev, ...res.data]);

      if (res.data.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setLastId(res.data[res.data.length - 1].id);
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
      Taro.hideLoading();
    }
  }, [hasMore, lastId]);

  const listReachBottom = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(loadMore, 1000);
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <VirtualList
      height="100vh"
      width="100%"
      item={CommentItem}
      itemData={comments}
      itemCount={comments.length}
      itemSize={200}
      getItemKey={(item, index) => {
        return `${item.course_id}-${index}`;
      }}
      onScroll={({ scrollDirection, scrollOffset }) => {
        if (
          !loading &&
          scrollDirection === 'forward' &&
          scrollOffset > (comments.length - 5) * 20 + 100
        ) {
          listReachBottom();
        }
      }}
    />
  );
});
