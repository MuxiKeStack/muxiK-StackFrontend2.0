import { Text, View } from '@tarojs/components';
import { memo, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

// eslint-disable-next-line import/first
import uniqueKeyUtil from '@/common/utils/keyGen';

type Message = {
  username: string;
  eventType: boolean;
  description: string;
  comment: string;
  timestamp: string;
};

interface NotificationProps {}

interface MessageProps extends Message {}

interface TabBarProps {
  tab: string;
  setTab: (tab: string) => void;
}

const Tabs: { name: string; icon: string }[] = [
  {
    name: '提问',
    icon: 'clock',
  },
  {
    name: '点赞',
    icon: 'clock',
  },
  {
    name: '官方',
    icon: 'clock',
  },
];

const TabBar: React.FC<TabBarProps> = memo(({ tab, setTab }) => (
  <View className="mb-2 flex w-full justify-evenly">
    {Tabs.map((item) => (
      <View key={uniqueKeyUtil.nextKey()} className="flex flex-col items-center gap-2">
        <View className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f9f9f2] shadow-lg">
          <AtIcon
            value={item.icon}
            size="35"
            color={tab === item.name ? '#f18900' : '#FFD777'}
            onClick={() => {
              setTab(item.name);
            }}
          ></AtIcon>
        </View>
        <Text>{item.name}</Text>
      </View>
    ))}
  </View>
));

const Message: React.FC<MessageProps> = memo(
  ({ username, eventType, description, comment, timestamp }) => (
    <View className="flex w-full gap-4">
      <View className="h-14 w-16 rounded-full border bg-[#f9f9f2]"></View>
      <View className="flex w-full flex-col gap-2">
        <View className="flex w-full justify-between">
          <Text className="text-sm font-bold">{username}</Text>
          <Text className="text-xs text-gray-200">{timestamp}</Text>
        </View>
        <View className="flex">
          <View className="text-sm text-gray-300">{eventType ? '回复：' : '赞了我'}</View>
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
  )
);

const Notification: React.FC<NotificationProps> = memo(() => {
  const [tab, setTab] = useState<string>('提问');
  const [notification, setNotification] = useState<Message>({
    username: '昵称',
    eventType: true,
    description: '我正在回复你的评论',
    comment: '这里是原评论内容',
    timestamp: '2023年1月1日',
  });

  return (
    <View className="flex h-[95vh] w-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-2">
      <TabBar tab={tab} setTab={setTab} />
      {tab === '提问' && (
        <Message
          username={notification.username}
          eventType={notification.eventType}
          description={notification.description}
          comment={notification.comment}
          timestamp={notification.timestamp}
        />
      )}
      {tab === '点赞' && (
        <Message
          username={notification.username}
          eventType={false}
          description={notification.description}
          comment={notification.comment}
          timestamp={notification.timestamp}
        />
      )}
    </View>
  );
});

export default Notification;
