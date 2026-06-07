import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  FAQ_RECORD_NAMES,
  FAQ_TABLE_IDENTIFY,
  FEEDBACK_RECORD_NAMES,
  FEEDBACK_TABLE_IDENTIFY,
} from '@/common/constants/feedback';
import {
  createFeedbackRecord,
  feedbackFAQ,
  getFAQ,
  getFeedbackImg,
  queryUserFeedbackSheet,
  uploadFileToFeishuBitable,
} from '@/common/request/api/feedback';
import { createTaroJSONStorage } from '@/common/utils';
import type { FeedbackItem, SheetItem } from '@/subpackages/feedback/type';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

const FAQ_CACHE_KEY = 'feedback-faq-cache';

interface FAQRecord {
  record_id: string;
  record: {
    问题名称?: string;
    问题描述?: string;
    解决方案?: string;
  };
  is_resolved?: '已解决' | '未解决' | '未选择';
}

function transformFAQ(records: FAQRecord[]): SheetItem[] {
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

interface DetailedFeedbackRecord {
  record_id: string;
  record: Record<string, unknown>;
}

function transformHistory(records: DetailedFeedbackRecord[]): FeedbackItem[] {
  return records.map((item) => ({
    record_id: item.record_id,
    fields: {
      content: (item.record['反馈内容'] as string) || '暂无内容',
      screenshots: Array.isArray(item.record['截图'])
        ? (item.record['截图'] as string[]).map((token) => ({ file_token: token }))
        : [],
      submitTime: (item.record['提交时间'] as string | number) || '未知时间',
      userId: (item.record['用户ID'] as string) || '',
      contact: (item.record['联系方式（QQ/邮箱）'] as string) || '',
      source: (item.record['问题来源'] as string) || '未知来源',
      status: (item.record['进度'] as string) || '未知状态',
      type: (item.record['问题类型'] as string) || '未知类型',
      reply: (item.record['回复内容'] as string) || '暂无回复',
    },
  }));
}

interface FeedbackStore {
  faqList: SheetItem[];
  faqSource: DataSource | null;
  historyList: FeedbackItem[];
  historySource: DataSource | null;
  historyPageToken: string;
  historyHasMore: boolean;

  loadFaq: (studentId: string) => Promise<SheetItem[]>;
  updateFaqStatus: (
    recordId: string,
    resolved: boolean,
    studentId: string
  ) => Promise<void>;
  loadHistory: (studentId: string, append?: boolean) => Promise<FeedbackItem[]>;
  submitFeedback: (payload: Parameters<typeof createFeedbackRecord>[0]) => Promise<void>;
  uploadImage: (imagePath: string, fileName: string) => Promise<string | null>;
  loadFeedbackImages: (fileTokens: string[]) => Promise<string[]>;
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      faqList: [],
      faqSource: null,
      historyList: [],
      historySource: null,
      historyPageToken: '',
      historyHasMore: false,

      async loadFaq(studentId) {
        const result = await loadData({
          strategy: 'network-first',
          getCache: () => {
            const list = get().faqList;
            return list.length ? list : null;
          },
          fetch: async () => {
            const data = (await getFAQ({
              student_id: studentId,
              record_names: FAQ_RECORD_NAMES,
              table_identify: FAQ_TABLE_IDENTIFY,
            })) as { records: FAQRecord[] };
            return transformFAQ(data.records || []);
          },
          setCache: (list) => set({ faqList: list }),
        });
        set({ faqSource: result.source });
        return result.data;
      },

      async updateFaqStatus(recordId, resolved, studentId) {
        await feedbackFAQ({
          table_identify: FAQ_TABLE_IDENTIFY,
          record_id: recordId,
          is_resolved: resolved,
          resolved_field_name: '已解决',
          unresolved_field_name: '未解决',
          user_id: studentId,
        });
      },

      async loadHistory(studentId, append = false) {
        const pageToken = append ? get().historyPageToken : '';
        const result = await loadData({
          strategy: 'network-first',
          getCache: () => {
            const list = get().historyList;
            return !append && list.length ? list : null;
          },
          fetch: async () => {
            const data = (await queryUserFeedbackSheet({
              page_token: pageToken,
              record_names: FEEDBACK_RECORD_NAMES,
              key_field: '学号',
              key_value: studentId,
              table_identify: FEEDBACK_TABLE_IDENTIFY,
            })) as {
              records: DetailedFeedbackRecord[];
              has_more: boolean;
              page_token?: string;
            };
            const list = transformHistory(data.records || []);
            set({
              historyHasMore: data.has_more,
              historyPageToken: data.page_token || '',
            });
            return append ? [...get().historyList, ...list] : list;
          },
          setCache: (list) => set({ historyList: list }),
        });
        set({ historySource: result.source, historyList: result.data });
        return result.data;
      },

      async submitFeedback(payload) {
        await createFeedbackRecord(payload);
      },

      async uploadImage(imagePath, fileName) {
        try {
          const uploadResult = await uploadFileToFeishuBitable(imagePath, fileName);
          if (uploadResult?.data?.file_token) {
            return uploadResult.data.file_token;
          }
          return null;
        } catch {
          return null;
        }
      },

      async loadFeedbackImages(fileTokens) {
        if (!fileTokens.length) return [];
        try {
          const data = (await getFeedbackImg({ file_tokens: fileTokens })) as {
            files?: Array<{ file_token?: string; tmp_download_url?: string }>;
          };
          if (!Array.isArray(data?.files)) return fileTokens.map(() => '');
          const map: Record<string, string> = {};
          data.files.forEach((it) => {
            if (it?.file_token && it?.tmp_download_url) {
              map[it.file_token] = it.tmp_download_url;
            }
          });
          return fileTokens.map((t) => map[t] || '');
        } catch {
          return fileTokens.map(() => '');
        }
      },
    }),
    {
      name: FAQ_CACHE_KEY,
      storage: createTaroJSONStorage(),
      partialize: (state) => ({
        faqList: state.faqList,
        historyList: state.historyList,
        historyPageToken: state.historyPageToken,
        historyHasMore: state.historyHasMore,
      }),
    }
  )
);
