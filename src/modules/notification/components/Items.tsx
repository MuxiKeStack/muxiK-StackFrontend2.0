import { Text, View } from '@tarojs/components';
import { memo } from 'react';

import { uniqueKey } from '@/common/utils';

import Message from './Message';
import type { Message as MessageType } from './types';

interface OfficialProps {
  title: string;
  description?: string;
}

const ImageOfficial: React.FC<OfficialProps> = memo(({ title, description }) => (
  <View className="flex h-[30vh] w-full flex-col overflow-hidden rounded-lg bg-[#f9f9f2] shadow-lg">
    <View className="flex-[4] border-b-2 border-[#ffd777]"></View>
    <View className="flex flex-1 flex-col gap-1 px-4 py-2">
      <Text className="text-md">{title}</Text>
      <Text className="text-sm text-[#565552]">{description}</Text>
    </View>
  </View>
));

const AlertOfficial: React.FC<OfficialProps> = memo(({ title }) => (
  <View className="flex w-full items-center rounded-l-full rounded-r-full bg-[#f9f9f2] px-4 py-2 text-sm shadow-lg">
    <Text className="text-sm text-[#f18900]">{title}</Text>
  </View>
));

export const MessageItem = memo(
  ({ id, index, data }: { id: string; index: number; data: MessageType[] }) => {
    const message = data[index];
    return (
      <Message
        key={uniqueKey.nextKey()}
        username={message.username}
        avatar={message.avatar}
        eventType={message.eventType}
        description={message.description}
        comment={message.comment}
        timestamp={message.timestamp}
      />
    );
  }
);

export const OfficialItem = memo(
  ({ id, index, data }: { id: string; index: number; data: MessageType[] }) => {
    const message = data[index];
    return (
      <>
        <View className="flex w-full flex-col items-center gap-4">
          <AlertOfficial title="此版块暫未开放，未来将会有更多精彩内容" />
        </View>
        {/* <View className="flex w-full flex-col items-center gap-4">
          <View className="text-xs text-gray-500">07:25</View>
          <ImageOfficial title="评课活动要开始了" description="摘要" />
        </View>
        <View className="flex w-full flex-col items-center gap-4">
          <View className="text-xs text-gray-500">07:25</View>
          <AlertOfficial title="您在高等数学下方的评论违规，请注意您的发言" />
        </View> */}
      </>
    );
  }
);
