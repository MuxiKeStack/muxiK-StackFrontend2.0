import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect } from 'react';

import { useEvaluationHistoryStore } from '@/store';

import { FeedCard, GateScreen, VirtualList } from '@/common/components';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import type { EvaluationStatus } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { navigateToEvaluationDetail } from '@/common/utils/evaluation';
import { NavigationBar } from '@/modules/navigation';

const STATUS_OPTIONS: { label: string; value: EvaluationStatus }[] = [
  { label: '公开', value: 'Public' },
  { label: '私密', value: 'Private' },
];

interface CommentItemProps {
  id: string | number;
  index: number;
  data: CommentInfo[];
}

const EvaluationHistoryContent: React.FC = memo(() => (
  <>
    <NavigationBar title="评课历史" isBackToPage />
    <View className="mt-24"></View>
    <History />
  </>
));

const Page: React.FC = memo(() => {
  const gate = useGateGuard();

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen title="评课历史" />;

  return <EvaluationHistoryContent />;
});

export default Page;

const CommentItem = memo(({ id, index, data }: CommentItemProps) => {
  const item = data[index];

  const handleVisibilityChange = useCallback(
    async (evaluationId: number, visibility: 'public' | 'private') => {
      const targetStatus: EvaluationStatus =
        visibility === 'public' ? 'Public' : 'Private';
      const currentStatus = item.status as EvaluationStatus;
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
      } catch (e) {
        console.error('[evaluationHistory] 切换可见性失败:', e);
        Taro.showToast({ title: '操作失败', icon: 'none' });
      }
    },
    [item.id, item.status]
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
          navigateToEvaluationDetail(comment);
        }}
      />
      <View className="h-4 w-full"></View>
    </>
  );
});

const History: React.FC = memo(() => {
  const activeStatus = useEvaluationHistoryStore((s) => s.activeStatus);
  const loading = useEvaluationHistoryStore((s) => s.loading);
  const comments = useEvaluationHistoryStore((s) => s.cache[s.activeStatus]?.list ?? []);
  const hasMore = useEvaluationHistoryStore(
    (s) => s.cache[s.activeStatus]?.hasMore ?? true
  );
  const refresh = useEvaluationHistoryStore((s) => s.refresh);
  const setActiveStatus = useEvaluationHistoryStore((s) => s.setActiveStatus);
  const fetchPage = useEvaluationHistoryStore((s) => s.fetchPage);
  const loadMore = useEvaluationHistoryStore((s) => s.loadMore);

  useEffect(() => {
    void fetchPage(false).catch((e) => {
      console.error('[evaluationHistory] 加载失败:', e);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    });
  }, [fetchPage]);

  const handleStatusChange = useCallback(
    (newStatus: EvaluationStatus) => {
      void setActiveStatus(newStatus).catch((e) => {
        console.error('[evaluationHistory] 加载失败:', e);
        Taro.showToast({ title: '加载失败', icon: 'error' });
      });
    },
    [setActiveStatus]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refresh(activeStatus);
    } catch (e) {
      console.error('[evaluationHistory] 刷新失败:', e);
      Taro.showToast({ title: '刷新失败', icon: 'error' });
    }
  }, [activeStatus, refresh]);

  return (
    <View>
      <View className="flex justify-center gap-4 py-3">
        {STATUS_OPTIONS.map((opt) => (
          <Text
            key={opt.value}
            className={`px-4 py-1 text-sm ${activeStatus === opt.value ? 'border-b-2 border-[#FFD777] font-semibold text-[#FFD777]' : 'text-gray-500'}`}
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
        onLoadMore={async () => {
          try {
            await loadMore();
          } catch (e) {
            console.error('[evaluationHistory] 加载更多失败:', e);
            Taro.showToast({ title: '加载更多失败', icon: 'none' });
          }
        }}
        hasMore={hasMore}
        initialLoading={loading}
        onRefresh={handleRefresh}
        EmptyChildren="暂无评课记录"
      />
    </View>
  );
});
