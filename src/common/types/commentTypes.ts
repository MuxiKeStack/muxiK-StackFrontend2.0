export interface Comment {
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
  replies?: Comment[]; // 存储二级评论
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

export interface User {
  id: number;
  avatar: string;
  nickname: string;
}

/** 评论详情 */
export interface CommentInfo {
  /**
   * 考核方式，支持多选
   */
  assessments?: string[];
  content?: string;
  course_id?: number;
  ctime?: number;
  /**
   * 课程特点，支持多选
   */
  features?: string[];
  id?: number;
  publisher_id?: number;
  /**
   * 1支持，0无，-1反对
   */
  stance?: number;
  star_rating?: number;
  status?: string;
  total_comment_count?: number;
  total_oppose_count?: number;
  total_support_count?: number;
  utime?: number;
}

export interface Course {
  id: number;
  name: string;
  teacher: string;
  school: string;
  type: string;
  credit: number;
  composite_score: number;
  rater_count: number;
  assessments: Record<string, never>; // 使用 Record 类型来表示对象，具体类型根据实际结构定义
  features: Record<string, never>;
  is_collected: boolean;
  is_subscribed: boolean;
}
