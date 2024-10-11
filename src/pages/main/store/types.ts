type CourseType = {
  MAJOR: 'CoursePropertyMajorCore';
  GENERAL_ELECT: 'CoursePropertyGeneralElective';
  GENERAL_CORE: 'CoursePropertyGeneralCore';
  GENERAL_REQUIRED: 'CoursePropertyGeneralRequired';
};

export const COURSE_TYPE: CourseType = {
  MAJOR: 'CoursePropertyMajorCore',
  GENERAL_ELECT: 'CoursePropertyGeneralElective',
  GENERAL_CORE: 'CoursePropertyGeneralCore',
  GENERAL_REQUIRED: 'CoursePropertyGeneralRequired',
};
/** 课程类别 */
export type classType =
  | CourseType['MAJOR']
  | CourseType['GENERAL_CORE']
  | CourseType['GENERAL_ELECT']
  | CourseType['GENERAL_REQUIRED'];

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
};
/* 对 comment 操作类型 */
export enum COMMENT_ACTIONS {
  LIKE = 1,
  COMMENT = 2,
}
/** 评论 */
export interface CommentInfoSlice {
  /** 评论列表 */
  comments: Record<classType, CommentInfo[]>;
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
  refershComments: () => Promise<void>;
  /** 更新单条评论信息 */
  updateCommentInfo: (currentId: number, action: COMMENT_ACTIONS) => void;
  /** 更新评论 */
  updateComments: (currentId: number) => Promise<void>;
  /** 修改类型 */
  changeType: (type: classType) => void;
  /** 根据 id 获取 comment */
  getComment: (id: number) => CommentInfo | undefined;
}
/** 评课人 */
export interface PublisherInfoSlice {
  /** 评课人信息 */
  publishers: Record<number, PublisherDetailsType>;
  /** 从服务端拉去评课人 */
  fetchPublishers: (publisherId: number) => Promise<PublisherDetailsType>;
  /** 获取评课人 */
  getPublishers: (publisherId: number) => Promise<PublisherDetailsType>;
}
/** 课程信息 */
export interface CourseDetailSlice {
  /** course信息 */
  courseDetail: Record<number, CourseDetailsType>;
  /** 从服务端获取Course信息 */
  fetchCouseDetail: (courseId: number) => Promise<CourseDetailsType>;
  /** 获取Course信息 */
  getCourseDetail: (courseId: number) => Promise<CourseDetailsType>;
}

export type CourseInfoStore = CommentInfoSlice & PublisherInfoSlice & CourseDetailSlice;
