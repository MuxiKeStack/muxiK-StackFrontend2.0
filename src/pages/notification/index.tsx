/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/first */
import { Image, Text, View } from '@tarojs/components';
import VirtualList from '@tarojs/components-advanced/dist/components/virtual-list';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { getUserInfo } from '@/common/assets/userService';
import { get } from '@/common/utils/fetch';
import uniqueKeyUtil from '@/common/utils/keyGen';
import { formatIsoDate } from '@/common/utils/timeFormat';

type Message = {
  username: string;
  avatar: string;
  eventType: boolean;
  description?: string;
  comment: string;
  timestamp: string;
};

interface OfficialProps {
  title: string;
  description?: string;
}

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

const MessageItem = memo(
  ({ id, index, data }: { id: string; index: number; data: Message[] }) => {
    const message = data[index];
    return (
      <Message
        key={uniqueKeyUtil.nextKey()}
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

const ImageOfficial: React.FC<OfficialProps> = memo(({ title, description }) => (
  <View className="flex h-[30vh] w-full flex-col overflow-hidden rounded-lg bg-[#f9f9f2]">
    <View className="flex-[4] border-b-2 border-[#ffd777]"></View>
    <View className="flex flex-1 flex-col gap-1 px-4 py-2">
      <Text className="text-md">{title}</Text>
      <Text className="text-sm text-[#565552]">{description}</Text>
    </View>
  </View>
));

const AlertOfficial: React.FC<OfficialProps> = memo(({ title }) => (
  <View className="flex w-full items-center rounded-l-full rounded-r-full bg-[#f9f9f2] p-4 text-sm">
    <Text className="text-sm text-[#f18900]">{title}</Text>
  </View>
));

const Notification: React.FC = memo(() => {
  const [tab, setTab] = useState<string>('提问');
  const [ctime, setCtime] = useState<number>(0);
  const [commentMessage, setCommentMessage] = useState<Message[]>([]);
  const [supportMessage, setSupportMessage] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const res = await get(
        `/feed/events_list?last_time=${ctime}&direction=${'After'}&limit=${10}`
      );

      const personalItems = async (items, itemType) => {
        return Promise.all(
          items.map(async (item) => {
            let detailRes, parentRes, user;
            if (itemType === 'Comment') {
              detailRes = await get(`/comments/${item.Ext.commentId}/detail`);
              parentRes = await get(
                `/comments/${detailRes.data.parent_comment_id}/detail`
              );
              user = await getUserInfo(item.Ext.commentator);
            } else if (itemType === 'Support') {
              detailRes =
                item.Ext.biz === 'Evaluation'
                  ? await get(`/evaluations/${item.Ext.bizId}/detail`)
                  : await get(`/answers/${item.Ext.bizId}/detail`);
              user = await getUserInfo(item.Ext.supporter);
            }

            // console.log(
            //   JSON.stringify({
            //     username: user.nickname,
            //     avatar: user.avatar,
            //     eventType: itemType === 'Comment',
            //     description: itemType === 'Comment' && detailRes.data.content,
            //     comment:
            //       itemType === 'Comment'
            //         ? parentRes.data.content
            //         : detailRes.data.content,
            //     timestamp: formatIsoDate(item.Ctime as string),
            //   })
            // );

            return {
              username: user.nickname,
              avatar: user.avatar,
              eventType: itemType === 'Comment',
              description: itemType === 'Comment' && detailRes.data.content,
              comment:
                itemType === 'Comment' ? parentRes.data.content : detailRes.data.content,
              timestamp: formatIsoDate(item.Ctime as string),
            };
          })
        );
      };

      if (tab === '提问') {
        const comments = res.data
          .filter((item) => item.type === 'Comment')
          .map((item) => JSON.parse(item.content));
        setCommentMessage([
          ...commentMessage,
          ...(await personalItems(comments, 'Comment')),
        ]);
      } else if (tab === '点赞') {
        const supports = res.data
          .filter((item) => item.type === 'Support')
          .map((item) => JSON.parse(item.content));
        setSupportMessage([
          ...supportMessage,
          ...(await personalItems(supports, 'Support')),
        ]);
      } else {
        // console.log('官方');
      }

      Taro.hideLoading();
      setLoading(false);
      // console.log('最终 ' + JSON.stringify(message));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error);
    }
  };

  const handleScroll = (message: Message[]) =>
    useCallback(
      (event) => {
        const { scrollDirection, scrollOffset } = event.detail;
        if (
          !loading &&
          scrollDirection === 'forward' &&
          scrollOffset > (message.length - 5) * 120 + 5
        ) {
          fetchData();
        }
      },
      [loading, message.length]
    );

  useEffect(() => {
    void Taro.showLoading({
      title: '加载中',
    });
    setLoading(true);
    fetchData();
  }, [tab]);

  return (
    <View className="flex h-screen w-full flex-col items-center gap-4 overflow-y-scroll px-4 pb-[13vh] pt-2">
      <TabBar tab={tab} setTab={setTab} />
      {tab === '提问' && (
        <VirtualList
          height="100%"
          width="100%"
          item={MessageItem}
          itemData={commentMessage}
          itemCount={commentMessage.length}
          itemSize={120}
          onScroll={handleScroll(commentMessage)}
        />
      )}
      {tab === '点赞' && (
        <VirtualList
          height="100%"
          width="100%"
          item={MessageItem}
          itemData={supportMessage}
          itemCount={supportMessage.length}
          itemSize={120}
          onScroll={handleScroll(supportMessage)}
        />
      )}
      {tab === '官方' && (
        <>
          <View className="flex w-full flex-col items-center gap-4">
            <View className="text-xs text-gray-500">07:25</View>
            <ImageOfficial title="评课活动要开始了" description="摘要" />
          </View>
          <View className="flex w-full flex-col items-center gap-4">
            <View className="text-xs text-gray-500">07:25</View>
            <AlertOfficial title="您在高等数学下方的评论违规，请注意您的发言" />
          </View>
        </>
      )}
    </View>
  );
});

export default Notification;
