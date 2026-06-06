import type { CommentInfo } from '@/common/types/commentTypes';
import type { DataSource } from '@/store/types';

type CourseType = {
  MAJOR: 'CoursePropertyMajorCore';
  GENERAL_ELECT: 'CoursePropertyGeneralElective';
  GENERAL_CORE: 'CoursePropertyGeneralCore';
  GENERAL_REQUIRED: 'CoursePropertyGeneralRequired';
  MAJOR_ELECTIVE: 'CoursePropertyMajorElective';
  ANY: 'CoursePropertyAny';
};

export const COURSE_TYPE: CourseType = {
  MAJOR: 'CoursePropertyMajorCore',
  GENERAL_ELECT: 'CoursePropertyGeneralElective',
  GENERAL_CORE: 'CoursePropertyGeneralCore',
  GENERAL_REQUIRED: 'CoursePropertyGeneralRequired',
  MAJOR_ELECTIVE: 'CoursePropertyMajorElective',
  ANY: 'CoursePropertyAny',
};
/** 课程类别 */
export type classType =
  | CourseType['MAJOR']
  | CourseType['GENERAL_CORE']
  | CourseType['GENERAL_ELECT']
  | CourseType['GENERAL_REQUIRED']
  | CourseType['MAJOR_ELECTIVE']
  | CourseType['ANY'];

// store的type是不是放store更好？懒得改了
export type CourseDetailsType = {
  /** 课程名 */
  name: string;
  /** 教师 */
  teacher: string;
  /** 学院 */
  school: string;
};
export type PublisherDetailsType = {
  /** 昵称 */
  nickname: string;
  /** 头像 */
  avatar: string;
  /** id */
  id: number;
  /** 称号 */
  using_title?: string;
  /** 等级 */
  level?: number;
};
/* 对 comment 操作类型 */
export enum COMMENT_ACTIONS {
  LIKE = 1,
  COMMENT = 2,
  DISLIKE = 3,
  REMOVE_COMMENT = 4,
}
/** 评论 */
export interface CommentInfoSlice {
  /** 评论列表 */
  comments: Record<classType, CommentInfo[]>;
  /** 最近一次列表加载来源 */
  lastSource: DataSource | null;
  /** 当前最新ID */
  currentId: number;
  /** 页面大小 */
  pageSize: number;
  /** 当前课程类型 */
  classType: classType;
  /** 加载中 */
  loading: boolean;
  /** 更新评论 */
  loadMoreComments: () => Promise<void>;
  /** 刷新评论 */
  refreshComments: () => Promise<void>;
  /** 更新单条评论信息 */
  updateCommentInfo: (currentId: number, info: CommentInfo) => void;
  /** 广场列表中某条课评的评论数 +1（跨分类 tab 查找） */
  incrementEvaluationCommentCount: (
    evaluationId: number,
    delta?: number
  ) => CommentInfo | undefined;
  /** 更新评论 */
  updateComments: (currentId: number) => Promise<void>;
  /** 修改类型 */
  changeType: (type: classType) => void;
  /** 根据 id 获取 comment */
  getComment: (id: number) => CommentInfo | undefined;
  /** 点赞 */
  endorse: (id: number, action: COMMENT_ACTIONS) => Promise<CommentInfo | undefined>;
  /** 评论 */
  comment: (param: {
    id: number;
    biz: 'Evaluation' | 'Answer';
    parentId: number;
    rootId: number;
    action: COMMENT_ACTIONS;
    content: string;
  }) => Promise<CommentInfo | undefined>;
}
/** 评课人 */
export interface PublisherInfoSlice {
  /** 评课人信息 */
  publishers: Record<number, PublisherDetailsType>;
  /** 批量缓存评课人信息（从评论等接口内联 user 数据提取） */
  cachePublishers: (users: PublisherDetailsType[]) => void;
  /** 获取评课人：缓存 → API → 兜底默认值 */
  fetchPublishers: (publisherId: number) => Promise<PublisherDetailsType>;
  /** 批量确保评课人信息已缓存（cache-first） */
  ensurePublishers: (publisherIds: number[]) => Promise<void>;
}
/** 课程信息 */
export interface CourseDetailSlice {
  /** course信息 */
  courseDetail: Record<number, CourseDetailsType>;
  /** 批量缓存课程信息（从评价列表等接口内联数据提取） */
  cacheCourseDetails: (courses: Record<number, CourseDetailsType>) => void;
  /** 从服务端获取Course信息 */
  fetchCourseDetail: (courseId: number) => Promise<CourseDetailsType>;
  /** 获取Course信息 */
  getCourseDetail: (courseId: number) => Promise<CourseDetailsType | null>;
}

export type CourseInfoStore = CommentInfoSlice & PublisherInfoSlice & CourseDetailSlice;
