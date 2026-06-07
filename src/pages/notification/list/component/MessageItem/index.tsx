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
      const {
        title,
        teacher,
        reply,
        originalComment,
        userName,
        avatar,
        ctime,
        timeStamp,
        biz,
        bizId,
      } = message;
      return (
        <CommentMessageItem
          key={key}
          type={type}
          title={title}
          teacher={teacher}
          reply={reply}
          originalComment={originalComment}
          userName={userName}
          avatar={avatar}
          ctime={ctime}
          timeStamp={timeStamp}
          biz={biz}
          bizId={bizId}
        />
      );
    }

    case 'support': {
      const { userName, avatar, originalComment, ctime, timeStamp, biz, bizId } = message;
      return (
        <SupportMessageItem
          key={key}
          type={type}
          userName={userName}
          avatar={avatar}
          timeStamp={formatDate(ctime) || timeStamp}
          originalComment={originalComment}
          biz={biz}
          bizId={bizId}
        />
      );
    }

    default:
      console.warn(`未知的消息类型: ${type}`);
      return null;
  }
};
