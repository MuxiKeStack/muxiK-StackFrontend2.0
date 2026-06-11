import { formatDate } from '@/common/utils';
import type { FeedbackItem, SheetItem } from '@/subpackages/feedback/type';

export function formatSubmitTime(timestamp: string | number | null | undefined): string {
  if (timestamp === null || timestamp === undefined || timestamp === '') {
    return '未知时间';
  }

  const normalized =
    typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return '未知时间';
  }

  return formatDate(date, 'yyyy-MM-dd');
}

interface FAQRecord {
  record_id: string;
  record: {
    问题名称?: string;
    问题描述?: string;
    解决方案?: string;
  };
  is_resolved?: '已解决' | '未解决' | '未选择';
}

interface DetailedFeedbackRecord {
  record_id: string;
  record: Record<string, unknown>;
}

export function transformFAQ(records: FAQRecord[]): SheetItem[] {
  return records.map((item) => ({
    record_id: item.record_id,
    fields: {
      title: item.record['问题名称'] || '未命名问题',
      description: item.record['问题描述'] || '暂无',
      solution: item.record['解决方案'] || '暂无',
      resolvedStatus:
        item.is_resolved === '已解决'
          ? 'resolved'
          : item.is_resolved === '未解决'
            ? 'unresolved'
            : 'notSelected',
    },
  }));
}

export function transformHistory(records: DetailedFeedbackRecord[]): FeedbackItem[] {
  return records.map((item) => ({
    record_id: item.record_id,
    fields: {
      content: (item.record['反馈内容'] as string) || '暂无内容',
      screenshots: Array.isArray(item.record['截图'])
        ? (item.record['截图'] as string[]).map((token) => ({ file_token: token }))
        : [],
      submitTime: formatSubmitTime(item.record['提交时间'] as string | number),
      userId: (item.record['用户ID'] as string) || '',
      contact: (item.record['联系方式（QQ/邮箱）'] as string) || '',
      source: (item.record['问题来源'] as string) || '未知来源',
      status: (item.record['进度'] as string) || '未知状态',
      type: (item.record['问题类型'] as string) || '未知类型',
      reply: (item.record['回复内容'] as string) || '暂无回复',
    },
  }));
}

export type { DetailedFeedbackRecord, FAQRecord };
