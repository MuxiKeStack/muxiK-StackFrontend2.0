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
  teacher: string;
  composite_score: number;
  courseType: string;
}
