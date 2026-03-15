import { formatDate, formatIMTime } from '@/common/utils';
import { CommentMessageItem } from './CommentItem';
import { OfficialMessageItem } from './OfficialItem';
import { SupportMessageItem } from './SupportItem';

export const renderMessageItem = ({ data, index }: { index: number; data }) => {
  const message = data[index];

  const { type } = message;
  const key = `${type}-${index}`;

  switch (type) {
    case 'official': {
      const { title, description, images, ctime, timeStamp } = message;
      return (
        <OfficialMessageItem
          key={key}
          type={type}
          title={title}
          description={description}
          timeStamp={formatIMTime(ctime) || timeStamp}
          images={images}
        />
      );
    }

    case 'comment': {
      const { title, teacher, composite_score, courseType, reply } = message;
      return (
        <CommentMessageItem
          key={key}
          type={type}
          title={title}
          teacher={teacher}
          composite_score={composite_score}
          courseType={courseType}
          reply={reply}
        />
      );
    }

    case 'support': {
      const { userName, avatar, originalComment, ctime, timeStamp } = message;
      return (
        <SupportMessageItem
          key={key}
          type={type}
          userName={userName}
          avatar={avatar}
          timeStamp={formatDate(ctime) || timeStamp}
          originalComment={originalComment}
        />
      );
    }

    default:
      console.warn(`未知的消息类型: ${type}`);
      return null;
  }
};
