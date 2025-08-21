import { Image, Text, View } from '@tarojs/components';
import { memo } from 'react';

import type { Message as MessageType } from './types';

type MessageProps = MessageType;

const Message: React.FC<MessageProps> = memo(
  ({ username, avatar, eventType, description, comment, timestamp }) => (
    <View
      className="mb-4 ml-4 flex gap-4 rounded-xl bg-[#FFFAEC] p-4"
      style={{ width: 'calc(100vw - 64px)' }}
    >
      <View className="flex aspect-square h-12 w-12 items-center justify-center rounded-full border-4 border-gray-300 bg-[#f9f9f2]">
        <Image src={avatar} className="h-full w-full rounded-full" />
      </View>
      <View className="flex w-full flex-col gap-2">
        <View className="flex w-full justify-between">
          <Text className="text-sm font-bold">{username}</Text>
          <Text className="text-xs text-[#646464]">{timestamp}</Text>
        </View>
        <View className="flex">
          <View className="text-sm text-[#3D3D3D]">
            {eventType ? '回复：' : '赞了我'}
          </View>
          {eventType && <View className="text-sm text-[#3D3D3D]">{description}</View>}
        </View>
        <View className="text-[#3D3D3D flex gap-2 rounded-sm border-l-4 border-gray-300 text-sm">
          <View className="h-full w-2 bg-[#FFEFB7]"></View>
          {comment}
        </View>
        {eventType && (
          <View className="flex h-8 w-[90%] items-center rounded-md bg-[#FFEFB7] px-2">
            <View className="text-xs text-[#3D3D3D]">回复TA:</View>
          </View>
        )}
      </View>
    </View>
  )
);

export default Message;
