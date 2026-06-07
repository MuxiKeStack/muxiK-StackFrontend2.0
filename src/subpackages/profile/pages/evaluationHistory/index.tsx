import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useEvaluationHistoryStore } from '@/store';

import { FeedCard, VirtualList } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';
import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

type EvalStatus = 'Public' | 'Private' | 'Folded';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { label: string; value: EvalStatus }[] = [
  { label: '公开', value: 'Public' },
  { label: '私密', value: 'Private' },
];

interface CommentItemProps {
  id: string | number;
  index: number;
  data: CommentInfo[];
}

const Page: React.FC = memo(() => (
  <>
    <NavigationBar title="评课历史" isBackToPage />
    <View className="mt-24"></View>
    <History />
  </>
));

export default Page;

const CommentItem = memo(({ id, index, data }: CommentItemProps) => {
  const item = data[index];

  const handleVisibilityChange = useCallback(
    async (evaluationId: number, visibility: 'public' | 'private') => {
      const targetStatus = visibility === 'public' ? 'Public' : 'Private';
      const currentStatus = item.status as EvalStatus;

      const actionText = visibility === 'public' ? '公开' : '私密';

      try {
        const { confirm } = await Taro.showModal({
          title: '提示',
          content: `确定要将此课评设为${actionText}吗？`,
        });

        if (!confirm) return;

        await useEvaluationHistoryStore
          .getState()
          .toggleStatus(evaluationId, targetStatus, currentStatus);

        bus.emit('eval_item_removed', { id: evaluationId });
      } catch (e) {
        console.error('[evaluationHistory] 切换可见性失败:', e);
      }
    },
    [item.status]
  );

  return (
    <>
      <FeedCard
        key={id}
        type="inner"
        comment={item}
        isEditable
        initialVisibility={item.status === 'Public' ? 'public' : 'private'}
        onVisibilityChange={handleVisibilityChange}
        onClick={(comment) => {
          bus.stickyEmit('evaluation', comment);
          Taro.navigateTo({ url: ROUTES.course.evaluateInfo });
        }}
      />
      <View className="h-4 w-full"></View>
    </>
  );
});

const History: React.FC = memo(() => {
  const [comments, setComments] = useState<CommentInfo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<EvalStatus>('Public');

  const loadingRef = useRef(false);
  const statusRef = useRef<EvalStatus>('Public');

  const historyCache = useEvaluationHistoryStore((s) => s.cache);
  const loadHistory = useEvaluationHistoryStore((s) => s.load);

  const fetchEvaluationHistory = useCallback(
    async (st: EvalStatus, curLastId: number, append: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const list = await loadHistory(st, curLastId, append);
        setComments((prev) => (append ? [...prev, ...list] : list));
        setHasMore(list.length >= PAGE_SIZE);
        if (list.length > 0) {
          setLastId(list[list.length - 1].id!);
        }
      } catch (e) {
        console.error('[evaluationHistory] 加载失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [loadHistory]
  );

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    void fetchEvaluationHistory(statusRef.current, lastId, true);
  }, [hasMore, lastId, fetchEvaluationHistory]);

  useEffect(() => {
    const cached = historyCache['Public'];
    if (cached?.list?.length) {
      setComments(cached.list);
      setLastId(cached.lastId!);
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }
    void fetchEvaluationHistory('Public', 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const removeHandler = (payload: { id: number }) => {
      setComments((prev) => prev.filter((item) => item.id !== payload.id));
    };

    bus.on('eval_item_removed', removeHandler);

    return () => {
      bus.off('eval_item_removed', removeHandler);
    };
  }, []);

  const handleStatusChange = useCallback(
    (newStatus: EvalStatus) => {
      if (newStatus === statusRef.current) return;
      statusRef.current = newStatus;
      setStatus(newStatus);
      setLastId(0);
      setHasMore(true);
      loadingRef.current = false;
      setComments([]);

      const cached = historyCache[newStatus];
      if (cached?.list?.length) {
        setComments(cached.list);
        setLastId(cached.lastId!);
        setHasMore(cached.hasMore);
        setLoading(false);
        return;
      }
      void fetchEvaluationHistory(newStatus, 0, false);
    },
    [fetchEvaluationHistory, historyCache]
  );

  return (
    <View>
      <View className="flex justify-center gap-4 py-3">
        {STATUS_OPTIONS.map((opt) => (
          <Text
            key={opt.value}
            className={`px-4 py-1 text-sm ${status === opt.value ? 'border-b-2 border-[#FFD777] font-semibold text-[#FFD777]' : 'text-gray-500'}`}
            onClick={() => handleStatusChange(opt.value)}
          >
            {opt.label}
          </Text>
        ))}
      </View>
      <VirtualList
        height="85vh"
        width="100%"
        item={CommentItem}
        itemData={comments}
        itemCount={comments.length}
        itemSize={200}
        getItemKey={(item, index) => `${item.course_id}-${index}`}
        onLoadMore={loadMore}
        hasMore={hasMore}
        initialLoading={loading}
        EmptyChildren="暂无评课记录"
      />
    </View>
  );
});
