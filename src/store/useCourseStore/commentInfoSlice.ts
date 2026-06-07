import { StateCreator } from 'zustand';

import { publishComment } from '@/common/request/api/comments';
import { endorseEvaluation, getEvaluationList } from '@/common/request/api/evaluations';
import type { CommentInfo, CommentType } from '@/common/types/commentTypes';
import {
  COMMENT_ACTIONS,
  CommentInfoSlice,
  COURSE_TYPE,
  CourseInfoStore,
} from '@/common/types/courseType';

const MAX_COMMENTS_PER_TYPE = 200;

export const CreateCommentInfo: StateCreator<
  CourseInfoStore,
  [],
  [],
  CommentInfoSlice
> = (set, get) => ({
  comments: {
    CoursePropertyGeneralCore: [],
    CoursePropertyGeneralElective: [],
    CoursePropertyAny: [],
    CoursePropertyMajorCore: [],
    CoursePropertyGeneralRequired: [],
    CoursePropertyMajorElective: [],
  },
  currentId: 0,
  pageSize: 6,
  loading: true,
  classType: COURSE_TYPE.ANY,
  lastSource: null,
  async refreshComments() {
    await get().updateComments(0);
  },
  getComment(id) {
    if (id === 0) return undefined;
    const { classType, comments } = get();
    return comments[classType].find((item) => item.id === id);
  },
  async loadMoreComments() {
    const { currentId, updateComments } = get();
    return await updateComments(currentId);
  },
  async endorse(id, action) {
    // store 只负责请求与本地计数更新，loading/toast 等 UI 反馈交给调用方组件
    const shouldSupport = action === COMMENT_ACTIONS.LIKE;
    await endorseEvaluation(id, { stance: shouldSupport ? 1 : 0 });
    const localInfo = get().getComment(id);
    if (localInfo) {
      const delta = shouldSupport ? 1 : -1;
      const updated: CommentInfo = {
        ...localInfo,
        total_support_count: (localInfo.total_support_count || 0) + delta,
      };
      get().updateCommentInfo(id, updated);
      return updated;
    }
    return localInfo;
  },
  async comment({ id: biz_id, biz, parentId: parent_id, rootId: root_id, content }) {
    // store 只负责请求与本地计数更新，loading/toast 交给调用方组件
    const publishRes = await publishComment({
      biz,
      biz_id,
      content,
      parent_id,
      root_id,
    });
    if (parent_id === 0) {
      const localInfo = get().getComment(biz_id);
      if (localInfo) {
        const updated: CommentInfo = {
          ...localInfo,
          total_comment_count: (localInfo.total_comment_count || 0) + 1,
        };
        get().updateCommentInfo(biz_id, updated);
      }
    }
    return publishRes as CommentType;
  },
  updateCommentInfo(currentId: number, info: CommentInfo) {
    const { comments, classType } = get();
    const currentCourses = [...comments[classType]];
    const idx = currentCourses.findIndex((course) => course.id === currentId);
    if (idx !== -1) currentCourses[idx] = info;
    set({ comments: { ...get().comments, [classType]: currentCourses } });
  },
  incrementEvaluationCommentCount(evaluationId, delta = 1) {
    if (!evaluationId) return undefined;
    const targetId = Number(evaluationId);
    let patched: CommentInfo | undefined;
    set((state) => {
      const nextComments = { ...state.comments };
      for (const key of Object.keys(nextComments) as Array<keyof typeof nextComments>) {
        const list = nextComments[key];
        const idx = list.findIndex((c) => Number(c.id) === targetId);
        if (idx === -1) continue;
        const updated = [...list];
        const before = updated[idx].total_comment_count || 0;
        patched = {
          ...updated[idx],
          total_comment_count: before + delta,
        };
        updated[idx] = patched;
        nextComments[key] = updated;
        return { comments: nextComments };
      }
      return state;
    });
    return patched;
  },
  async updateComments(currentId: number) {
    const { pageSize, classType, comments } = get();
    const existingList = comments[classType] || [];
    set({ loading: true });

    try {
      return await getEvaluationList({
        cur_evaluation_id: currentId,
        limit: pageSize,
        property: classType,
      }).then(async (res: CommentInfo[]) => {
        const resDataList = Array.isArray(res)
          ? [...res].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
          : [];
        const prevId = resDataList.at(-1)?.id;

        // 无更多数据：返回 false 让调用方决定是否提示「没有更多了」
        if (!resDataList.length) {
          set({ loading: false });
          return false;
        }

        // 从内嵌数据提取发布者信息，灌入缓存
        const publishers: import('@/common/types/courseType').PublisherDetailsType[] = [];
        resDataList.forEach((c) => {
          if (c.publisher?.id) {
            publishers.push({
              id: c.publisher.id,
              avatar: c.publisher.avatar || '',
              nickname: c.publisher.nickname || '匿名用户',
              using_title: c.publisher.using_title,
              level: c.publisher.level,
            });
          }
        });
        if (publishers.length) get().cachePublishers(publishers);

        // 从内嵌数据提取课程信息，灌入缓存
        const courseMap: Record<
          number,
          import('@/common/types/courseType').CourseDetailsType
        > = {};
        resDataList.forEach((c) => {
          if (c.course_id && c.course_name) {
            courseMap[c.course_id] = {
              name: c.course_name,
              teacher: c.teacher_name || '',
              school: '',
            };
          }
        });
        if (Object.keys(courseMap).length) get().cacheCourseDetails(courseMap);

        set((state) => {
          const merged = currentId
            ? [...existingList, ...resDataList].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
            : resDataList;
          const trimmed =
            merged.length > MAX_COMMENTS_PER_TYPE
              ? merged.slice(0, MAX_COMMENTS_PER_TYPE)
              : merged;
          return {
            comments: { ...state.comments, [classType]: trimmed },
            currentId: prevId,
            loading: false,
            lastSource: 'network',
          };
        });
        return true;
      });
    } catch (e) {
      console.error('[commentInfoSlice] 加载评论失败:', e);
      set({ loading: false });
      throw e;
    }
  },
  changeType: (classType) => set({ classType }),
});
