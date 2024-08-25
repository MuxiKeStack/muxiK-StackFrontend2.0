import { View } from '@tarojs/components';
import { memo, useState } from 'react';

import './index.scss';

interface MessageNotificationProps {}

interface MessageProps {
  username: string;
  eventType: boolean;
  description: string;
  comment: string;
}

type Notification = {
  username: string;
  eventType: boolean;
  description: string;
  comment: string;
};

const MessageNotification: React.FC<MessageNotificationProps> = memo(() => {
  const [notification, setNotification] = useState<Notification>({
    username: '昵称',
    eventType: true,
    description: '我正在回复你的评论',
    comment: '这里是原评论内容',
  });

  return (
    <View className="MessageNotification">
      <Message
        username={notification.username}
        eventType={notification.eventType}
        description={notification.description}
        comment={notification.comment}
      />
      <Message
        username={notification.username}
        eventType={false}
        description={notification.description}
        comment={notification.comment}
      />
    </View>
  );
});

const Message: React.FC<MessageProps> = memo(
  ({ username, eventType, description, comment }) => {
    return (
      <View className="messageNotification_message">
        <View className="messageNotification_photo"></View>
        <View className="messageNotification_detail">
          <View className="messageNotification_username">{username}</View>
          <View className="messageNotification_event">
            <View className="messageNotification_event_type">
              {eventType ? '回复：' : '赞了我'}
            </View>
            {eventType && (
              <View className="messageNotification_description">{description}</View>
            )}
          </View>
          <View className="messageNotification_comment">{comment}</View>
          {eventType && (
            <View className="messageNotification_reply">
              <View className="messageNotification_reply_text">回复TA:</View>
            </View>
          )}
        </View>
      </View>
    );
  }
);

export default MessageNotification;
