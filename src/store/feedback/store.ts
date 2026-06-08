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
import { loadData } from '@/store/loadUtils';
import type { DataSource } from '@/store/types';
import type { FeedbackItem, SheetItem } from '@/subpackages/feedback/type';

import type { DetailedFeedbackRecord, FAQRecord } from './transforms';
import { transformFAQ, transformHistory } from './transforms';

const FAQ_CACHE_KEY = 'feedback-faq-cache';

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
