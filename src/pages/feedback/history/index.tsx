import { Text, View } from '@tarojs/components';
import { VirtualList } from '@tarojs/components-advanced/dist/components/virtual-list';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { queryUserFeedbackSheet } from '@/common/api/feedback';
import Loading from '@/common/components/Loading';
import {
  FEEDBACK_RECORD_NAMES,
  FEEDBACK_TABLE_IDENTIFY,
} from '@/common/constants/feedback';
import { NavigationBar } from '@/modules/navigation';

import { FeedbackItem } from '../type';

interface DetailedFeedbackRecord {
  record_id: string;
  record: {
    反馈内容?: string;
    截图?: string[];
    提交时间?: string | number | Date;
    用户ID?: string;
    '联系方式（QQ/邮箱）'?: string;
    问题来源?: string;
    进度?: '已完成' | '处理中' | '待处理';
    问题类型?: string;
  };
}

function formatSubmitTime(timestamp: string | number | Date | null | undefined): string {
  if (timestamp === null || timestamp === undefined) {
    return '未知时间';
  }

  const date = dayjs(timestamp);

  if (!date.isValid()) {
    return '未知时间';
  }

  return date.format('YYYY-MM-DD');
}

function transformRecordsToFeedbackItems(
  records: DetailedFeedbackRecord[]
): FeedbackItem[] {
  return records.map((item) => ({
    record_id: item.record_id,
    fields: {
      content: item.record['反馈内容'] || '暂无内容',
      screenshots: Array.isArray(item.record['截图'])
        ? item.record['截图'].map((token: string) => ({ file_token: token }))
        : [],
      submitTime: formatSubmitTime(item.record['提交时间']),
      userId: item.record['用户ID'] || '',
      contact: item.record['联系方式（QQ/邮箱）'] || '',
      source: item.record['问题来源'] || '未知来源',
      status: item.record['进度'] || '未知状态',
      type: item.record['问题类型'] || '未知类型',
    },
  }));
}

const FeedbackHistory = () => {
  const studentId = Taro.getStorageSync<string>('student_id') || '';
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [pageToken, setPageToken] = useState<string>('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadRef = useRef(true);

  const fetchData = async (isInit = false) => {
    if (!isInit && (loadRef.current || !hasMore)) return;
    loadRef.current = true;
    setIsLoading(true);

    try {
      const query = {
        page_token: pageToken,
        record_names: FEEDBACK_RECORD_NAMES,
        key_field: '学号',
        key_value: studentId,
        table_identify: FEEDBACK_TABLE_IDENTIFY,
      };

      const res: any = await queryUserFeedbackSheet(query);
      if (res.code === 0) {
        const list = transformRecordsToFeedbackItems(res.data.records);
        setFeedbackHistory((prev) => [...prev, ...list]);
        setHasMore(res.data.has_more);
        setPageToken(res.data.page_token || '');
      }
    } catch (e) {
      console.error('获取历史失败', e);
      void Taro.showToast({ title: '获取反馈历史失败', icon: 'error' });
    } finally {
      loadRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(true);
  }, []);

  const renderRow = useCallback(({ index, data, style }: any) => {
    const item = data[index] as FeedbackItem;

    const handleNavi = () => {
      const str = encodeURIComponent(JSON.stringify(item));
      void Taro.navigateTo({
        url: `/pages/feedback/detail/index?item=${str}`,
      });
    };

    function spliceText(text: string, maxLength = 45) {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    const getStatusClass = (status: string) => {
      if (status === '待处理') return 'pending';
      if (status === '处理中') return 'processing';
      if (status === '已完成') return 'resolved';
      return 'pending';
    };

    return (
      <View
        className="feedback-item"
        style={style}
        key={item.record_id}
        onTouchStart={handleNavi}
      >
        <View className="item-header">
          <View className="item-tags-row">
            <View className="item-tag">
              <Text className="item-tag-text">{item.fields.source || '未知来源'}</Text>
            </View>
            <View className="item-tag">
              <Text className="item-tag-text">{item.fields.type || '其他问题'}</Text>
            </View>
          </View>
          <Text className="item-time">{item.fields.submitTime}</Text>
        </View>

        <View className="item-content">
          <Text className="item-title">反馈内容</Text>
          <Text className="item-text">{spliceText(item.fields.content)}</Text>
        </View>

        <View className="item-footer">
          <View className={`item-status-bg ${getStatusClass(item.fields.status)}`}>
            <Text className={`item-status-text ${getStatusClass(item.fields.status)}`}>
              {item.fields.status}
            </Text>
          </View>
        </View>
      </View>
    );
  }, []);

  return (
    <View className="feedback-container">
      <NavigationBar title="反馈历史" isBackToPage />
      {feedbackHistory.length === 0 && isLoading ? (
        <Loading text="加载中..." />
      ) : (
        <>
          <VirtualList
            className="feedback-history-list"
            height="100%"
            width="100%"
            itemData={feedbackHistory}
            itemCount={feedbackHistory.length}
            item={renderRow}
            itemSize={175}
            onScroll={({ scrollDirection, scrollOffset }) => {
              if (
                scrollDirection === 'forward' &&
                scrollOffset > (feedbackHistory.length - 5) * 140
              ) {
                void fetchData(false);
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
