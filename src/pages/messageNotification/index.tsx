import { View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import './index.scss';

type MessageNotificationProps = object;
type MessageProps = {
  username: string;
  eventType: boolean;
  description: string;
  comment: string;
};

const MessageNotification: React.FC<MessageNotificationProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const [notificationEventType, setNotificationEventType] = useState(true);
  const [notificationUsername, setNotificationUsername] = useState('昵称');
  const [notificationDescription, setNotificationDescription] =
    useState('我正在回复你的评论');
  const [notificationComment, setNotificationComment] = useState('这里是原评论内容');

  return (
    <View className="MessageNotification">
      <Message
        username={notificationUsername}
        eventType={notificationEventType}
        description={notificationDescription}
        comment={notificationComment}
      />
      <Message
        username={notificationUsername}
        eventType={false}
        description={notificationDescription}
        comment={notificationComment}
      />
    </View>
  );
};

const Message: React.FC<MessageProps> = ({
  username,
  eventType,
  description,
  comment,
}) => {
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
};

export default MessageNotification;
