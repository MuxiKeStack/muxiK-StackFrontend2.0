import { Image, Text, View } from '@tarojs/components';
import { memo } from 'react';

import type { Message as MessageType } from './types';

type MessageProps = MessageType;

const Message: React.FC<MessageProps> = memo(
  ({ username, avatar, eventType, description, comment, timestamp }) => (
    <View className="flex w-full gap-4">
      <View className="flex aspect-square h-12 w-12 items-center justify-center rounded-full border-4 border-gray-300 bg-[#f9f9f2]">
        <Image src={avatar} className="h-full w-full rounded-full" />
      </View>
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

export default Message;
