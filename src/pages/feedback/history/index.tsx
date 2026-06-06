import { Text, View } from '@tarojs/components';
import { VirtualList } from '@tarojs/components-advanced/dist/components/virtual-list';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { bus } from '@/common/utils';
import Loading from '@/common/components/Loading';
import { NavigationBar } from '@/modules/navigation';
import { sourceLabel, useFeedbackStore } from '@/store';

import { FeedbackItem } from '../type';

const FeedbackHistory = () => {
  const studentId = Taro.getStorageSync<string>('student_id') || '';
  const historyList = useFeedbackStore((s) => s.historyList);
  const historySource = useFeedbackStore((s) => s.historySource);
  const historyHasMore = useFeedbackStore((s) => s.historyHasMore);
  const loadHistory = useFeedbackStore((s) => s.loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const fetchData = async (append = false) => {
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
  };

  useEffect(() => {
    void fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRow = useCallback(({ index, data, style }: { index: number; data: FeedbackItem[]; style: React.CSSProperties }) => {
    const item = data[index] as FeedbackItem;

    const handleNavi = () => {
      bus.stickyEmit('feedback_detail', item);
      void Taro.navigateTo({ url: '/pages/feedback/detail/index' });
    };

    function spliceText(text: string, maxLength = 45) {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    const getStatusClass = (status: string) => {
      if (status === '待处理') return 'feedback_history_pending';
      if (status === '处理中') return 'feedback_history_processing';
      if (status === '已完成') return 'feedback_history_resolved';
      return 'feedback_history_pending';
    };

    return (
      <View
        className="feedback_history_item"
        style={style}
        key={item.record_id}
        onClick={handleNavi}
      >
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
  }, []);

  return (
    <View className="feedback_history_container">
      <NavigationBar title="反馈历史" isBackToPage />
      {historySource === 'fallback' && (
        <Text className="faq_offline_hint">{sourceLabel(historySource)}</Text>
      )}
      {historyList.length === 0 && isLoading ? (
        <Loading text="加载中..." />
      ) : (
        <>
          <VirtualList
            className="feedback_history_list"
            height="100%"
            width="100%"
            itemData={historyList}
            itemCount={historyList.length}
            item={renderRow}
            itemSize={175}
            onScroll={({ scrollDirection, scrollOffset }) => {
              if (
                scrollDirection === 'forward' &&
                scrollOffset > (historyList.length - 5) * 140
              ) {
                void fetchData(true);
              }
            }}
          />
          {isLoading && <Loading text="加载更多..." isCenter={false} />}
        </>
      )}
    </View>
  );
};

export default FeedbackHistory;
