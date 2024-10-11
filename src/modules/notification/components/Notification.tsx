/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useState } from 'react';

import { VirtualList } from '@/common/components';
import { get } from '@/common/utils/fetch';
import { formatIsoDate } from '@/common/utils/timeFormat';
import { getUserInfo } from '@/common/utils/userService';

import { MessageItem, OfficialItem } from './Items';
import TabBar from './TabBar';
import type { Message as MessageType } from './types';

const Notification: React.FC = memo(() => {
  const [tab, setTab] = useState<string>('提问');
  const [ctime, setCtime] = useState<number>(0);
  const [commentMessage, setCommentMessage] = useState<MessageType[]>([]);
  const [supportMessage, setSupportMessage] = useState<MessageType[]>([]);
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
        const comments = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Comment')
              .map((item) => JSON.parse(item.content))
          : [];
        setCommentMessage([
          ...commentMessage,
          ...(await personalItems(comments, 'Comment')),
        ]);
      } else if (tab === '点赞') {
        const supports = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Support')
              .map((item) => JSON.parse(item.content))
          : [];
        setSupportMessage([
          ...supportMessage,
          ...(await personalItems(supports, 'Support')),
        ]);
      } else {
        console.log('官方');
      }

      Taro.hideLoading();
      setLoading(false);
      // console.log('最终 ' + JSON.stringify(message));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error);
    }
  };

  const handleScroll = (message: MessageType[]) =>
    useCallback(
      (event) => {
        const { scrollDirection, scrollOffset } = event.detail;
        if (
          !loading &&
          scrollDirection === 'forward' &&
          scrollOffset > (message.length - 5) * 120 + 5
        ) {
          void fetchData();
        }
      },
      [loading, message.length]
    );

  useEffect(() => {
    void Taro.showLoading({
      title: '加载中',
    });
    setLoading(true);
    setCommentMessage([]);
    setSupportMessage([]);
    void fetchData();
  }, [tab]);

  return (
    <View className="flex h-screen w-full flex-col items-center gap-4 overflow-y-scroll px-4 pb-[13vh] pt-2">
      <TabBar tab={tab} setTab={setTab} />
      <VirtualList
        height="100%"
        width="100%"
        item={tab === '提问' || tab === '点赞' ? MessageItem : OfficialItem}
        itemData={tab === '提问' ? commentMessage : tab === '点赞' ? supportMessage : []}
        itemCount={
          tab === '提问'
            ? commentMessage.length
            : tab === '点赞'
              ? supportMessage.length
              : 1
        }
        itemSize={tab === '提问' || tab === '点赞' ? 120 : 300}
        onScroll={handleScroll(
          tab === '提问' ? commentMessage : tab === '点赞' ? supportMessage : []
        )}
      />
    </View>
  );
});

export default Notification;
