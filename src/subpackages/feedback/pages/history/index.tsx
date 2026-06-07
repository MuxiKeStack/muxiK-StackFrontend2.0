import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { sourceLabel, useFeedbackStore } from '@/store';

import { VirtualList } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';
import type { FeedbackItem } from '@/subpackages/feedback/type';

function spliceText(text: string, maxLength = 45) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function getStatusClass(status: string) {
  if (status === '待处理') return 'feedback_history_pending';
  if (status === '处理中') return 'feedback_history_processing';
  if (status === '已完成') return 'feedback_history_resolved';
  return 'feedback_history_pending';
}

const HistoryRow = memo(
  ({ index, data }: { id: string | number; index: number; data: FeedbackItem[] }) => {
    const item = data[index];

    const handleNavi = () => {
      bus.stickyEmit('feedback_detail', item);
      void Taro.navigateTo({ url: ROUTES.feedback.detail });
    };

    return (
      <View className="feedback_history_item" onClick={handleNavi}>
        <View className="feedback_history_item_header">
          <View className="feedback_history_item_tags_row">
            <View className="feedback_history_item_tag">
              <Text className="feedback_history_item_tag_text">
                {item.fields.source || '未知来源'}
              </Text>
            </View>
            <View className="feedback_history_item_tag">
              <Text className="feedback_history_item_tag_text">
                {item.fields.type || '其他问题'}
              </Text>
            </View>
          </View>
          <Text className="feedback_history_item_time">{item.fields.submitTime}</Text>
        </View>

        <View className="feedback_history_item_content">
          <Text className="feedback_history_item_title">反馈内容</Text>
          <Text className="feedback_history_item_text">
            {spliceText(item.fields.content)}
          </Text>
        </View>

        <View className="feedback_history_item_footer">
          <View className="feedback_history_reply_container">
            <Text className="feedback_history_reply_text">
              回复: {spliceText(item.fields.reply, 15)}
            </Text>
          </View>

          <View
            className={`feedback_history_item_status_bg ${getStatusClass(item.fields.status)}`}
          >
            <Text
              className={`feedback_history_item_status_text ${getStatusClass(item.fields.status)}`}
            >
              {item.fields.status}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const FeedbackHistory = () => {
  const studentId = Taro.getStorageSync<string>('student_id') || '';
  const historyList = useFeedbackStore((s) => s.historyList);
  const historySource = useFeedbackStore((s) => s.historySource);
  const historyHasMore = useFeedbackStore((s) => s.historyHasMore);
  const loadHistory = useFeedbackStore((s) => s.loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const fetchData = useCallback(
    async (append = false) => {
      if (loadingRef.current) return;
      if (append && !historyHasMore) return;
      loadingRef.current = true;
      setIsLoading(true);

      try {
        await loadHistory(studentId, append);
      } catch (e) {
        console.error('获取历史失败', e);
        void Taro.showToast({ title: '获取反馈历史失败', icon: 'error' });
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [historyHasMore, loadHistory, studentId]
  );

  useEffect(() => {
    void fetchData(false);
  }, [fetchData]);

  const loadMore = useCallback(() => fetchData(true), [fetchData]);

  return (
    <View className="feedback_history_container">
      <NavigationBar title="反馈历史" isBackToPage />
      {historySource === 'fallback' && (
        <Text className="faq_offline_hint">{sourceLabel(historySource)}</Text>
      )}
      <VirtualList
        height="85vh"
        width="100%"
        item={HistoryRow}
        itemData={historyList}
        itemCount={historyList.length}
        itemSize={175}
        getItemKey={(item) => item.record_id}
        onLoadMore={loadMore}
        hasMore={historyHasMore}
        initialLoading={isLoading && historyList.length === 0}
        EmptyChildren="暂无反馈记录"
      />
    </View>
  );
};

export default FeedbackHistory;
