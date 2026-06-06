export type MessageType = 'comment' | 'support' | 'official';

export type MessageItemProps = {
  type: MessageType;
  title?: string;
  userName?: string;
  avatar?: string;
  images?: string[];
  description?: string;
  timeStamp?: string;
  reply?: string;
  originalComment?: string;
  ctime?: number;
  teacher?: string;
  // 业务类型: Evaluation / Answer
  biz?: string;
  // 业务id（课评id或回答id
  bizId?: string;
  // 评论id（Comment 类型才有，用于定位
  commentId?: string;
};

export interface OfficialMessageProps extends MessageItemProps {
  type: 'official';
}

export interface SupportMessageProps extends MessageItemProps {
  type: 'support';
}

export interface CommentMessageProps extends MessageItemProps {
  type: 'comment';
  title: string;
}
