// types.ts
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
