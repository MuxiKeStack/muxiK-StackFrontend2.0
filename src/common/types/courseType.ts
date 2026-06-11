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

export type CourseInfoStore = CourseDetailSlice;
