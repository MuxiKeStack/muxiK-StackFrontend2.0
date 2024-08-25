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
    <View className="flex h-[95vh] w-full flex-col items-center gap-4 overflow-y-scroll pt-2">
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
      <View className="flex w-[90%] gap-4">
        <View className="h-[8vh] w-[8vh] rounded-full border bg-[#f9f9f2]"></View>
        <View className="flex flex-col gap-2">
          <View className="text-sm font-bold">{username}</View>
          <View className="flex">
            <View className="text-sm text-gray-300">
              {eventType ? '回复：' : '赞了我'}
            </View>
            {eventType && <View className="text-sm text-gray-500">{description}</View>}
          </View>
          <View className="border-l-4 border-gray-300 pl-2 text-sm text-gray-500">
            {comment}
          </View>
          {eventType && (
            <View className="flex h-6 w-full items-center rounded-lg bg-[#f9f9f2] px-2">
              <View className="text-xs text-gray-300">回复TA:</View>
            </View>
          )}
        </View>
      </View>
    );
  }
);

export default MessageNotification;
