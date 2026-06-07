export type CommentType = {
  id: number;
  commentator_id: number;
  biz: string;
  biz_id: number;
  content: string;
  root_comment_id: number;
  parent_comment_id: number;
  reply_to_uid: number;
  utime: number;
  ctime: number;
  user?: User; // 存储用户信息
  publisher?: User; // 后端可能用 publisher 内嵌返回用户信息
  replies?: CommentType[]; // 存储二级评论
  reply_count?: number; // 回复数
  has_replies?: boolean; // 是否有回复
  total_comment_count?: number; // 含回复的评论总数
  reply_to_user?: User; // @ 的目标用户
};

// 讨论区通用条目：评课评论(CommentType)与问答回答共用同一套 UI，
// 这里取两者结构的交集做超类型，除 id/content/ctime 外均可选
export interface DiscussionComment {
  id: number;
  content: string;
  ctime: number;
  utime?: number;
  user?: User;
  publisher?: User;
  commentator_id?: number;
  root_comment_id?: number;
  parent_comment_id?: number;
  reply_to_uid?: number;
  reply_to_user?: User;
  replies?: DiscussionComment[];
  reply_count?: number;
  has_replies?: boolean;
  total_comment_count?: number;
}

// 定义评论详情的类型
export type CommentInfoType = {
  nickname: string;
  avatar: string;
  id: number;
  content: string;
  class_name: string;
  teacher: string;
  star_rating: number;
  total_support_count: number;
  total_oppose_count: number;
  total_comment_count: number;
  utime: number;
  ctime: number;
};

export type User = {
  id: number;
  avatar: string;
  nickname: string;
  using_title?: string;
  level?: number;
};

/** 发布者信息（后端内嵌返回） */
export interface PublisherInfo {
  id: number;
  avatar: string;
  nickname: string;
  using_title?: string;
  level?: number;
}

/** 评论详情 */
export interface CommentInfo {
  /**
   * 考核方式，支持多选
   */
  assessments?: string[];
  content?: string;
  course_id?: number;
  /** 课程名（后端内嵌返回，替代 courseDetailSlice 查询） */
  course_name?: string;
  ctime?: number;
  /**
   * 课程特点，支持多选
   */
  features?: string[];
  id?: number;
  /** 发布者信息（后端内嵌返回，替代 publisherInfoSlice 查询） */
  publisher?: PublisherInfo;
  publisher_id?: number;
  /**
   * 1支持，0无，-1反对
   */
  stance?: number;
  star_rating?: number;
  status?: string;
  /** 教师名（后端内嵌返回，替代 courseDetailSlice 查询） */
  teacher_name?: string;
  total_comment_count?: number;
  total_oppose_count?: number;
  total_support_count?: number;
  utime?: number;
  /** 是否匿名 */
  is_anonymous?: boolean;
}

export type Course = {
  id: number;
  name: string;
  teacher: string;
  school: string;
  type: string;
  credit: number;
  composite_score: number;
  rater_count: number;
  assessments: Record<string, never>;
  features: Record<string, never>;
  is_collected: boolean;
  is_subscribed: boolean;
};
